import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['announcement', 'popup'],
    required: true
  },
  content: {
    type: String,
    required: true // Text for announcement, Image URL or HTML for popup
  },
  link: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Banner', bannerSchema);
