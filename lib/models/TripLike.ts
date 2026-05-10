import mongoose, { Schema } from 'mongoose';

const TripLikeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true }
}, { timestamps: true });

TripLikeSchema.index({ userId: 1, tripId: 1 }, { unique: true });

export default mongoose.models.TripLike || mongoose.model('TripLike', TripLikeSchema);
