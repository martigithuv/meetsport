const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  isPremium: { type: Boolean, default: false },
  stripeCustomerId: { type: String },
  premiumExpiresAt: { type: Date },
  profileDetails: {
    sports: [String],
    level: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    avatar: String,
    bio: String
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
  profileViews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    viewedAt: { type: Date, default: Date.now }
  }],
  total_points: { type: Number, default: 0 },
  enrollments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' }],
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserBadge' }],
  valoracions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Indice geospacial para búsquedas por cercanía
userSchema.index({ 'profileDetails.location': '2dsphere' });

module.exports = mongoose.model('User', userSchema);
