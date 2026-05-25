const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const User = require('../models/User');

// @desc    Crear una medalla (solo admin)
// @route   POST /api/badges
// @access  Private/Admin
exports.createBadge = async (req, res) => {
  try {
    const { name, description, icon, requirement, type } = req.body;

    const badge = await Badge.create({
      name,
      description,
      icon,
      requirement,
      type
    });

    res.status(201).json(badge);
  } catch (error) {
    res.status(400).json({ message: 'Error creando medalla', error: error.message });
  }
};

// @desc    Obtener todas las medallas
// @route   GET /api/badges
// @access  Public
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find();
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo medallas', error: error.message });
  }
};

// @desc    Obtener medallas de un usuario
// @route   GET /api/badges/user/:userId
// @access  Public
exports.getUserBadges = async (req, res) => {
  try {
    const userBadges = await UserBadge.find({ user: req.params.userId })
      .populate('badge');

    const badges = userBadges.map(ub => ub.badge);

    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo medallas del usuario', error: error.message });
  }
};

// @desc    Otorgar medalla a usuario
// @route   POST /api/badges/:badgeId/award/:userId
// @access  Private/Admin
exports.awardBadge = async (req, res) => {
  try {
    const { badgeId, userId } = req.params;

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar que la medalla existe
    const badge = await Badge.findById(badgeId);
    if (!badge) {
      return res.status(404).json({ message: 'Medalla no encontrada' });
    }

    // Verificar si ya tiene la medalla
    const existingUserBadge = await UserBadge.findOne({
      user: userId,
      badge: badgeId
    });

    if (existingUserBadge) {
      return res.status(400).json({ message: 'El usuario ya tiene esta medalla' });
    }

    // Crear la relación
    const userBadge = await UserBadge.create({
      user: userId,
      badge: badgeId
    });

    // Agregar badge al usuario
    await User.findByIdAndUpdate(
      userId,
      { $push: { badges: userBadge._id } },
      { new: true }
    );

    res.status(201).json(userBadge);
  } catch (error) {
    res.status(400).json({ message: 'Error otorgando medalla', error: error.message });
  }
};

const initializeBadgesLogic = async () => {
  const defaultBadges = [
    {
      name: 'Primera Activitat',
      description: 'Has completat la teva primera activitat',
      icon: '🎯',
      requirement: 'Participar en 1 activitat',
      type: 'ACTIVITIES'
    },
    {
      name: '1000 Punts',
      description: 'Has assolit 1000 punts',
      icon: '⭐',
      requirement: 'Acumular 1000 punts',
      type: 'POINTS'
    },
    {
      name: '5000 Punts',
      description: 'Has assolit 5000 punts',
      icon: '💎',
      requirement: 'Acumular 5000 punts',
      type: 'POINTS'
    },
    {
      name: 'Usuari Fiable',
      description: 'Tens una qualificació mitjana de 4.5+ estrelles',
      icon: '✅',
      requirement: 'Mitjana de valoració >= 4.5 estrelles',
      type: 'RELIABILITY'
    },
    {
      name: 'Organitzador Actiu',
      description: 'Has organitzat 5 activitats',
      icon: '🏆',
      requirement: 'Crear 5 activitats',
      type: 'ORGANIZER'
    }
  ];

  for (const badgeData of defaultBadges) {
    const exists = await Badge.findOne({ name: badgeData.name });
    if (!exists) {
      await Badge.create(badgeData);
    }
  }
};

exports.initializeBadgesLogic = initializeBadgesLogic;

// @desc    Inicializar medallas por defecto (llamar una sola vez)
// @route   POST /api/badges/init
// @access  Private/Admin
exports.initializeBadges = async (req, res) => {
  try {
    await initializeBadgesLogic();
    res.json({ message: 'Medallas inicializadas correctamente' });
  } catch (error) {
    res.status(400).json({ message: 'Error inicializando medallas', error: error.message });
  }
};
