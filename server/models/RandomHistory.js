import mongoose from 'mongoose';

const RandomHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  boxId: { type: mongoose.Schema.Types.ObjectId, ref: 'RandomBox' },
  boxName: { type: String, required: true },
  rewardName: { type: String, required: true },
  rewardImage: { type: String },
  rewardDescription: { type: String },
  cost: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const RandomHistory = mongoose.model('RandomHistory', RandomHistorySchema);
export default RandomHistory;
