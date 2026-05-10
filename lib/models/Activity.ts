import mongoose, { Schema } from 'mongoose';

const ActivitySchema = new Schema({
  stopId: { type: Schema.Types.ObjectId, ref: 'Stop', required: true, index: true },
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['sightseeing', 'food', 'adventure', 'culture', 'shopping', 'nightlife'],
    required: true
  },
  description: { type: String },
  cost: { type: Number, required: true },
  duration: { type: Number }, // in minutes
  scheduledTime: { type: Date },
  images: [{ type: String }],
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  status: { 
    type: String, 
    enum: ['planned', 'booked', 'done', 'skipped'],
    default: 'planned'
  },
  rating: { type: Number, min: 1, max: 5 }
});

ActivitySchema.index({ stopId: 1, scheduledTime: 1 });

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
