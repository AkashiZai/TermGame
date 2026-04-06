import mongoose from 'mongoose';

const RewardItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String },
  description: { type: String, default: '' },
  rate: { type: Number, required: true } // Win weight/Rate
});

const RandomBoxSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true },
  rewards: [RewardItemSchema],
  createdAt: { type: Date, default: Date.now }
});

const RandomBox = mongoose.model('RandomBox', RandomBoxSchema);
export default RandomBox;
