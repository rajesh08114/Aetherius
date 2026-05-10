import mongoose, { Schema } from 'mongoose';

const StopSchema = new Schema({
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
  cityId: { type: Schema.Types.ObjectId, ref: 'City' },
  cityName: { type: String, required: true },
  country: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  arrivalDate: { type: Date },
  departureDate: { type: Date },
  order: { type: Number, required: true },
  activities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }],
  accommodation: {
    name: { type: String },
    cost: { type: Number },
    type: { type: String }
  },
  transportTo: {
    mode: { type: String, enum: ['flight', 'train', 'bus', 'drive', 'ferry'] },
    cost: { type: Number },
    duration: { type: Number }, // in minutes
    distanceKm: { type: Number }
  },
  estimatedDailyCost: { type: Number },
  notes: { type: String },
  weatherCache: {
    temp: { type: Number },
    condition: { type: String },
    rainProbability: { type: Number },
    fetchedAt: { type: Date }
  },
  carbonKg: { type: Number, default: 0 }
});

StopSchema.index({ tripId: 1, order: 1 });

StopSchema.virtual('nights').get(function() {
  if (this.arrivalDate && this.departureDate) {
    const diffTime = Math.abs(this.departureDate.getTime() - this.arrivalDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Ensure virtuals are included in JSON
StopSchema.set('toJSON', { virtuals: true });
StopSchema.set('toObject', { virtuals: true });

export default mongoose.models.Stop || mongoose.model('Stop', StopSchema);
