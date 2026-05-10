import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  languagePreference: { type: String, default: 'en' },
  savedDestinations: [{ type: Schema.Types.ObjectId, ref: 'City' }],
  refreshTokenHash: { type: String, select: false },
  moodPreferences: [{ 
    type: String, 
    enum: ['adventurous', 'romantic', 'family', 'budget', 'luxury', 'spiritual'] 
  }],
  travelPersonality: { type: String },
  carbonScore: { type: Number, default: 0 },
  totalKmTraveled: { type: Number, default: 0 },
  countriesVisited: [{ type: String }],
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
