const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  enrolledAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['ACTIVE', 'CANCELLED'], default: 'ACTIVE' },
  cancelledAt: { type: Date }
}, { timestamps: true });

// Índice para evitar inscripciones duplicadas
enrollmentSchema.index({ user: 1, activity: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
