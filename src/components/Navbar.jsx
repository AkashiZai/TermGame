import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Gamepad2, User, LogOut, Wallet, Settings, DollarSign, ShoppingBag, Gift, Package, Ticket } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'หน้าแรก' },
    { path: '/shop', label: 'สินค้าทั้งหมด' },
    { path: '/how-to-buy', label: 'วิธีสั่งซื้อ' },
    { path: '/order-status', label: 'เช็คสถานะ' },
    { path: '/gacha', label: 'สุ่มของรางวัล' },
    { path: '/activity', label: 'กิจกรรมร้าน' },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon"><Gamepad2 size={20} /></span>
          ZaiBux Shop
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {/* Mobile auth links */}
          {mobileOpen && !user && (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}>เข้าสู่ระบบ</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>สมัครสมาชิก</Link>
            </>
          )}
          {mobileOpen && user && (
            <>
              {user.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)}>จัดการระบบ (Admin)</Link>}
              <Link to="/topup" onClick={() => setMobileOpen(false)}>เติมเงิน</Link>
              <a href="#" onClick={(e) => { e.preventDefault(); logout(); setMobileOpen(false); }}>ออกจากระบบ</a>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginRight: '1rem' }} className="desktop-only">
              <Link to="/topup" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                <Wallet size={16} /> {user.balance?.toLocaleString()} ฿
              </Link>

              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--text-main)', fontWeight: '500' }}
                >
                  <User size={16} color="var(--text-secondary)" />
                  <span>{user.username}</span>
                </button>

                {profileDropdownOpen && (
                  <div className="profile-dropdown glass-card">
                    <div className="profile-dropdown-header">{user.username}</div>

                    <Link to="/profile?tab=profile" onClick={() => setProfileDropdownOpen(false)} className="profile-dropdown-link">
                      <User size={16} /> โปรไฟล์
                    </Link>
                    <Link to="/profile?tab=settings" onClick={() => setProfileDropdownOpen(false)} className="profile-dropdown-link">
                      <Settings size={16} /> การตั้งค่าผู้ใช้
                    </Link>
                    <Link to="/profile?tab=topup-history" onClick={() => setProfileDropdownOpen(false)} className="profile-dropdown-link">
                      <DollarSign size={16} /> ประวัติเติมเงิน
                    </Link>
                    <Link to="/profile?tab=purchase-history" onClick={() => setProfileDropdownOpen(false)} className="profile-dropdown-link">
                      <ShoppingBag size={16} /> ประวัติการซื้อสินค้า
                    </Link>
                    <Link to="/profile?tab=random-history" onClick={() => setProfileDropdownOpen(false)} className="profile-dropdown-link">
                      <Gift size={16} /> ประวัติการสุ่มสินค้า
                    </Link>
                    <Link to="/profile?tab=order-list" onClick={() => setProfileDropdownOpen(false)} className="profile-dropdown-link">
                      <Package size={16} /> รายการสั่งซื้อ
                    </Link>
                    <Link to="/profile?tab=coupons" onClick={() => setProfileDropdownOpen(false)} className="profile-dropdown-link">
                      <Ticket size={16} /> ระบบคูปอง
                    </Link>

                    <div className="profile-dropdown-divider"></div>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setProfileDropdownOpen(false)} className="profile-dropdown-link admin-link">
                        จัดการระบบ (Admin)
                      </Link>
                    )}
                    <button onClick={() => { logout(); setProfileDropdownOpen(false); }} className="profile-dropdown-link danger-link">
                      <LogOut size={16} /> ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginRight: '1rem' }} className="desktop-only">
              <Link to="/login" style={{ fontSize: 'var(--fs-sm)', fontWeight: '500' }}>เข้าสู่ระบบ</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: 'var(--fs-sm)' }}>สมัครสมาชิก</Link>
            </div>
          )}

          <button className="cart-btn" onClick={() => setIsOpen(true)} id="cart-button">
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </button>
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="mobile-menu-button"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
