import { useState, useEffect } from 'react';
import { Package, ShoppingCart, DollarSign, Users, Plus, Edit2, Trash2, X, Save, Gift, MessageSquare, Folder, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export default function AdminPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [randomBoxes, setRandomBoxes] = useState([]);
  
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'product', 'voucher', 'banner'

  // Refetch data triggers
  const [refreshKey, setRefreshKey] = useState(0);

  // Fallback standalone login if the token wasn't grabbed yet or it was old admin code. 
  // For V3 we just use normal user auth. If user.role !== 'admin', we just show access denied.

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user, refreshKey]);

  const fetchAdminData = async () => {
    try {
    const [prodRes, orderRes, vouchRes, banRes, catRes, randomRes] = await Promise.all([
      axios.get(`${API_URL}/admin/products`),
      axios.get(`${API_URL}/admin/orders`),
      axios.get(`${API_URL}/admin/vouchers`),
      axios.get(`${API_URL}/admin/banners`),
      axios.get(`${API_URL}/admin/categories`),
      axios.get(`${API_URL}/admin/randombox`),
    ]);
    setProducts(prodRes.data.products);
    setOrders(orderRes.data.orders);
    setVouchers(vouchRes.data.vouchers);
    setBanners(banRes.data.banners);
    setCategories(catRes.data.categories);
    setRandomBoxes(randomRes.data.boxes);
  } catch (error) {
      console.error("Failed to load admin data", error);
      alert("Failed to load data. See console.");
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-4xl) 0' }}>
        <h2>เข้าถึงไม่ได้ กรุณาเข้าสู่ระบบด้วยบัญชี Admin</h2>
      </div>
    );
  }

  // ===== Handlers =====
  const handleDeleteProduct = async (id) => {
    if (confirm('ลบสินค้านี้?')) {
      await axios.delete(`${API_URL}/admin/products/${id}`);
      setRefreshKey(r => r + 1);
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    await axios.put(`${API_URL}/admin/orders/${id}`, { status });
    setRefreshKey(r => r + 1);
  };

  const handleDeleteVoucher = async (id) => {
    if (confirm('ลบ Voucher นี้?')) {
      await axios.delete(`${API_URL}/admin/vouchers/${id}`);
      setRefreshKey(r => r + 1);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (confirm('ลบ Banner / Announcement นี้?')) {
      await axios.delete(`${API_URL}/admin/banners/${id}`);
      setRefreshKey(r => r + 1);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (confirm('ลบหมวดหมู่นี้?')) {
      await axios.delete(`${API_URL}/admin/categories/${id}`);
      setRefreshKey(r => r + 1);
    }
  };

  const handleDeleteRandomBox = async (id) => {
    if (confirm('ลบกล่องสุ่มนี้?')) {
      await axios.delete(`${API_URL}/admin/randombox/${id}`);
      setRefreshKey(r => r + 1);
    }
  };

  const handleSaveModal = async (endpoint, data, isEdit) => {
    try {
      if (isEdit && data._id) {
        await axios.put(`${API_URL}/admin/${endpoint}/${data._id || data.id}`, data);
      } else {
        await axios.post(`${API_URL}/admin/${endpoint}`, data);
      }
      setModalType(null);
      setEditingItem(null);
      setRefreshKey(r => r + 1);
    } catch (e) {
      alert("Error saving: " + e.response?.data?.error || e.message);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check size limit (e.g., 5MB limit for safety, though backend accepts 50MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingItem({ ...editingItem, imageUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    totalRevenue: orders.filter((o) => o.status === 'paid' || o.status === 'completed').reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0),
  };

  const statusLabels = { pending: 'รอชำระ', paid: 'ชำระแล้ว', processing: 'ดำเนินการ', completed: 'เสร็จสิ้น' };

  return (
    <div className="container admin-page">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>🔧 ZaiBux Administrator Console</h1>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={18} /> กลับไปหน้าร้านค้า
        </Link>
      </div>

      <div className="admin-stats">
        <div className="glass-card admin-stat-card"><Package size={24} style={{ color: 'var(--color-primary)' }} /><div className="stat-value">{stats.totalProducts}</div><div className="stat-label">สินค้าทั้งหมด</div></div>
        <div className="glass-card admin-stat-card"><ShoppingCart size={24} style={{ color: 'var(--color-accent)' }} /><div className="stat-value">{stats.totalOrders}</div><div className="stat-label">ออเดอร์ทั้งหมด</div></div>
        <div className="glass-card admin-stat-card"><Users size={24} style={{ color: 'var(--color-secondary-hover)' }} /><div className="stat-value">{stats.pendingOrders}</div><div className="stat-label">รอชำระเงิน</div></div>
        <div className="glass-card admin-stat-card"><DollarSign size={24} style={{ color: 'var(--color-success)' }} /><div className="stat-value">{stats.totalRevenue.toLocaleString()}</div><div className="stat-label">รายได้รวม (฿)</div></div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 แดชบอร์ด</button>
        <button className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>📦 จัดการสินค้า</button>
        <button className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>🗂️ หมวดหมู่</button>
        <button className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>🛒 ออเดอร์ลูกค้า</button>
        <button className={`admin-tab ${activeTab === 'vouchers' ? 'active' : ''}`} onClick={() => setActiveTab('vouchers')}>🎁 โค้ดส่วนลด</button>
        <button className={`admin-tab ${activeTab === 'banners' ? 'active' : ''}`} onClick={() => setActiveTab('banners')}>📢 แบนเนอร์/ประกาศ</button>
        <button className={`admin-tab ${activeTab === 'random' ? 'active' : ''}`} onClick={() => setActiveTab('random')}>🎰 ระบบสุ่ม</button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
          <h2>📊 โหมดจัดการร้านค้า (Dynamic Data System)</h2>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>ระบบตอนนี้ควบคุมสินค้า, โค้ดส่วนลด (Vouchers) และประกาศ (Banners) ได้ 100% จากฐานข้อมูล MongoDB โดยไม่ต้องแก้โค้ด!</p>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="glass-card" style={{ padding: 'var(--space-xl)', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xl)' }}>
            <h2>จัดการสินค้า</h2>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditingItem({ name: '', description: '', price: 0, stock: -1, category: 'robux', emoji: '💎', imageUrl: '', badge: '', features: [] }); setModalType('products'); }}>
              <Plus size={16} /> สร้างสินค้าคอลูกค้า
            </button>
          </div>
          <table className="admin-table">
            <thead><tr><th>Image</th><th>สินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>สต็อก</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontSize: '24px' }}>
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ height: '30px', width: '30px', objectFit: 'cover', borderRadius: '4px' }} /> : p.emoji}
                  </td>
                  <td>{p.name}</td>
                  <td>{categories.find(c => c.id === p.category)?.name || p.category}</td>
                  <td style={{ color: 'var(--color-accent)' }}>{p.price.toLocaleString()} ฿</td>
                  <td>{p.stock === -1 ? '∞' : p.stock}</td>
                  <td>{p.isActive ? 'เปิดขาย' : 'ซ่อน'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingItem(p); setModalType('products'); }}><Edit2 size={14} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(p._id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="glass-card" style={{ padding: 'var(--space-xl)', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xl)' }}>
            <h2>จัดการหมวดหมู่</h2>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditingItem({ id: '', name: '', description: '', imageUrl: '', color: 'primary' }); setModalType('categories'); }}>
              <Folder size={16} /> สร้างหมวดหมู่
            </button>
          </div>
          <table className="admin-table">
            <thead><tr><th>Image</th><th>หมวดหมู่ (ID)</th><th>สถานะสี</th><th>รายละเอียด</th><th>จัดการ</th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontSize: '24px' }}>
                    {c.imageUrl ? <img src={c.imageUrl} alt={c.name} style={{ height: '30px', objectFit: 'cover' }} /> : '📦'}
                  </td>
                  <td><b>{c.name}</b> <br/><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {c.id}</span></td>
                  <td><span className={`badge badge-${c.color}`}>{c.color}</span></td>
                  <td>{c.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingItem(c); setModalType('categories'); }}><Edit2 size={14} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCategory(c._id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="glass-card" style={{ padding: 'var(--space-xl)', overflow: 'auto' }}>
          <h2 style={{ marginBottom: 'var(--space-xl)' }}>จัดการออเดอร์ลูกค้า</h2>
          <table className="admin-table">
            <thead><tr><th>ออเดอร์</th><th>User</th><th>สินค้าที่สั่งซื้อ</th><th>ยอดรวม</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontWeight: 'bold' }}>{o._id}</td>
                  <td>{o.user?.username || 'Unknown'} <br/><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Roblox: {o.robloxUsername}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                      {o.items?.map((item, idx) => (
                        <div key={idx}>{item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</div>
                      ))}
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-accent)' }}>{o.totalAmount?.toLocaleString()} ฿</td>
                  <td><span className="badge badge-primary">{statusLabels[o.status] || o.status}</span></td>
                  <td>
                    <select className="input-field" value={o.status} onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)} style={{ padding: '0.2rem', fontSize: '12px' }}>
                      <option value="pending">รอชำระ</option>
                      <option value="paid">ชำระแล้ว</option>
                      <option value="processing">ดำเนินการ</option>
                      <option value="completed">เสร็จสิ้น</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VOUCHERS TAB */}
      {activeTab === 'vouchers' && (
        <div className="glass-card" style={{ padding: 'var(--space-xl)', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xl)' }}>
            <h2>🎁 จัดการรหัสแจกเงิน (Discount/Wallet Codes)</h2>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditingItem({ code: '', rewardAmount: 50, maxUses: 1 }); setModalType('vouchers'); }}>
              <Gift size={16} /> สร้างโค้ดใหม่
            </button>
          </div>
          <table className="admin-table">
            <thead><tr><th>โค้ด</th><th>มูลค่าที่จะได้ (฿)</th><th>การใช้งาน</th><th>การจัดการ</th></tr></thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v._id}>
                  <td style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>{v.code}</td>
                  <td style={{ fontWeight: 'bold' }}>{v.rewardAmount} ฿</td>
                  <td>{v.currentUses} / {v.maxUses === 0 ? 'ไม่จำกัด' : v.maxUses}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteVoucher(v._id)}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* BANNERS TAB */}
      {activeTab === 'banners' && (
        <div className="glass-card" style={{ padding: 'var(--space-xl)', overflow: 'auto' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xl)' }}>
            <h2>📢 จัดการประกาศและแบนเนอร์</h2>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditingItem({ type: 'announcement', content: 'ประกาศใหม่' }); setModalType('banners'); }}>
              <MessageSquare size={16} /> เพิ่มประกาศ
            </button>
          </div>
          <table className="admin-table">
            <thead><tr><th>ประเภท</th><th>เนื้อหา</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
            <tbody>
              {banners.map((b) => (
                <tr key={b._id}>
                  <td><span className="badge badge-accent">{b.type}</span></td>
                  <td>{b.content}</td>
                  <td>{b.isActive ? 'ใช้งาน' : 'ซ่อน'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingItem(b); setModalType('banners'); }}><Edit2 size={14} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBanner(b._id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'random' && (
        <div className="glass-card" style={{ padding: 'var(--space-xl)', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xl)' }}>
            <h2>จัดการระบบสุ่มรางวัล (Gacha Box)</h2>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditingItem({ name: '', description: '', price: 0, imageUrl: '', isActive: true, rewards: [] }); setModalType('randombox'); }}>
              <Plus size={16} /> สร้างกล่องสุ่ม
            </button>
          </div>
          <table className="admin-table">
            <thead><tr><th>Image</th><th>กล่องสุ่ม</th><th>ราคาเล่น (฿)</th><th>จำนวนรางวัล</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
            <tbody>
              {randomBoxes.map((b) => (
                <tr key={b._id}>
                  <td>{b.imageUrl ? <img src={b.imageUrl} width={40} height={40} style={{ objectFit: 'cover', borderRadius: '4px' }}/> : '🗃️'}</td>
                  <td><b>{b.name}</b></td>
                  <td style={{ color: 'var(--color-primary)' }}>{b.price} ฿</td>
                  <td>{b.rewards?.length || 0} ชิ้น</td>
                  <td>{b.isActive ? <span className="badge badge-success">เปิดใช้งาน</span> : <span className="badge badge-warning">ปิดปรับปรุง</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingItem({...b}); setModalType('randombox'); }}><Edit2 size={14} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRandomBox(b._id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALS */}
      {modalType && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem._id ? 'แก้ไข' : 'เพิ่ม'} {modalType}</h2>
              <button className="cart-drawer-close" onClick={() => setModalType(null)}><X size={18} /></button>
            </div>
            
            {modalType === 'products' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveModal('products', editingItem, !!editingItem._id); }}>
                <div className="modal-body">
                  <div className="form-group"><label>ชื่อสินค้า</label><input type="text" className="input-field" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} /></div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>รูปภาพ (อัพโหลดไฟล์ หรือ ป้อน URL)</label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                      <input type="text" className="input-field" placeholder="https://..." value={editingItem.imageUrl || ''} onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})} style={{ flex: 1 }} />
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="product-img-upload" />
                      <label htmlFor="product-img-upload" className="btn btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>อัพโหลด</label>
                    </div>
                    {editingItem.imageUrl && <img src={editingItem.imageUrl} alt="preview" style={{ maxHeight: '100px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />}
                  </div>
                  <div className="form-group"><label>ราคา (฿)</label><input type="number" className="input-field" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})} /></div>
                  <div className="form-group">
                    <label>สต็อก (ใส่ -1 หากไม่จำกัด)</label>
                    <input type="number" className="input-field" value={editingItem.stock === undefined ? -1 : editingItem.stock} onChange={e => setEditingItem({...editingItem, stock: Number(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label>หมวดหมู่</label>
                    <select className="input-field" value={editingItem.category} onChange={e => setEditingItem({...editingItem, category: e.target.value})}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>คำอธิบาย</label><textarea className="input-field" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} /></div>
                </div>
                <div className="modal-footer"><button type="submit" className="btn btn-primary">บันทึก</button></div>
              </form>
            )}

            {modalType === 'vouchers' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveModal('vouchers', editingItem, !!editingItem._id); }}>
                <div className="modal-body">
                  <div className="form-group"><label>โค้ด (เช่น FREE50, ต้องไม่ซ้ำ)</label><input type="text" className="input-field" value={editingItem.code} onChange={e => setEditingItem({...editingItem, code: e.target.value})} required/></div>
                  <div className="form-group"><label>ได้เงินกี่บาท (฿)</label><input type="number" className="input-field" value={editingItem.rewardAmount} onChange={e => setEditingItem({...editingItem, rewardAmount: Number(e.target.value)})} required/></div>
                  <div className="form-group"><label>จำนวนครั้งที่ใช้ได้ (0 = ไม่จำกัด)</label><input type="number" className="input-field" value={editingItem.maxUses} onChange={e => setEditingItem({...editingItem, maxUses: Number(e.target.value)})} required/></div>
                </div>
                <div className="modal-footer"><button type="submit" className="btn btn-primary">บันทึกโค้ด</button></div>
              </form>
            )}

            {modalType === 'banners' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveModal('banners', editingItem, !!editingItem._id); }}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>ประเภทประกาศ</label>
                    <select className="input-field" value={editingItem.type} onChange={e => setEditingItem({...editingItem, type: e.target.value})}>
                      <option value="announcement">ข้อความเลื่อนบนสุด (Announcement)</option>
                      <option value="popup">ป็อปอัพ (Popup)</option>
                    </select>
                  </div>
                  <div className="form-group"><label>ข้อความหรือ URL รูปภาพ</label><textarea className="input-field" value={editingItem.content} onChange={e => setEditingItem({...editingItem, content: e.target.value})} required /></div>
                </div>
                <div className="modal-footer"><button type="submit" className="btn btn-primary">บันทึกประกาศ</button></div>
              </form>
            )}

            {modalType === 'categories' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveModal('categories', editingItem, !!editingItem._id); }}>
                <div className="modal-body">
                  <div className="form-group"><label>ID หมวดหมู่ (ภาษาอังกฤษพิมพ์เล็ก เช่น 'weapons')</label><input type="text" className="input-field" value={editingItem.id} onChange={e => setEditingItem({...editingItem, id: e.target.value.toLowerCase()})} required /></div>
                  <div className="form-group"><label>ชื่อหมวดหมู่ (แสดงผล)</label><input type="text" className="input-field" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required /></div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>รูปภาพแบนเนอร์ (อัพโหลดไฟล์ หรือ ป้อน URL)</label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                      <input type="text" className="input-field" placeholder="https://..." value={editingItem.imageUrl || ''} onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})} style={{ flex: 1 }} />
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="cat-img-upload" />
                      <label htmlFor="cat-img-upload" className="btn btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>อัพโหลด</label>
                    </div>
                    {editingItem.imageUrl && <img src={editingItem.imageUrl} alt="preview" style={{ maxHeight: '100px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />}
                  </div>
                  <div className="form-group">
                    <label>สีไฮไลท์บนการ์ด</label>
                    <select className="input-field" value={editingItem.color} onChange={e => setEditingItem({...editingItem, color: e.target.value})}>
                      <option value="primary">Primary (Blue)</option>
                      <option value="secondary">Secondary (Purple)</option>
                      <option value="accent">Accent (Pink/Red)</option>
                      <option value="info">Info (Cyan)</option>
                      <option value="success">Success (Green)</option>
                      <option value="warning">Warning (Yellow)</option>
                    </select>
                  </div>
                  <div className="form-group"><label>คำอธิบายสั้นๆ</label><textarea className="input-field" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} /></div>
                </div>
                <div className="modal-footer"><button type="submit" className="btn btn-primary">บันทึกหมวดหมู่</button></div>
              </form>
            )}

            {modalType === 'randombox' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveModal('randombox', editingItem, !!editingItem._id); }}>
                <div className="modal-body">
                  <div className="form-group"><label>ชื่อกล่องสุ่ม</label><input type="text" className="input-field" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required /></div>
                  <div className="form-group"><label>รายละเอียด</label><textarea className="input-field" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} /></div>
                  <div className="form-group"><label>ราคาเล่นต่อรอบ (฿)</label><input type="number" className="input-field" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})} required /></div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>รูปล็อกเก็ตกล่องสุ่ม (อัพโหลด หรือ ป้อน URL)</label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                      <input type="text" className="input-field" placeholder="https://..." value={editingItem.imageUrl || ''} onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})} style={{ flex: 1 }} />
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="randombox-img-upload" />
                      <label htmlFor="randombox-img-upload" className="btn btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>อัพโหลด</label>
                    </div>
                    {editingItem.imageUrl && <img src={editingItem.imageUrl} alt="preview" style={{ maxHeight: '100px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={editingItem.isActive} onChange={e => setEditingItem({...editingItem, isActive: e.target.checked})} />
                      เปิดใช้งาน (ให้เห็นหน้าร้าน)
                    </label>
                  </div>
                  
                  <div className="form-group" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label>รายการของรางวัลภายในกล่อง</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingItem({...editingItem, rewards: [...(editingItem.rewards||[]), {name: '', imageUrl: '', description: '', rate: 10}]})}>
                          + เพิ่มรางวัล
                        </button>
                        <button type="button" className="btn btn-sm" style={{ background: 'var(--color-accent)', color: '#fff' }} onClick={() => setEditingItem({...editingItem, rewards: [...(editingItem.rewards||[]), {name: 'ไอเทมระดับ RARE', imageUrl: '', description: 'สุ่มพบไอเทมระดับแรร์ สุดว้าว!', rate: 0.5}]})}>
                          ✨ เพิ่มไอเทมแรร์
                        </button>
                      </div>
                    </div>
                    {(editingItem.rewards || []).map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                          <input type="text" placeholder="ชื่อรางวัล" className="input-field" value={r.name} onChange={e => { const newR = [...editingItem.rewards]; newR[i].name = e.target.value; setEditingItem({...editingItem, rewards: newR}) }} required style={{ flex: 1.5 }} />
                          <input type="text" placeholder="รูปภาพ URL" className="input-field" value={r.imageUrl || ''} onChange={e => { const newR = [...editingItem.rewards]; newR[i].imageUrl = e.target.value; setEditingItem({...editingItem, rewards: newR}) }} style={{ flex: 1.5 }} />
                          <input type="text" placeholder="รายละเอียด/ความหายาก" className="input-field" value={r.description || ''} onChange={e => { const newR = [...editingItem.rewards]; newR[i].description = e.target.value; setEditingItem({...editingItem, rewards: newR}) }} style={{ flex: 2 }} />
                          <input type="number" step="0.01" placeholder="เรท" className="input-field" value={r.rate} onChange={e => { const newR = [...editingItem.rewards]; newR[i].rate = Number(e.target.value); setEditingItem({...editingItem, rewards: newR}) }} required style={{ flex: 0.8 }} title="โอกาสออก" />
                         <button type="button" className="btn btn-danger btn-sm" onClick={() => { const newR = [...editingItem.rewards]; newR.splice(i, 1); setEditingItem({...editingItem, rewards: newR}); }}><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>

                </div>
                <div className="modal-footer"><button type="submit" className="btn btn-primary">บันทึกกล่องสุ่ม</button></div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
