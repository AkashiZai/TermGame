import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  id: {
    type: String,
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
  emoji: {
    type: String,
    default: '📦'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'primary',
    enum: ['primary', 'secondary', 'accent', 'info', 'success', 'warning', 'danger']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
