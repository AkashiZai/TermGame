import { Link } from 'react-router-dom';
import { Gamepad2, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>
              <Gamepad2 size={24} />
              ZaiBux Shop
            </h3>
            <p>
              ร้านเติม Robux และไอเทม Roblox อันดับ 1 ของไทย
              บริการรวดเร็ว ปลอดภัย ได้รับทันที ราคาถูกที่สุด
            </p>
          </div>

          <div className="footer-column">
            <h4>สินค้า</h4>
            <ul>
              <li><Link to="/shop?category=robux">เติม Robux</Link></li>
              <li><Link to="/shop?category=gamepass">Game Pass</Link></li>
              <li><Link to="/shop?category=fruits">ผลไม้ Blox Fruits</Link></li>
              <li><Link to="/shop?category=accounts">บริการบัญชี</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>ข้อมูล</h4>
            <ul>
              <li><Link to="/how-to-buy">วิธีสั่งซื้อ</Link></li>
              <li><Link to="/order-status">เช็คสถานะออเดอร์</Link></li>
              <li><a href="#">นโยบายความเป็นส่วนตัว</a></li>
              <li><a href="#">เงื่อนไขการให้บริการ</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>ติดต่อเรา</h4>
            <ul>
              <li>
                <a href="https://line.me/ti/p/~day_pisit" target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  LINE: @day_pisit
                </a>
              </li>
              <li><a href="#">เปิดให้บริการ 24/7</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 ZaiBux Shop. All rights reserved.</p>
          <div className="footer-social">
            <a href="https://line.me/ti/p/~day_pisit" target="_blank" rel="noopener noreferrer" title="LINE">
              <MessageCircle size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
