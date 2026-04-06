import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Settings, DollarSign, ShoppingBag, Gift, Package, Ticket, LogOut, Eye, ArrowLeft } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  // States for fetching
  const [transactions, setTransactions] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [randomHistory, setRandomHistory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // States for forms
  const [editUser, setEditUser] = useState({ email: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'profile');
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEditUser({ email: user.email });
    
    // Fetch user data
    axios.get(`${API_URL}/transactions/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTransactions(res.data.transactions))
      .catch(console.error);

    axios.get(`${API_URL}/orders/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setMyOrders(res.data.orders))
      .catch(console.error);
      
    axios.get(`${API_URL}/randomhistory/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRandomHistory(res.data.history))
      .catch(console.error);
  }, [user, token, navigate]);

  const handleTabChange = (tabId) => {
    if (tabId === 'logout') {
      logout();
      navigate('/');
      return;
    }
    navigate(`/profile?tab=${tabId}`);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/auth/me`, editUser, { headers: { Authorization: `Bearer ${token}` } });
      alert('บันทึกข้อมูลเรียบร้อยแล้ว, กรุณารีเฟรชเพื่อดูการเปลี่ยนแปลง');
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return alert('รหัสผ่านใหม่ไม่ตรงกัน!');
    }
    try {
      await axios.put(`${API_URL}/auth/password`, { oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      alert('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาดรหัสผ่าน');
    }
  };

  const tabs = [
    { id: 'profile', label: 'โปรไฟล์', icon: <User size={16} /> },
    { id: 'settings', label: 'การตั้งค่าผู้ใช้', icon: <Settings size={16} /> },
    { id: 'topup-history', label: 'ประวัติเติมเงิน', icon: <DollarSign size={16} /> },
    { id: 'purchase-history', label: 'ประวัติการซื้อสินค้า', icon: <ShoppingBag size={16} /> },
    { id: 'random-history', label: 'ประวัติการสุ่มสินค้า', icon: <Gift size={16} /> },
    { id: 'order-list', label: 'รายการสั่งซื้อ', icon: <Package size={16} /> },
    { id: 'coupons', label: 'ระบบคูปอง', icon: <Ticket size={16} /> },
    { id: 'logout', label: 'ออกจากระบบ', icon: <LogOut size={16} /> },
  ];

  if (!user) return null;

  return (
    <div className="container" style={{ padding: 'var(--space-2xl) 0' }}>
      
      {/* Header Info */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <User size={28} /> {tabs.find(t => t.id === activeTab)?.label}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>ข้อมูลบัญชีผู้ใช้ของคุณ</p>
      </div>

      {/* Tabs Menu */}
      <div className="profile-tabs" style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '10px', marginBottom: 'var(--space-xl)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
               display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap',
               background: activeTab === tab.id ? 'var(--color-danger)' : 'var(--bg-card)',
               color: activeTab === tab.id ? '#fff' : 'var(--text-main)',
               border: `1px solid ${activeTab === tab.id ? 'var(--color-danger)' : 'var(--border-color)'}`,
               borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
               padding: '0.75rem 1.25rem',
               opacity: activeTab === tab.id ? 1 : 0.8
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="glass-card profile-content" style={{ padding: 'var(--space-xl)', background: 'var(--bg-card)', minHeight: '60vh', borderTopLeftRadius: 0 }}>
        
        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
               <div style={{ width: '60px', height: '60px', background: 'var(--color-danger)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                 {user.username.charAt(0).toUpperCase()}
               </div>
               <div>
                  <h2 style={{ margin: 0, color: 'var(--text-main)' }}>{user.username}</h2>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>{user.email}</p>
               </div>
               <button onClick={() => navigate('/profile?tab=settings')} className="btn btn-danger btn-sm" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Settings size={14} /> แก้ไข
               </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
               <div style={{ border: '1px solid var(--border-color)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                 <p style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '14px' }}>ชื่อผู้ใช้งาน</p>
                 <strong style={{ fontSize: '18px' }}>{user.username}</strong>
               </div>
               <div style={{ border: '1px solid var(--border-color)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                 <p style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '14px' }}>อีเมล</p>
                 <strong style={{ fontSize: '18px' }}>{user.email}</strong>
               </div>
               <div style={{ border: '1px solid var(--border-color)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                 <p style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '14px' }}>ยอดเงินคงเหลือ</p>
                 <strong style={{ fontSize: '18px', color: 'var(--color-primary)' }}>{user.balance?.toLocaleString()} บาท</strong>
               </div>
               <div style={{ border: '1px solid var(--border-color)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                 <p style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '14px' }}>ระดับผู้ใช้</p>
                 <strong style={{ fontSize: '18px', textTransform: 'uppercase' }}>{user.role}</strong>
               </div>
            </div>
          </div>
        )}

        {/* Tab 2: Settings */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-xl)' }}>
            
            {/* Email Edit */}
            <div style={{ border: '1px solid var(--border-color)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-md)' }}>
               <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>แก้ไขข้อมูลส่วนตัว / Edit Profile</h3>
               <form onSubmit={handleUpdateProfile}>
                 <div className="form-group">
                   <label>ชื่อผู้ใช้งาน / Username (ไม่อนุญาตให้เปลี่ยน)</label>
                   <input type="text" className="input-field" value={user.username} readOnly disabled style={{ opacity: 0.7 }} />
                 </div>
                 <div className="form-group">
                   <label>อีเมล / Email</label>
                   <input type="email" className="input-field" value={editUser.email} onChange={e => setEditUser({...editUser, email: e.target.value})} required />
                 </div>
                 <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>เปลี่ยนอีเมล</button>
               </form>
            </div>

            {/* Password Edit */}
            <div style={{ border: '1px solid var(--border-color)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-md)' }}>
               <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>เปลี่ยนรหัสผ่าน / Change Password</h3>
               <form onSubmit={handleChangePassword}>
                 <div className="form-group">
                   <label>รหัสผ่านปัจจุบัน / Current Password</label>
                   <input type="password" className="input-field" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} required />
                 </div>
                 <div className="form-group">
                   <label>รหัสผ่านใหม่ / New Password</label>
                   <input type="password" className="input-field" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} required />
                 </div>
                 <div className="form-group">
                   <label>รหัสผ่านใหม่อีกครั้ง / Repeat New Password</label>
                   <input type="password" className="input-field" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} required />
                 </div>
                 <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>เปลี่ยนรหัสผ่าน</button>
               </form>
            </div>
            
          </div>
        )}

        {/* Tab 3: Topup History */}
        {activeTab === 'topup-history' && (
          <div className="animate-fade-in-up">
            <h3 style={{ marginBottom: '1rem' }}>ประวัติการเติมเงิน</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>วันที่เติมเงิน</th>
                    <th>แพลตฟอร์ม</th>
                    <th>เลขอ้างอิง</th>
                    <th>ยอดเงิน (฿)</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>ไม่พบข้อมูลที่คุณต้องการ</td></tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx._id}>
                        <td>{new Date(tx.createdAt).toLocaleString('th-TH')}</td>
                        <td>TRUEWALLET</td>
                        <td>{tx.referenceNo}</td>
                        <td style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>+{tx.amount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabs 4 & 6: Order List */}
        {(activeTab === 'purchase-history' || activeTab === 'order-list') && (
          <div className="animate-fade-in-up" relative>
            {selectedOrder ? (
               <div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedOrder(null)} style={{ marginBottom: 'var(--space-md)' }}>
                    <ArrowLeft size={16} /> กลับไปยังรายการสั่งซื้อ
                  </button>
                  <div style={{ padding: 'var(--space-lg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <h2 style={{ fontSize: 'var(--fs-xl)', color: 'var(--color-primary)' }}>ออเดอร์ {selectedOrder._id.substring(18, 24).toUpperCase()}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>สถานะ: {selectedOrder.status.toUpperCase()}</p>
                    <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                       {selectedOrder.items?.map(it => (
                         <li key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                            <span>{it.name} (x{it.quantity})</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--color-accent)' }}>{(it.price * it.quantity)} ฿</span>
                         </li>
                       ))}
                    </ul>
                    <h3 style={{ textAlign: 'right', marginTop: '1rem', color: 'var(--color-primary)' }}>รวม: {selectedOrder.totalAmount || selectedOrder.total} ฿</h3>
                  </div>
               </div>
            ) : (
              <>
                <h3 style={{ marginBottom: '1rem' }}>ประวัติการสั่งซื้อของคุณ</h3>
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
                      {myOrders.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>ไม่พบข้อมูลที่คุณต้องการ</td></tr>
                      ) : (
                        myOrders.map(o => (
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
                              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedOrder(o)}>
                                <Eye size={14} /> รายละเอียด
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 5: Random History */}
        {activeTab === 'random-history' && (
          <div className="animate-fade-in-up">
            <h3 style={{ marginBottom: '1rem' }}>ประวัติการสุ่มสินค้า</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>วันที่สุ่ม</th>
                    <th>กล่องสุ่ม</th>
                    <th>ราคา</th>
                    <th>ของรางวัลที่กดได้</th>
                  </tr>
                </thead>
                <tbody>
                  {randomHistory.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>ไม่พบข้อมูลประวัติการสุ่มกาชาของคุณ</td></tr>
                  ) : (
                    randomHistory.map((h) => (
                      <tr key={h._id}>
                        <td>{new Date(h.createdAt).toLocaleString('th-TH')}</td>
                        <td>{h.boxName}</td>
                        <td style={{ color: 'var(--color-danger)' }}>-{h.cost} ฿</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {h.rewardImage && <img src={h.rewardImage} width={30} height={30} style={{ borderRadius: '4px', objectFit: 'cover' }} />}
                            <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{h.rewardName}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Placeholders for unused tabs */}
        {(activeTab === 'coupons') && (
           <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: 'var(--space-4xl) 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>🚧</div>
              <h3>ระบบกำลังพัฒนา</h3>
              <p>ระบบนี้จะเปิดให้บริการในอนาคต</p>
           </div>
        )}
        
      </div>
    </div>
  );
}
