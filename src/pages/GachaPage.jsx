import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Gift, Sparkles, RotateCcw } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

export default function GachaPage() {
  const { user, token, refreshWallet } = useAuth();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Roll state
  const [rolling, setRolling] = useState(false);
  const [reward, setReward] = useState(null);
  const [selectedBox, setSelectedBox] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBoxes();
  }, []);

  const fetchBoxes = async () => {
    try {
      const res = await axios.get(`${API_URL}/randombox`);
      setBoxes(res.data.boxes);
    } catch (err) {
      console.error('Failed to fetch gacha boxes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoll = async (box) => {
    if (!user) return alert('กรุณาเข้าสู่ระบบก่อนสุ่ม');
    if (rolling) return;

    setSelectedBox(box);
    setReward(null);
    setError('');
    setRolling(true);

    try {
      const res = await axios.post(`${API_URL}/randombox/${box._id}/roll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Simulate suspense delay
      await new Promise(r => setTimeout(r, 1800));
      setReward(res.data.reward);
      if (refreshWallet) refreshWallet();
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setRolling(false);
    }
  };

  const closeResult = () => {
    setReward(null);
    setSelectedBox(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-4xl) 0' }}>
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>กำลังโหลดกล่องสุ่ม...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--space-2xl) 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <h1 style={{ fontSize: 'var(--fs-3xl)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Sparkles size={32} /> ระบบสุ่มของรางวัล (Gacha)
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          เลือกกล่องสุ่มที่ต้องการ แล้วกดสุ่มเพื่อรับรางวัลสุดพิเศษ! แต่ละกล่องมีของรางวัลและอัตราการดรอปแตกต่างกัน
        </p>
      </div>

      {/* Gacha Grid */}
      {boxes.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-4xl)', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '64px', marginBottom: '1rem' }}>📦</div>
          <h2 style={{ marginBottom: '0.5rem' }}>ยังไม่มีกล่องสุ่มในขณะนี้</h2>
          <p>แอดมินยังไม่ได้เพิ่มกล่องสุ่ม กรุณากลับมาใหม่ภายหลัง</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-xl)' }}>
          {boxes.map(box => (
            <div key={box._id} className="glass-card gacha-box-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Box Image */}
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid var(--border-color)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {box.imageUrl ? (
                  <img src={box.imageUrl} alt={box.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '72px' }}>🎰</div>
                )}
                <div style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: 'var(--color-primary)', color: '#fff',
                  padding: '4px 12px', borderRadius: '20px', fontWeight: '700',
                  fontSize: 'var(--fs-sm)', boxShadow: '0 2px 8px rgba(99,102,241,0.5)'
                }}>
                  {box.price} ฿ / รอบ
                </div>
              </div>

              {/* Box Info */}
              <div style={{ padding: 'var(--space-lg)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: 'var(--fs-xl)', color: '#fff' }}>{box.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginBottom: '1rem', flex: 1 }}>
                  {box.description || 'กล่องสุ่มพิเศษ พร้อมรางวัลมากมาย!'}
                </p>

                {/* Rewards preview */}
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '0.5rem', fontWeight: '600' }}>
                    🎁 รางวัลในกล่อง ({box.rewards?.length || 0} ชิ้น)
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(box.rewards || []).slice(0, 5).map((r, i) => (
                      <span key={i} style={{
                        background: 'rgba(255,255,255,0.08)', padding: '2px 8px',
                        borderRadius: '4px', fontSize: '11px', color: 'var(--text-muted)'
                      }}>
                        {r.name}
                      </span>
                    ))}
                    {(box.rewards?.length || 0) > 5 && (
                      <span style={{ fontSize: '11px', color: 'var(--color-primary)' }}>
                        +{box.rewards.length - 5} อื่นๆ
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '700' }}
                  onClick={() => handleRoll(box)}
                  disabled={rolling}
                >
                  <Gift size={18} /> {rolling && selectedBox?._id === box._id ? 'กำลังสุ่ม...' : `สุ่มเลย (${box.price} ฿)`}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Roll Result Modal */}
      {(reward || error) && (
        <div className="modal-overlay" onClick={closeResult} style={{ zIndex: 9999 }}>
          <div className="modal gacha-result-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
            {error ? (
              <div style={{ padding: 'var(--space-2xl)' }}>
                <div style={{ fontSize: '64px', marginBottom: '1rem' }}>❌</div>
                <h2 style={{ color: 'var(--color-danger)', marginBottom: '0.5rem' }}>สุ่มไม่สำเร็จ!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
                <button className="btn btn-secondary" onClick={closeResult}>ปิด</button>
              </div>
            ) : (
              <div style={{ padding: 'var(--space-2xl)' }}>
                <div style={{
                  fontSize: '14px', color: 'var(--text-muted)', marginBottom: '0.5rem',
                  textTransform: 'uppercase', letterSpacing: '2px'
                }}>
                  🎉 คุณได้รับ 🎉
                </div>

                {reward.imageUrl ? (
                  <div style={{
                    width: '150px', height: '150px', margin: '1rem auto',
                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                    border: '3px solid var(--color-accent)',
                    boxShadow: '0 0 30px rgba(245,158,11,0.4)',
                    animation: 'gacha-pop 0.5s cubic-bezier(0.16,1,0.3,1)'
                  }}>
                    <img src={reward.imageUrl} alt={reward.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{
                    fontSize: '80px', margin: '1rem 0',
                    animation: 'gacha-pop 0.5s cubic-bezier(0.16,1,0.3,1)'
                  }}>
                    🎁
                  </div>
                )}

                <h2 style={{
                  color: 'var(--color-accent)', fontSize: 'var(--fs-2xl)',
                  marginBottom: '0.5rem', textShadow: '0 0 15px rgba(245,158,11,0.3)'
                }}>
                  {reward.name}
                </h2>
                {reward.description && (
                  <p style={{ color: 'var(--color-primary)', fontSize: 'var(--fs-md)', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {reward.description}
                  </p>
                )}
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginBottom: '1.5rem' }}>
                  จากกล่อง: {selectedBox?.name}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button className="btn btn-primary" onClick={() => { closeResult(); handleRoll(selectedBox); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RotateCcw size={16} /> สุ่มอีกครั้ง
                  </button>
                  <button className="btn btn-secondary" onClick={closeResult}>ปิด</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
