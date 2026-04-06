import { Link } from 'react-router-dom';
import { Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero">
      {/* Floating shapes */}
      <div className="hero-shape hero-shape-1"></div>
      <div className="hero-shape hero-shape-2"></div>
      <div className="hero-shape hero-shape-3"></div>

      <div className="hero-content">
        <div className="hero-badge">
          <Sparkles size={16} />
          ร้านเติม Robux อันดับ 1
        </div>

        <h1>
          <span className="highlight">ZaiBux</span> Shop
          <br />
          เติม Robux & ไอเทม
        </h1>

        <p>
          บริการเติม Robux ราคาถูก ซื้อ Game Pass, ผลไม้ Blox Fruits และบริการบัญชี
          <br />
          รวดเร็ว ปลอดภัย ได้รับทันที!
        </p>

        <div className="hero-buttons">
          <Link to="/shop" className="btn btn-primary btn-lg" id="hero-shop-btn">
            <Zap size={20} />
            ช้อปเลย
          </Link>
          <Link to="/how-to-buy" className="btn btn-secondary btn-lg" id="hero-howto-btn">
            วิธีสั่งซื้อ
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="number">5,000+</div>
            <div className="label">ออเดอร์สำเร็จ</div>
          </div>
          <div className="hero-stat">
            <div className="number">4.9 ★</div>
            <div className="label">คะแนนรีวิว</div>
          </div>
          <div className="hero-stat">
            <div className="number">24/7</div>
            <div className="label">บริการตลอดวัน</div>
          </div>
        </div>
      </div>
    </section>
  );
}
