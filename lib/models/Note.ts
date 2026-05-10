import mongoose, { Schema } from 'mongoose';

const NoteSchema = new Schema({
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
  stopId: { type: Schema.Types.ObjectId, ref: 'Stop' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String }, // markdown
  date: { type: Date, default: Date.now },
  pinned: { type: Boolean, default: false }
});

NoteSchema.index({ tripId: 1, pinned: -1, date: -1 });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
