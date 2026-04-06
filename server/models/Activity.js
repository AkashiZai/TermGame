import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['new_user', 'new_stock', 'new_order'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String
  }
}, { timestamps: true });

// Pruning Hook: Delete oldest activities if limit exceeded
activitySchema.post('save', async function() {
  const Activity = this.constructor;
  const LIMIT = 100; // Final production limit
  const count = await Activity.countDocuments();
  
  if (count > LIMIT) {
    const oldest = await Activity.find().sort({ createdAt: 1 }).limit(count - LIMIT);
    const idsToDelete = oldest.map(doc => doc._id);
    await Activity.deleteMany({ _id: { $in: idsToDelete } });
  }
});

export default mongoose.model('Activity', activitySchema);
