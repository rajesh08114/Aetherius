import mongoose, { Schema } from 'mongoose';

const ChecklistItemSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['clothing', 'documents', 'electronics', 'toiletries', 'misc'],
    required: true
  },
  packed: { type: Boolean, default: false },
  quantity: { type: Number, default: 1 },
  addedByAI: { type: Boolean, default: false }
}, { _id: false });

const ChecklistSchema = new Schema({
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [ChecklistItemSchema]
}, { timestamps: true });

export default mongoose.models.Checklist || mongoose.model('Checklist', ChecklistSchema);
