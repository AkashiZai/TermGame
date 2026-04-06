import Product from './models/Product.js';
import Banner from './models/Banner.js';
import Category from './models/Category.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

// Hardcoded data from previous static files
const defaultProducts = [
  { id: 1, name: 'Robux 100', description: 'เติม 100 Robux เข้าบัญชี Roblox ของคุณ ได้รับทันทีหลังชำระเงิน', price: 45, category: 'robux', emoji: '💎', badge: null, features: ['ได้รับทันที', 'ปลอดภัย 100%', 'ไม่ต้องให้รหัสผ่าน'] },
  { id: 2, name: 'Robux 400', description: 'เติม 400 Robux เข้าบัญชี Roblox ของคุณ ได้รับทันทีหลังชำระเงิน', price: 165, category: 'robux', emoji: '💎', badge: 'ยอดนิยม', features: ['ได้รับทันที', 'ปลอดภัย 100%', 'ไม่ต้องให้รหัสผ่าน'] },
  { id: 3, name: 'Robux 800', description: 'เติม 800 Robux เข้าบัญชี Roblox ของคุณ คุ้มค่ากว่าแพ็คเล็ก', price: 310, category: 'robux', emoji: '💎', badge: null, features: ['ได้รับทันที', 'ปลอดภัย 100%', 'ประหยัดกว่า'] },
  { id: 4, name: 'Robux 1,700', description: 'เติม 1,700 Robux แพ็คใหญ่ คุ้มค่าที่สุด สำหรับนักช้อปตัวจริง', price: 620, category: 'robux', emoji: '💎', badge: 'คุ้มค่า', features: ['ได้รับทันที', 'ปลอดภัย 100%', 'คุ้มค่าที่สุด'] },
  { id: 5, name: 'Robux 4,500', description: 'เติม 4,500 Robux แพ็คพรีเมียม สำหรับผู้เล่นจริงจัง', price: 1550, category: 'robux', emoji: '💎', badge: 'แนะนำ', features: ['ได้รับทันที', 'ปลอดภัย 100%', 'ราคาพิเศษ'] },
  { id: 6, name: 'Robux 10,000', description: 'เติม 10,000 Robux แพ็คใหญ่สุด สุดคุ้ม ราคาดีที่สุด', price: 3200, category: 'robux', emoji: '💎', badge: 'สุดคุ้ม', features: ['ได้รับทันที', 'ปลอดภัย 100%', 'ราคาดีที่สุด'] },
  { id: 7, name: '2x Mastery', description: 'Game Pass เพิ่มค่า Mastery เป็น 2 เท่า เลเวลอัพเร็วขึ้น 2 เท่า!', price: 299, category: 'gamepass', emoji: '⚡', badge: 'ขายดี', features: ['Mastery x2', 'ใช้ได้ถาวร', 'เลเวลอัพเร็วขึ้น'] },
  { id: 8, name: 'Fruit Notifier', description: 'แจ้งเตือนเมื่อมีผลไม้เกิดในเซิร์ฟเวอร์ ไม่พลาดผลไม้หายาก!', price: 349, category: 'gamepass', emoji: '🔔', badge: null, features: ['แจ้งเตือนผลไม้', 'ใช้ได้ถาวร', 'ไม่พลาดผลไม้หายาก'] },
  { id: 9, name: 'Fast Boats', description: 'เรือวิ่งเร็วขึ้น 2 เท่า เดินทางข้ามเกาะได้รวดเร็ว!', price: 199, category: 'gamepass', emoji: '🚤', badge: null, features: ['ความเร็วเรือ x2', 'ใช้ได้ถาวร', 'เดินทางเร็วขึ้น'] },
  { id: 10, name: '2x Money', description: 'ได้เงินในเกม 2 เท่าจากทุกกิจกรรม ฟาร์มเงินเร็วขึ้น!', price: 249, category: 'gamepass', emoji: '💰', badge: null, features: ['เงิน x2', 'ใช้ได้ถาวร', 'ฟาร์มเงินเร็ว'] },
  { id: 11, name: '+1 Storage', description: 'เพิ่มช่องเก็บผลไม้อีก 1 ช่อง เก็บผลไม้หายากได้มากขึ้น!', price: 179, category: 'gamepass', emoji: '📦', badge: null, features: ['เพิ่มช่องเก็บ', 'ใช้ได้ถาวร', 'เก็บผลไม้ได้มากขึ้น'] },
  { id: 12, name: '2x EXP', description: 'ได้รับ EXP เพิ่มเป็น 2 เท่า อัพเลเวลตัวละครเร็วขึ้น!', price: 269, category: 'gamepass', emoji: '✨', badge: 'แนะนำ', features: ['EXP x2', 'ใช้ได้ถาวร', 'เลเวลอัพเร็ว'] },
  { id: 13, name: 'Leopard Fruit', description: 'ผลเสือดาว (Leopard) ผลไม้ Mythical สุดหายาก พลังอันมหาศาล!', price: 899, category: 'fruits', emoji: '🐆', badge: 'หายาก', features: ['Mythical Fruit', 'พลังสูงมาก', 'หายากที่สุด'] },
  { id: 14, name: 'Dragon Fruit', description: 'ผลมังกร (Dragon) ผลไม้ Mythical แปลงร่างเป็นมังกรได้!', price: 799, category: 'fruits', emoji: '🐉', badge: 'หายาก', features: ['Mythical Fruit', 'แปลงร่างได้', 'พลังทำลายสูง'] },
  { id: 15, name: 'Dough Fruit', description: 'ผลแป้ง (Dough) ผลไม้ Mythical ร่างกายเปลี่ยนเป็นแป้ง พลังครบ!', price: 749, category: 'fruits', emoji: '🍩', badge: null, features: ['Mythical Fruit', 'ผล Awakened ดี', 'PVP แข็งแกร่ง'] },
  { id: 16, name: 'Spirit Fruit', description: 'ผลวิญญาณ (Spirit) ผลไม้ Mythical สกิลหลากหลาย!', price: 699, category: 'fruits', emoji: '👻', badge: null, features: ['Mythical Fruit', 'สกิลหลากหลาย', 'ตัวเลือกยอดนิยม'] },
  { id: 17, name: 'Venom Fruit', description: 'ผลพิษ (Venom) ผลไม้ Mythical สร้างโซนพิษทำดาเมจต่อเนื่อง!', price: 699, category: 'fruits', emoji: '☠️', badge: null, features: ['Mythical Fruit', 'โซนพิษ AOE', 'ดาเมจต่อเนื่อง'] },
  { id: 18, name: 'Control Fruit', description: 'ผลควบคุม (Control) ผลไม้ Mythical ควบคุมพื้นที่รอบข้าง!', price: 649, category: 'fruits', emoji: '🎯', badge: null, features: ['Mythical Fruit', 'ควบคุมพื้นที่', 'PVP ระยะไกล'] },
  { id: 19, name: 'บัญชี Max Level', description: 'บัญชี Blox Fruits เลเวลสูงสุด พร้อมเล่น พร้อมผลไม้ที่ต้องการ', price: 1499, category: 'accounts', emoji: '👑', badge: 'พรีเมียม', features: ['Level สูงสุด', 'มีผลไม้ให้เลือก', 'พร้อมเล่นทันที'] },
  { id: 20, name: 'บริการเลเวลอัพ', description: 'บริการเลเวลอัพตัวละครของคุณ ปลอดภัย รวดเร็ว ไม่โดนแบน', price: 499, category: 'accounts', emoji: '📈', badge: null, features: ['ปลอดภัย', 'รวดเร็ว', 'ไม่โดนแบน'] },
  { id: 21, name: 'บริการฟาร์มผลไม้', description: 'บริการฟาร์มผลไม้ที่คุณต้องการ รับรองได้ผลชัวร์!', price: 350, category: 'accounts', emoji: '🍎', badge: null, features: ['เลือกผลได้', 'รับรองผล', 'ราคาเป็นกันเอง'] },
  { id: 22, name: 'บัญชี Starter', description: 'บัญชี Roblox ใหม่ พร้อม Robux และไอเทมเริ่มต้น', price: 199, category: 'accounts', emoji: '🎮', badge: null, features: ['บัญชีใหม่', 'มี Robux แถม', 'พร้อมใช้งาน'] }
];

const defaultCategories = [
  { id: 'robux', name: 'เติม Robux', description: 'เติม Robux ราคาถูก รับทันที', emoji: '💎', color: 'primary' },
  { id: 'gamepass', name: 'Game Pass', description: 'Game Pass Blox Fruits ทุกชนิด', emoji: '⚡', color: 'secondary' },
  { id: 'fruits', name: 'ผลไม้ Blox Fruits', description: 'ผลไม้หายาก Mythical ราคาดี', emoji: '🍎', color: 'accent' },
  { id: 'accounts', name: 'บริการบัญชี', description: 'บัญชี Max Level & บริการต่างๆ', emoji: '👑', color: 'info' }
];

const defaultAnnouncements = [
  '🎉 โปรโมชั่น! เติม Robux 1,700 ขึ้นไป ลด 5% 🎉',
  '⚡ ZaiBux Shop บริการรวดเร็ว ได้รับทันที ⚡',
  '🔥 ผลไม้ใหม่! Leopard & Dragon พร้อมจำหน่ายแล้ว 🔥',
  '💬 ติดต่อเรา LINE: @day_pisit 💬',
];

export async function seedDatabase() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('🌱 Seeding Products...');
      await Product.insertMany(defaultProducts);
      console.log('✅ Products Seeded.');
    }

    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      console.log('🌱 Seeding Banners...');
      const banners = defaultAnnouncements.map(text => ({
        type: 'announcement',
        content: text,
        isActive: true
      }));
      await Banner.insertMany(banners);
      console.log('✅ Banners Seeded.');
    }

    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      console.log('🌱 Seeding Categories...');
      await Category.insertMany(defaultCategories);
      console.log('✅ Categories Seeded.');
    }

    const userCount = await User.countDocuments();
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const existingAdmin = await User.findOne({ username: adminUsername });

    if (!existingAdmin) {
      console.log(`🌱 Seeding Admin User (${adminUsername})...`);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', salt);
      
      const adminUser = new User({
        username: adminUsername,
        email: `${adminUsername}@zaibux.local`,
        passwordHash,
        role: 'admin',
        balance: 999999
      });
      await adminUser.save();
      console.log(`✅ Admin User Seeded: Username: ${adminUsername}`);
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}
