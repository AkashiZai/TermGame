import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowLeft, Loader, AlertCircle, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, refreshWallet } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('form'); // form | success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [formData, setFormData] = useState({
    robloxUsername: '',
    lineId: '',
    note: '',
  });

  // Pre-fill if user logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        robloxUsername: user.robloxUsername || '',
        lineId: user.lineId || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
      return;
    }

    if (!formData.robloxUsername || !formData.lineId) {
      setError('กรุณากรอกชื่อผู้ใช้ Roblox และ LINE ID');
      return;
    }

    if (user.balance < totalPrice) {
      setError('ยอดเงินไม่เพียงพอ กรุณาเติมเงิน');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/orders`, {
        items,
        total: totalPrice,
        ...formData,
      });

      if (res.data.success) {
        setOrderId(res.data.order._id || res.data.order.id);
         await refreshWallet(); // update balance
        clearCart();
        setStep('success');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step === 'form') {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-4xl) 0', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: 'var(--space-lg)' }}>🛒</div>
        <h2 style={{ marginBottom: 'var(--space-md)' }}>ตะกร้าว่างเปล่า</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-xl)' }}>เลือกสินค้าที่คุณต้องการก่อนสั่งซื้อ</p>
        <Link to="/shop" className="btn btn-primary">ไปหน้าสินค้า</Link>
      </div>
    );
  }

  // ===== SUCCESS STEP =====
  if (step === 'success') {
    return (
      <div className="success-page">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="glass-card" style={{ padding: 'var(--space-3xl)' }}>
            <div className="success-icon"><CheckCircle size={40} /></div>
            <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 'var(--space-md)', textAlign: 'center' }}>สั่งซื้อสำเร็จ! 🎉</h1>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
              ชำระเงินเรียบร้อยแล้วตัดจากกระเป๋าเงิน! ทีมงานจะดำเนินการส่งสินค้าให้เร็วที่สุด
            </p>

            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)', textAlign: 'center'
            }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-xs)' }}>หมายเลขออเดอร์</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--fs-2xl)', fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '2px' }}>
                {orderId}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://line.me/ti/p/~day_pisit" target="_blank" rel="noopener noreferrer" className="btn btn-primary">💬 ติดต่อ LINE</a>
              <Link to="/order-status" className="btn btn-secondary">เช็คสถานะออเดอร์</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== FORM STEP =====
  return (
    <div className="container checkout-page">
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <Link to="/shop" style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--fs-sm)' }}>
          <ArrowLeft size={16} /> กลับไปเลือกสินค้า
        </Link>
      </div>

      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: 'var(--space-2xl)' }}>สั่งซื้อสินค้า</h1>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)',
          color: 'var(--color-danger)', fontSize: 'var(--fs-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)'
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Must login check */}
      {!user ? (
        <div className="glass-card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-accent)', margin: '0 auto var(--space-md)' }} />
          <h2>เข้าสู่ระบบเพื่อสั่งซื้อ</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-xl)', marginTop: 'var(--space-sm)' }}>คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถทำรายการได้</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary">เข้าสู่ระบบ</Link>
            <Link to="/register" className="btn btn-secondary">สมัครสมาชิก</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="checkout-grid">
            {/* Form */}
            <div>
              <div className="glass-card checkout-form-section" style={{ marginBottom: 'var(--space-xl)' }}>
                <h2><CreditCard size={22} /> ข้อมูลการสั่งซื้อ</h2>

                <div className="form-group">
                  <label className="input-label">ชื่อผู้ใช้ Roblox *</label>
                  <input type="text" name="robloxUsername" className="input-field" placeholder="กรอกชื่อผู้ใช้ Roblox ของคุณ" value={formData.robloxUsername} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="input-label">LINE ID *</label>
                  <input type="text" name="lineId" className="input-field" placeholder="LINE ID ของคุณ" value={formData.lineId} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="input-label">หมายเหตุ (ไม่บังคับ)</label>
                  <textarea name="note" className="input-field" placeholder="ข้อความเพิ่มเติม เช่น ผลไม้ที่ต้องการ" rows="3" value={formData.note} onChange={handleChange} style={{ resize: 'vertical' }} />
                </div>
              </div>

              {/* Wallet Info instead of Payment Selector */}
              <div className="glass-card checkout-form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                  <h2 style={{ marginBottom: 0 }}><Wallet size={22} /> ชำระด้วย Wallet</h2>
                  <span style={{ fontSize: 'var(--fs-xl)', fontWeight: '700', color: 'var(--color-primary)' }}>{user.balance?.toLocaleString()} ฿</span>
                </div>
                
                {user.balance < totalPrice ? (
                   <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)'}}>
                     <p style={{ marginBottom: 'var(--space-sm)' }}><AlertCircle size={16} style={{ display:'inline', verticalAlign:'middle'}}/> ยอดเงินของคุณไม่เพียงพอ ขาดอีก {(totalPrice - user.balance).toLocaleString()} ฿</p>
                     <Link to="/topup" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>ไปหน้าเติมเงิน</Link>
                   </div>
                ) : (
                   <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500'}}>
                     <CheckCircle size={16} /> ยอดเงินเพียงพอสำหรับการสั่งซื้อ
                   </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card checkout-summary">
              <h2>สรุปคำสั่งซื้อ</h2>
              {items.map((item) => (
                <div className="checkout-summary-item" key={item.id}>
                  <span>{item.emoji} {item.name} x{item.quantity}</span>
                  <span style={{ color: 'var(--color-accent)', fontWeight: '600' }}>{(item.price * item.quantity).toLocaleString()} ฿</span>
                </div>
              ))}
              <div className="checkout-summary-total">
                <span>ราคารวม</span>
                <span className="amount">{totalPrice.toLocaleString()} ฿</span>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading || user.balance < totalPrice}>
                {loading ? <><Loader size={20} className="spin-icon" /> กำลังดำเนินการ...</> : <><CheckCircle size={20} /> ชำระเงินด้วย Wallet</>}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
