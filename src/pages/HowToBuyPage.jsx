import { ShoppingCart, CreditCard, MessageCircle, CheckCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowToBuyPage() {
  const steps = [
    {
      number: 1,
      icon: <ShoppingCart size={24} />,
      title: 'เลือกสินค้า',
      description: 'เลือกสินค้าที่ต้องการจากหมวดหมู่ต่างๆ เช่น Robux, Game Pass, ผลไม้ Blox Fruits หรือบริการบัญชี แล้วเพิ่มลงตะกร้า',
    },
    {
      number: 2,
      icon: <CreditCard size={24} />,
      title: 'กรอกข้อมูล',
      description: 'กรอกชื่อผู้ใช้ Roblox, LINE ID และเลือกวิธีชำระเงิน (TrueMoney Wallet หรือ QR Payment) แล้วกดยืนยันสั่งซื้อ',
    },
    {
      number: 3,
      icon: <MessageCircle size={24} />,
      title: 'ติดต่อ LINE',
      description: 'ทักแชท LINE: @day_pisit แจ้งหมายเลขออเดอร์ แล้วโอนเงินตามยอดที่สั่งซื้อ',
    },
    {
      number: 4,
      icon: <CheckCircle size={24} />,
      title: 'รอรับสินค้า',
      description: 'หลังจากยืนยันการโอนเงิน ทีมงานจะดำเนินการส่งสินค้าให้ทันที! ตรวจสอบสถานะได้ที่หน้าเช็คสถานะ',
    },
  ];

  return (
    <div className="container howto-page">
      <div className="shop-header">
        <h1 className="section-title">วิธีสั่งซื้อ</h1>
        <p className="section-subtitle">ขั้นตอนง่ายๆ เพียง 4 ขั้นตอน ก็ได้รับสินค้าทันที!</p>
      </div>

      <div className="steps-grid">
        {steps.map((step) => (
          <div className="glass-card step-card" key={step.number}>
            <div className="step-number">{step.number}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <section className="section">
        <h2 className="section-title">คำถามที่พบบ่อย</h2>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {[
            {
              q: 'สินค้าจะได้รับเมื่อไหร่?',
              a: 'สินค้าจะได้รับภายใน 5-30 นาทีหลังจากยืนยันการโอนเงิน ในกรณีบริการบัญชีอาจใช้เวลา 1-24 ชั่วโมง',
            },
            {
              q: 'ต้องให้รหัสผ่าน Roblox ไหม?',
              a: 'สำหรับการเติม Robux และ Game Pass ไม่ต้องให้รหัสผ่าน เราจะใช้ระบบ Game Pass ในการส่งมอบสินค้า',
            },
            {
              q: 'ชำระเงินได้ช่องทางไหนบ้าง?',
              a: 'เราให้ชำระผ่าน TrueMoney Wallet และ QR Payment (พร้อมเพย์) ติดต่อ LINE เพื่อรับ QR Code',
            },
            {
              q: 'มีนโยบายคืนเงินไหม?',
              a: 'หากเกิดปัญหาในการส่งมอบสินค้า เราจะคืนเงินเต็มจำนวน ติดต่อ LINE เพื่อแจ้งปัญหา',
            },
            {
              q: 'มีโปรโมชั่นหรือส่วนลดไหม?',
              a: 'มีโปรโมชั่นเป็นประจำ! ติดตามข่าวสารได้ทาง LINE: @day_pisit',
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: 'var(--space-lg) var(--space-xl)',
                marginBottom: 'var(--space-md)',
              }}
            >
              <h4 style={{ marginBottom: 'var(--space-sm)', color: 'var(--color-primary)' }}>
                {faq.q}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', lineHeight: '1.7' }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ textAlign: 'center', paddingBottom: 'var(--space-4xl)' }}>
        <Link to="/shop" className="btn btn-primary btn-lg">
          <Package size={20} />
          เริ่มช้อปเลย!
        </Link>
      </div>
    </div>
  );
}
