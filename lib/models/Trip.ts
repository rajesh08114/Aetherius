import mongoose, { Schema } from 'mongoose';

const TripSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  coverPhoto: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  totalBudget: { type: Number },
  currency: { type: String, default: 'USD' },
  visibility: { type: String, enum: ['private', 'public', 'link-only'], default: 'private' },
  shareToken: { type: String, unique: true, sparse: true, index: true },
  status: { type: String, enum: ['planning', 'ongoing', 'completed'], default: 'planning' },
  stops: [{ type: Schema.Types.ObjectId, ref: 'Stop' }],
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  tags: [{ type: String }],
  aiHealthScore: { type: Number },
  carbonKg: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  forkCount: { type: Number, default: 0 },
  forkedFrom: { type: Schema.Types.ObjectId, ref: 'Trip' },
}, { timestamps: true });

TripSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Trip || mongoose.model('Trip', TripSchema);
