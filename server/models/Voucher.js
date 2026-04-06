import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  rewardAmount: {
    type: Number,
    required: true,
    min: 1
  },
  maxUses: {
    type: Number,
    default: 1, // 0 For Unlimited
  },
  currentUses: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: null // Null means never expires
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Voucher', voucherSchema);
