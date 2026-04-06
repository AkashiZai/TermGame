import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Gift, AlertCircle, CheckCircle, Loader, Wallet, Clock, History } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export default function TopupPage() {
  const { user, refreshWallet } = useAuth();
  const [voucherUrl, setVoucherUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}/transactions/me`);
      setTransactions(res.data.transactions);
    } catch (e) {
      console.error("Failed to load history");
    }
  };

  const handleTopup = async () => {
    if (!voucherUrl.trim()) {
      setError('กรุณากรอกลิงก์อั่งเปา');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await axios.post(`${API_URL}/wallet/topup`, { voucherUrl: voucherUrl.trim() });
      const data = res.data;

      if (data.status === 'SUCCESS') {
        setSuccessMsg(data.message);
        setVoucherUrl('');
        await refreshWallet(); // Update user balance in AuthContext
        fetchTransactions(); // Refresh history immediately
      } else {
        setError(data.reason || 'ไม่สามารถเติมเงินได้');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('กรุณาเข้าสู่ระบบก่อนเติมเงิน');
      } else if (err.response?.status === 429) {
        setError('ทำรายการบ่อยเกินไป กรุณารอสักครู่');
      } else {
        setError(err.response?.data?.error || err.response?.data?.reason || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: 'var(--space-4xl) 0', textAlign: 'center' }}>
        <h2>กรุณาเข้าสู่ระบบก่อนเติมเงิน</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--space-4xl) 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-3xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <Wallet size={48} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }} />
          <h1 style={{ fontSize: 'var(--fs-2xl)' }}>เติมเงินเข้าสู่ระบบ</h1>
          <p style={{ color: 'var(--text-muted)' }}>ยอดเงินคงเหลือปัจจุบัน: <strong style={{ color: 'var(--color-accent)' }}>{user.balance?.toLocaleString()} ฿</strong></p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)',
            color: 'var(--color-danger)', fontSize: 'var(--fs-sm)', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)',
            color: 'var(--color-success)', fontSize: 'var(--fs-sm)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'
          }}>
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
          <label className="input-label"><Gift size={16} /> ลิงก์อั่งเปา TrueMoney / โค้ดส่วนลด</label>
          <input
            type="text"
            className="input-field"
            placeholder="เช่น https://gift.truemoney..."
            value={voucherUrl}
            onChange={(e) => setVoucherUrl(e.target.value)}
            disabled={loading}
          />
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
            สามารถวางลิงก์อั่งเปา TrueMoney หรือกรอกโค้ดกิจกรรมจากทางร้านได้
          </p>
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
          onClick={handleTopup}
          disabled={loading || !voucherUrl.trim()}
        >
          {loading ? (
            <><Loader size={20} className="spin-icon" /> กำลังตรวจสอบ...</>
          ) : (
            <><Gift size={20} /> ยืนยันการเติมเงิน</>
          )}
        </button>
      </div>

      {/* History Section */}
      <div className="glass-card" style={{ width: '100%', maxWidth: '800px', padding: 'var(--space-2xl)', marginTop: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-xl)' }}>
          <History size={24} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: 'var(--fs-xl)', margin: 0 }}>ประวัติการเติมเงิน</h2>
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>
            <Clock size={48} style={{ margin: '0 auto', marginBottom: 'var(--space-md)', opacity: 0.5 }} />
            <p>ยังไม่มีประวัติการเติมเงิน</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>วันที่ / เวลา</th>
                  <th>รายละเอียด</th>
                  <th>จำนวนเงิน (฿)</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {new Date(tx.createdAt).toLocaleString('th-TH')}
                    </td>
                    <td>
                      {tx.note}<br />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ref: {tx.reference}</span>
                    </td>
                    <td style={{ color: tx.status === 'success' ? 'var(--color-success)' : 'inherit', fontWeight: 'bold' }}>
                      {tx.status === 'success' ? `+ ${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                    </td>
                    <td>
                      {tx.status === 'success' ? (
                        <span className="badge badge-success">สำเร็จ</span>
                      ) : (
                        <span className="badge badge-danger">ล้มเหลว</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
