const Rating = require('../models/Rating');
const Activity = require('../models/Activity');
const User = require('../models/User');
const UserBadge = require('../models/UserBadge');
const Badge = require('../models/Badge');
const Enrollment = require('../models/Enrollment');

// Mapeo de puntos por calificación
const POINTS_MAP = {
  5: 500,
  4: 400,
  3: 300,
  2: 200,
  1: 100,
  0: 0
};

// @desc    Crear una valoración
// @route   POST /api/ratings
// @access  Private
exports.createRating = async (req, res) => {
  try {
    const { activityId, recipientId, ratingValue, comment } = req.body;

    // Validar campos
    if (!activityId || !recipientId || !ratingValue) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    // Verificar que la actividad existe y está finalizada (por fecha O por estado)
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    const now = new Date();
    const isFinishedByDate = activity.date < now;
    const isFinishedByStatus = activity.status === 'FINALITZADA' || activity.status === 'COMPLETED';

    if (!isFinishedByDate && !isFinishedByStatus) {
      return res.status(400).json({ message: 'No pots valorar activitats que encara no han finalitzat' });
    }

    // Verificar que el usuario que valora está inscrito o es el creador
    const isCreator = activity.creator.toString() === req.user._id.toString();
    const isParticipant = activity.participants.some(p => p.toString() === req.user._id.toString());

    if (!isParticipant && !isCreator) {
      return res.status(400).json({ message: 'Només els participants inscrits o el creador poden valorar' });
    }

    // Verificar si ya existe una valoración (evitar duplicados)
    const existingRating = await Rating.findOne({
      activity: activityId,
      rater: req.user._id,
      recipient: recipientId
    });

    if (existingRating) {
      return res.status(400).json({ message: 'ja has valorat aquest usuari per aquesta activitat' });
    }

    // Crear la valoración
    const rating = await Rating.create({
      activity: activityId,
      rater: req.user._id,
      recipient: recipientId,
      ratingValue,
      comment
    });

    // Agregar puntos y la valoración al usuario valorado
    const points = POINTS_MAP[ratingValue] || 0;
    const recipient = await User.findByIdAndUpdate(
      recipientId,
      { 
        $inc: { total_points: points },
        $push: { valoracions: rating._id }
      },
      { new: true }
    );

    // Verificar y otorgar medallas automáticas
    await checkAndAwardBadges(recipientId);

    res.status(201).json({
      message: 'Valoración registrada',
      rating,
      pointsAwarded: points
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creando valoración', error: error.message });
  }
};

// @desc    Obtener valoraciones de un usuario
// @route   GET /api/ratings/user/:userId
// @access  Public
exports.getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ recipient: req.params.userId })
      .populate('rater', 'name profileDetails')
      .populate('activity', 'title');

    const summary = {
      totalRatings: ratings.length,
      averageRating: ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.ratingValue, 0) / ratings.length).toFixed(2)
        : 0,
      ratings
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo valoraciones', error: error.message });
  }
};

// @desc    Obtener valoraciones de una actividad
// @route   GET /api/ratings/activity/:activityId
// @access  Public
exports.getActivityRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ activity: req.params.activityId })
      .populate('rater', 'name profileDetails')
      .populate('recipient', 'name profileDetails');

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo valoraciones', error: error.message });
  }
};

// Función auxiliar para verificar y otorgar medallas
async function checkAndAwardBadges(userId) {
  try {
    const user = await User.findById(userId);

    // Verificar medalla de 1000 puntos
    if (user.total_points >= 1000) {
      const badge = await Badge.findOne({ name: '1000 Puntos' });
      if (badge) {
        const existingUserBadge = await UserBadge.findOne({ user: userId, badge: badge._id });
        if (!existingUserBadge) {
          const userBadge = await UserBadge.create({ user: userId, badge: badge._id });
          await User.findByIdAndUpdate(userId, { $push: { badges: userBadge._id } });
        }
      }
    }

    // Verificar medalla de 5000 puntos
    if (user.total_points >= 5000) {
      const badge = await Badge.findOne({ name: '5000 Puntos' });
      if (badge) {
        const existingUserBadge = await UserBadge.findOne({ user: userId, badge: badge._id });
        if (!existingUserBadge) {
          const userBadge = await UserBadge.create({ user: userId, badge: badge._id });
          await User.findByIdAndUpdate(userId, { $push: { badges: userBadge._id } });
        }
      }
    }

    // Verificar medalla "Usuario fiable" (promedio >= 4.5 estrellas)
    const ratings = await Rating.find({ recipient: userId });
    if (ratings.length >= 5) {
      const avgRating = ratings.reduce((sum, r) => sum + r.ratingValue, 0) / ratings.length;
      if (avgRating >= 4.5) {
        const badge = await Badge.findOne({ name: 'Usuario Fiable' });
        if (badge) {
          const existingUserBadge = await UserBadge.findOne({ user: userId, badge: badge._id });
          if (!existingUserBadge) {
            const userBadge = await UserBadge.create({ user: userId, badge: badge._id });
            await User.findByIdAndUpdate(userId, { $push: { badges: userBadge._id } });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
}

// Función exportada para uso externo
exports.checkAndAwardBadges = checkAndAwardBadges;
