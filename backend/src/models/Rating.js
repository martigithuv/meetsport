const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Person being rated
  ratingValue: { type: Number, min: 1, max: 5, required: true }, // 1-5 stars
  comment: { type: String },
  ratedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Índice para evitar valoraciones duplicadas (un usuario solo puede valorar a otro usuario por actividad una vez)
ratingSchema.index({ activity: 1, rater: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
