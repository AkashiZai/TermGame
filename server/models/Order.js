import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: Number, // Reference to hardcoded product ID
  name: String,
  price: Number,
  quantity: Number,
  category: String,
  emoji: String
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'completed', 'cancelled'],
    default: 'paid' // Default to paid because we deduct balance immediately on checkout
  },
  robloxUsername: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
