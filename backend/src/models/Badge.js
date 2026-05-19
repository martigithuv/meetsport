const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "First Activity", "1000 Points"
  description: { type: String },
  icon: { type: String }, // emoji or icon identifier
  requirement: { type: String }, // Description of how to earn it
  type: { type: String, enum: ['ACTIVITIES', 'POINTS', 'RELIABILITY', 'ORGANIZER', 'SOCIAL'], default: 'ACTIVITIES' }
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
