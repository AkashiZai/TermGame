import { useState, useEffect } from 'react';
import { Search, Package, List, Eye, ArrowLeft } from 'lucide-react';

import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3001/api';

export default function OrderStatusPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    if (user && token) {
      axios.get(`${API_URL}/orders/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setMyOrders(res.data.orders))
        .catch(console.error);
    }
  }, [user, token]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSearched(true);
    setLoading(true);
    setOrder(null);

    const trimmedId = orderId.trim();

    try {
      if (!token) throw new Error('No token');
      const res = await axios.get(`${API_URL}/orders/${trimmedId}`);
      if (res.data.order) {
        setOrder(res.data.order);
        setLoading(false);
        return;
      }
    } catch (e) {
      // Fall through to error
    }

    // Fallback to localStorage
    const storedOrder = localStorage.getItem(`order_${trimmedId}`);
    if (storedOrder) {
      setOrder(JSON.parse(storedOrder));
    } else {
      setError('ไม่พบออเดอร์นี้ กรุณาตรวจสอบหมายเลขออเดอร์อีกครั้ง');
    }
    setLoading(false);
  };

  const statusSteps = [
    { key: 'pending', label: 'รอการชำระเงิน', desc: 'กรุณาติดต่อ LINE หรือส่งลิงก์อั่งเปาเพื่อชำระเงิน' },
    { key: 'paid', label: 'ชำระเงินแล้ว', desc: 'ได้รับการชำระเงินเรียบร้อย' },
    { key: 'processing', label: 'กำลังดำเนินการ', desc: 'ทีมงานกำลังจัดส่งสินค้า' },
    { key: 'completed', label: 'เสร็จสิ้น', desc: 'ส่งมอบสินค้าเรียบร้อยแล้ว' },
  ];

  const getStatusIndex = (status) => {
    return statusSteps.findIndex((s) => s.key === status);
  };

  return (
    <div className="container order-status-page">
      <div className="shop-header">
        <h1 className="section-title">เช็คสถานะออเดอร์</h1>
        <p className="section-subtitle">กรอกหมายเลขออเดอร์เพื่อตรวจสอบสถานะ</p>
      </div>

      <div className="order-status-search">
        <form onSubmit={handleSearch}>
          <div className="form-group" style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <input
              type="text"
              className="input-field"
              placeholder="กรอกหมายเลขออเดอร์ เช่น ZB-XXXXXX"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              id="order-search-input"
            />
            <button type="submit" className="btn btn-primary" disabled={loading} id="order-search-btn">
              <Search size={18} />
              ค้นหา
            </button>
          </div>
        </form>
      </div>

      {/* Logged in History Table */}
      {user && myOrders.length > 0 && !order && (
        <div className="glass-card" style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-md)' }}>
            <List size={20} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>ประวัติคำสั่งซื้อของคุณ</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ออเดอร์ ID</th>
                  <th>วันที่สั่งซื้อ</th>
                  <th>ยอดชำระ</th>
                  <th>สถานะ</th>
                  <th>ดูรายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map(o => (
                  <tr key={o._id}>
                    <td><b>{o._id.substring(18, 24).toUpperCase()}</b></td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleString('th-TH')}</td>
                    <td style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{o.totalAmount || o.total} ฿</td>
                    <td>
                      {o.status === 'pending' && <span className="badge badge-warning">รอชำระเงิน</span>}
                      {o.status === 'paid' && <span className="badge badge-primary">ชำระแล้ว</span>}
                      {o.status === 'processing' && <span className="badge badge-info">กำลังดำเนินการ</span>}
                      {o.status === 'completed' && <span className="badge badge-success">เสร็จสิ้น</span>}
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setOrder(o)}>
                        <Eye size={14} /> รายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', color: 'var(--color-danger)', marginBottom: 'var(--space-xl)' }}>
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>
          กำลังค้นหา...
        </div>
      )}

      {order && (
        <div className="glass-card order-result animate-fade-in-up" style={{ position: 'relative' }}>
          {user && (
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => { setOrder(null); setOrderId(''); }} 
              style={{ position: 'absolute', top: 'var(--space-md)', left: 'var(--space-md)' }}
            >
              <ArrowLeft size={16} /> กลับ
            </button>
          )}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)', marginTop: 'var(--space-lg)' }}>
            <Package size={36} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }} />
            <h2 style={{ fontSize: 'var(--fs-xl)' }}>ออเดอร์ {order.id || order._id}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>
              สั่งซื้อเมื่อ: {new Date(order.createdAt).toLocaleString('th-TH')}
            </p>
          </div>

          {/* Paid amount */}
          {order.status !== 'pending' && order.status !== 'cancelled' && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)',
              marginBottom: 'var(--space-xl)',
              textAlign: 'center',
              color: 'var(--color-success)',
              fontSize: 'var(--fs-sm)',
              fontWeight: '600',
            }}>
              ✅ ชำระแล้วผ่าน Wallet 
            </div>
          )}

          {/* Status Timeline */}
          <div className="status-timeline" style={{ marginBottom: 'var(--space-2xl)' }}>
            {statusSteps.map((step, i) => {
              const currentIndex = getStatusIndex(order.status);
              const isCompleted = i <= currentIndex;
              const isActive = i === currentIndex;

              return (
                <div
                  key={step.key}
                  className={`status-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                >
                  <div className="status-dot"></div>
                  <h4 style={{ color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {step.label}
                  </h4>
                  <p>{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Order Items */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: 'var(--fs-base)', marginBottom: 'var(--space-md)' }}>สินค้าในออเดอร์</h3>
            {order.items?.map((item) => (
              <div key={item.id} className="checkout-summary-item">
                <span>{item.emoji} {item.name} x{item.quantity}</span>
                <span style={{ color: 'var(--color-accent)', fontWeight: '600' }}>
                  {(item.price * item.quantity).toLocaleString()} ฿
                </span>
              </div>
            ))}
            <div className="checkout-summary-total">
              <span>ราคารวม</span>
              <span className="amount">{order.totalAmount?.toLocaleString() || order.total?.toLocaleString()} ฿</span>
            </div>
          </div>

          {order.status === 'pending' && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
              <a
                href="https://line.me/ti/p/~day_pisit"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                💬 ติดต่อ LINE ชำระเงิน
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
