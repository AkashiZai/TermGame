import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Zap, Clock, HeadphonesIcon, X } from 'lucide-react';
import Hero from '../components/Hero';
import CategoryCards from '../components/CategoryCards';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [popup, setPopup] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Fetch Products
    axios.get('http://localhost:3001/api/products')
      .then(res => setProducts(res.data.products))
      .catch(console.error);

    // Fetch Banners for Popups
    axios.get('http://localhost:3001/api/banners')
      .then(res => {
        const activePopups = res.data.banners.filter(b => b.type === 'popup');
        if (activePopups.length > 0) {
          // Just show the first active popup
          setPopup(activePopups[0]);
          
          // Basic session storage check so it only shows once per tab session
          if (!sessionStorage.getItem(`popup_seen_${activePopups[0]._id}`)) {
            setShowPopup(true);
            sessionStorage.setItem(`popup_seen_${activePopups[0]._id}`, 'true');
          }
        }
      })
      .catch(console.error);
  }, []);

  const featuredProducts = products.filter((p) => p.badge);

  return (
    <>
      {showPopup && popup && (
        <div className="modal-overlay" onClick={() => setShowPopup(false)} style={{ zIndex: 10000 }}>
          <div className="modal" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <button className="cart-drawer-close" style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }} onClick={() => setShowPopup(false)}>
              <X size={20} />
            </button>
            <div style={{ padding: 'var(--space-2xl) var(--space-xl)' }}>
              <h2 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>📢 ข่าวสารล่าสุด</h2>
              
              {/* If the content is an image URL, render it. Otherwise just text */}
              {popup.content.startsWith('http') ? (
                <img src={popup.content} alt="Promotional Popup" style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)' }} />
              ) : (
                <p style={{ fontSize: 'var(--fs-lg)', color: 'var(--text-secondary)' }}>
                  {popup.content}
                </p>
              )}
            </div>
            <button className="btn btn-primary" style={{ width: '80%', marginBottom: 'var(--space-xl)' }} onClick={() => setShowPopup(false)}>
              รับทราบ
            </button>
          </div>
        </div>
      )}

      <Hero />

      <CategoryCards />

      {/* Featured Products */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="section-title">สินค้าแนะนำ</h2>
          <p className="section-subtitle">สินค้ายอดนิยมที่ลูกค้าเลือกมากที่สุด</p>

          <div className="grid-products">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container">
          <h2 className="section-title">ทำไมต้อง ZaiBux Shop?</h2>
          <p className="section-subtitle">เรามุ่งมั่นให้บริการที่ดีที่สุดแก่ลูกค้าทุกคน</p>

          <div className="trust-grid">
            <div className="glass-card trust-card">
              <div className="trust-icon">
                <Zap size={36} />
              </div>
              <h4>รวดเร็วทันใจ</h4>
              <p>ได้รับสินค้าทันทีหลังชำระเงิน ไม่ต้องรอนาน</p>
            </div>

            <div className="glass-card trust-card">
              <div className="trust-icon">
                <Shield size={36} />
              </div>
              <h4>ปลอดภัย 100%</h4>
              <p>ระบบปลอดภัย ไม่ต้องให้รหัสผ่าน ไม่ถูกแบน</p>
            </div>

            <div className="glass-card trust-card">
              <div className="trust-icon">
                <Clock size={36} />
              </div>
              <h4>บริการ 24/7</h4>
              <p>เปิดให้บริการตลอด 24 ชั่วโมง ทุกวัน</p>
            </div>

            <div className="glass-card trust-card">
              <div className="trust-icon">
                <HeadphonesIcon size={36} />
              </div>
              <h4>ซัพพอร์ตดี</h4>
              <p>ทีมงานพร้อมช่วยเหลือ ติดต่อเราได้ทาง LINE</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
