import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  category: {
    type: String,
    required: true,
    enum: ['robux', 'gamepass', 'fruits', 'accounts']
  },
  emoji: {
    type: String,
    default: '💎'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: null
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
