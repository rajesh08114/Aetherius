import mongoose, { Schema } from 'mongoose';

const TripCommentSchema = new Schema({
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 500 },
  parentId: { type: Schema.Types.ObjectId, ref: 'TripComment' }
}, { timestamps: true });

export default mongoose.models.TripComment || mongoose.model('TripComment', TripCommentSchema);
