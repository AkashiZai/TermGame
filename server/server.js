import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { redeemVoucher } from './truewallet.js';

// Models
import User from './models/User.js';
import Transaction from './models/Transaction.js';
import Order from './models/Order.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Activity from './models/Activity.js';
import Voucher from './models/Voucher.js';
import Banner from './models/Banner.js';
import RandomBox from './models/RandomBox.js';
import RandomHistory from './models/RandomHistory.js';
import { seedDatabase } from './seeder.js';

const app = express();
const PORT = process.env.PORT || 3001;
const PHONE = process.env.TRUEMONEY_PHONE || '0901234567';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_zaibux_2026';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zaibux';

// ===== Middleware =====
app.use(helmet()); 
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many requests, please try again later.' } });
const apiLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 100 });

app.use('/api/', apiLimiter);

// ===== Database Connection =====
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully');
    await seedDatabase();
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// ===== Authentication Middleware =====
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ error: 'Admin access required' });
};

// ===== API Routes =====

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// --- Public Data Routes ---
app.get('/api/products', async (req, res) => {
  const products = await Product.find({ isActive: true }).sort({ category: 1, price: 1 });
  res.json({ products });
});

app.get('/api/categories', async (req, res) => {
  const categories = await Category.find({ isActive: true });
  res.json({ categories });
});

app.get('/api/banners', async (req, res) => {
  const banners = await Banner.find({ isActive: true });
  res.json({ banners });
});

app.get('/api/activities', async (req, res) => {
  const activities = await Activity.find().sort({ createdAt: -1 }).limit(50);
  res.json({ activities });
});

// --- Auth Routes ---
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password, robloxUsername, lineId } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Username, email, and password are required' });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ error: 'Username or email already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    const user = new User({ username, email, passwordHash, robloxUsername: robloxUsername || '', lineId: lineId || '', role });
    await user.save();

    // Log Activity
    await Activity.create({ 
      type: 'new_user', 
      title: `ผู้ใช้ใหม่ #${user._id.toString().substring(18, 24)} เข้าร่วม` 
    });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user: { id: user._id, username: user.username, email: user.email, balance: user.balance, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, username: user.username, email: user.email, balance: user.balance, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => res.json({ user: req.user }));

app.put('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existing) return res.status(400).json({ error: 'Email already exists' });
      req.user.email = email;
    }
    await req.user.save();
    res.json({ success: true, user: { id: req.user._id, username: req.user.username, email: req.user.email, balance: req.user.balance, role: req.user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/auth/password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Passwords required' });
    
    // We already have req.user from authMiddleware, but let's re-fetch with passwordHash
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid current password' });
    
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
// --- Transaction / Topup History Route ---
app.get('/api/transactions/me', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id, type: 'topup' }).sort({ createdAt: -1 });
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Wallet Top-up Route ---
app.post('/api/wallet/topup', authMiddleware, async (req, res) => {
  const { voucherUrl } = req.body;
  if (!voucherUrl) return res.status(400).json({ status: 'FAIL', reason: 'กรุณากรอกลิงก์อั่งเปา หรือ โค้ดส่วนลด' });

  // 1. Check if it is a TrueMoney URL
  if (voucherUrl.includes('gift.truemoney.com')) {
    let voucherHash = voucherUrl.replace('https://gift.truemoney.com/campaign/?v=', '');
    const existingTx = await Transaction.findOne({ reference: voucherHash, type: 'topup', status: 'success' });
    if (existingTx) return res.status(400).json({ status: 'FAIL', reason: 'ลิงก์อั่งเปานี้ถูกใช้งานไปแล้ว' });
    
    // Logic for TrueMoney API interaction
    const result = await redeemVoucher(PHONE, voucherUrl);
    if (result.status === 'SUCCESS') {
      const amount = result.amount;
      const user = await User.findById(req.user._id);
      user.balance += amount;
      await user.save();

      const tx = new Transaction({ user: user._id, amount, type: 'topup', reference: voucherHash, status: 'success', note: 'TrueMoney Topup' });
      await tx.save();

      return res.json({ status: 'SUCCESS', amount, newBalance: user.balance, message: `เติมเงินสำเร็จ! ได้รับ ${amount} บาท (TrueMoney)` });
    } else {
      const tx = new Transaction({ user: req.user._id, amount: 0, type: 'topup', reference: voucherHash || 'invalid', status: 'failed', note: result.reason || 'Failed Topup' });
      await tx.save();
      return res.json({ status: result.status, reason: result.reason });
    }
  } 
  
  // 2. Treat as Custom Gift Code/Voucher
  else {
    const code = voucherUrl.trim().toUpperCase();
    const voucher = await Voucher.findOne({ code, isActive: true });
    
    if (!voucher) return res.status(400).json({ status: 'FAIL', reason: 'รหัสโค้ดไม่ถูกต้อง หรือหมดอายุแล้ว' });
    if (voucher.expiresAt && new Date() > voucher.expiresAt) return res.status(400).json({ status: 'FAIL', reason: 'โค้ดนี้หมดอายุแล้ว' });
    if (voucher.maxUses > 0 && voucher.currentUses >= voucher.maxUses) return res.status(400).json({ status: 'FAIL', reason: 'โค้ดนี้ถูกใช้งานครบตามจำนวนจำกัดแล้ว' });

    const existingTx = await Transaction.findOne({ user: req.user._id, reference: code, type: 'topup', status: 'success' });
    if (existingTx) return res.status(400).json({ status: 'FAIL', reason: 'คุณใช้งานโค้ดนี้ไปแล้ว' });

    const amount = voucher.rewardAmount;
    
    const user = await User.findById(req.user._id);
    user.balance += amount;
    await user.save();

    voucher.currentUses += 1;
    await voucher.save();

    const tx = new Transaction({ user: user._id, amount, type: 'topup', reference: code, status: 'success', note: 'Gift Code Topup' });
    await tx.save();

    return res.json({ status: 'SUCCESS', amount, newBalance: user.balance, message: `ใช้โค้ดสำเร็จ! ได้รับ ${amount} บาท` });
  }
});

// --- Orders Route ---
app.post('/api/orders', authMiddleware, async (req, res) => {
  const { items, total, robloxUsername, lineId, note } = req.body;
  if (!items || !robloxUsername || !lineId) return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });

  // 1. Check Stock constraints first
  const productDocs = [];
  for (let item of items) {
     const p = await Product.findOne({ id: item.id });
     if (!p || !p.isActive) return res.status(400).json({ error: `ยกเลิกการขายสินค้า ${item.name} ชั่วคราว` });
     if (p.stock !== -1 && p.stock < item.quantity) {
       return res.status(400).json({ error: `ขออภัย ${item.name} มีสต็อกไม่พอ (เหลือ ${p.stock})` });
     }
     productDocs.push({ dbProduct: p, orderQuantity: item.quantity });
  }

  const user = await User.findById(req.user._id);
  if (user.balance < total) return res.status(400).json({ error: 'ยอดเงินไม่เพียงพอ กรุณาเติมเงินก่อนทำรายการ' });

  // 2. Perform transactions
  user.balance -= total;
  
  // Deduct Stock
  for (let doc of productDocs) {
    if (doc.dbProduct.stock !== -1) {
       doc.dbProduct.stock -= doc.orderQuantity;
       await doc.dbProduct.save();
    }
  }

  const order = new Order({ user: user._id, items, totalAmount: total, status: 'paid', robloxUsername, note });
  const tx = new Transaction({ user: user._id, amount: -total, type: 'purchase', reference: `ORDER-${order._id}`, status: 'success', note: `Purchase Order` });

  await Promise.all([user.save(), order.save(), tx.save()]);

  // Log Activity for new order
  await Activity.create({
    type: 'new_order',
    title: `User#${user._id.toString().substring(18, 24)} ซื้อ ${items.map(i => i.name).join(' - ')}`
  });

  res.json({ success: true, order, newBalance: user.balance });
});

app.get('/api/orders/me', authMiddleware, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ error: 'ไม่พบออเดอร์' });
    res.json({ order });
  } catch (err) {
    res.status(400).json({ error: 'รูปแบบ ID ไม่ถูกต้อง' });
  }
});

// ===== Admin Routes =====

// Note: Normal admins log in through /api/auth/login now, but fallback persists if needed
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  if (password === (process.env.ADMIN_PASSWORD || 'admin123')) {
    const token = jwt.sign({ userId: 'admin_override', role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }
});

// Admin Orders
app.get('/api/admin/orders', authMiddleware, adminMiddleware, async (req, res) => {
  const orders = await Order.find().populate('user', 'username email').sort({ createdAt: -1 });
  res.json({ orders });
});

app.put('/api/admin/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

// Admin Products
app.get('/api/admin/products', authMiddleware, adminMiddleware, async (req, res) => {
  const products = await Product.find().sort({ category: 1, price: 1 });
  res.json({ products });
});

app.post('/api/admin/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const newProduct = new Product({
      ...req.body,
      id: Date.now() // auto generated numerical id
    });
    await newProduct.save();
    
    // Log Activity
    await Activity.create({
      type: 'new_stock',
      title: `เพิ่มสต็อกใหม่`,
      subtitle: newProduct.name
    });

    res.json({ success: true, product: newProduct });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Log Activity for admin update
    await Activity.create({
      type: 'new_stock',
      title: `เพิ่มสต็อกใหม่`,
      subtitle: product.name
    });

    res.json({ success: true, product });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin Categories
app.get('/api/admin/categories', authMiddleware, adminMiddleware, async (req, res) => {
  const categories = await Category.find();
  res.json({ categories });
});

app.post('/api/admin/categories', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.json({ success: true, category: newCategory });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/admin/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, category });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/admin/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin Vouchers
app.get('/api/admin/vouchers', authMiddleware, adminMiddleware, async (req, res) => {
  const vouchers = await Voucher.find().sort({ createdAt: -1 });
  res.json({ vouchers });
});

app.post('/api/admin/vouchers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const voucher = new Voucher(req.body);
    await voucher.save();
    res.json({ success: true, voucher });
  } catch (e) {
    res.status(400).json({ error: 'รหัสโค้ดอาจซ้ำ หรือข้อมูลไม่ถูกต้อง' });
  }
});

app.delete('/api/admin/vouchers/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await Voucher.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Admin Banners
app.get('/api/admin/banners', authMiddleware, adminMiddleware, async (req, res) => {
  const banners = await Banner.find().sort({ createdAt: -1 });
  res.json({ banners });
});

app.post('/api/admin/banners', authMiddleware, adminMiddleware, async (req, res) => {
  const banner = new Banner(req.body);
  await banner.save();
  res.json({ success: true, banner });
});

app.put('/api/admin/banners/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, banner });
});

app.delete('/api/admin/banners/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ===== Random Gacha System =====
app.get('/api/randombox', async (req, res) => {
  const boxes = await RandomBox.find({ isActive: true });
  res.json({ boxes });
});

app.post('/api/randombox/:id/roll', authMiddleware, async (req, res) => {
  try {
    const box = await RandomBox.findById(req.params.id);
    if (!box || !box.isActive) return res.status(404).json({ error: 'ไม่พบกล่องสุ่มนี้' });
    if (!box.rewards || box.rewards.length === 0) return res.status(400).json({ error: 'กล่องนี้ยังไม่มีของรางวัล' });

    if (req.user.balance < box.price) {
      return res.status(400).json({ error: 'ยอดเงินไม่เพียงพอ (Insufficient balance)' });
    }

    // Weighted RNG Algorithm
    const totalRate = box.rewards.reduce((sum, r) => sum + r.rate, 0);
    const rng = Math.random() * totalRate;
    
    let accumulated = 0;
    let winningReward = box.rewards[0];
    for (const reward of box.rewards) {
      accumulated += reward.rate;
      if (rng <= accumulated) {
        winningReward = reward;
        break;
      }
    }

    req.user.balance -= box.price;
    await req.user.save();

    const historyEntry = new RandomHistory({
      user: req.user._id,
      boxId: box._id,
      boxName: box.name,
      rewardName: winningReward.name,
      rewardImage: winningReward.imageUrl,
      rewardDescription: winningReward.description,
      cost: box.price
    });
    await historyEntry.save();

    const tx = new Transaction({ user: req.user._id, amount: box.price, type: 'purchase', status: 'success', reference: `RBOX-${Date.now()}`, note: `สุ่มกาชา: ${box.name} ได้รับ: ${winningReward.name}` });
    await tx.save();
    await Activity.create({ type: 'new_order', title: `ผู้ใช้สุ่มกาชา: ${box.name}` });

    res.json({ success: true, reward: winningReward, newBalance: req.user.balance });
  } catch (err) {
    console.error('GACHA ROLL ERROR:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสุ่ม' });
  }
});

app.get('/api/randomhistory/me', authMiddleware, async (req, res) => {
  const history = await RandomHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ history });
});

// Admin Route
app.get('/api/admin/randombox', authMiddleware, adminMiddleware, async (req, res) => {
  const boxes = await RandomBox.find().sort({ createdAt: -1 });
  res.json({ boxes });
});
app.post('/api/admin/randombox', authMiddleware, adminMiddleware, async (req, res) => {
  const box = new RandomBox(req.body);
  await box.save();
  res.json({ success: true, box });
});
app.put('/api/admin/randombox/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const box = await RandomBox.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, box });
});
app.delete('/api/admin/randombox/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await RandomBox.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log('');
  console.log('=================================');
  console.log('  🎮 ZaiBux Shop API Server V3 (Fully Dynamic)');
  console.log(`  📡 http://localhost:${PORT}`);
  console.log('=================================');
  console.log('');
});
