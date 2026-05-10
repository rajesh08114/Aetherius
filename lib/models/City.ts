import mongoose, { Schema } from 'mongoose';

const CitySchema = new Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  countryCode: { type: String },
  region: { type: String },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  costIndex: { type: Number, min: 1, max: 10 },
  popularity: { type: Number },
  avgDailyCost: {
    budget: { type: Number },
    mid: { type: Number },
    luxury: { type: Number }
  },
  timezone: { type: String },
  currency: { type: String },
  description: { type: String },
  images: [{ type: String }],
  tags: [{ type: String }]
});

CitySchema.index({ name: 'text', country: 'text' });

export default mongoose.models.City || mongoose.model('City', CitySchema);
