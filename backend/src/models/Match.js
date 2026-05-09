const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: false },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
  matchedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
