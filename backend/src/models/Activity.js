const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sport: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: { type: String }
  },
  date: { type: Date, required: true },
  maxParticipants: { type: Number, required: true, default: 2 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  level: { type: String, enum: ['Principiant', 'Intermedi', 'Avançat', 'Tots'], default: 'Tots' },
  tags: [{ type: String }],
  isHighlighted: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false },
  status: { type: String, enum: ['OPEN', 'FULL', 'COMPLETED', 'CANCELLED'], default: 'OPEN' }
}, { timestamps: true });

activitySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Activity', activitySchema);
