import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['topup', 'purchase', 'refund'],
    required: true
  },
  reference: {
    type: String, // E.g., the voucher hash or order ID
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  note: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
