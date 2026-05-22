const Activity = require('../models/Activity');
const User = require('../models/User');

// @desc    Obtener todas las actividades
// @route   GET /api/activities
// @access  Public
exports.getActivities = async (req, res) => {
  try {
    const { sport, level } = req.query;
    let query = {};

    if (sport && sport !== 'Tots') {
      query.sport = sport;
    }

    if (level && level !== 'Tots els nivells') {
      query.level = level;
    }

    query.isHidden = { $ne: true };

    const activities = await Activity.find(query).populate('creator', 'name profileDetails').lean();
    const mappedActivities = activities.map(act => {
      const activityObj = act;
      const participantsCount = activityObj.participants?.length || 0;
      const availableSlots = Math.max(0, activityObj.maxParticipants - participantsCount);
      if (activityObj.creator) activityObj.creator.avatar = activityObj.creator.profileDetails?.avatar;
      return {
        ...activityObj,
        participantsCount,
        availableSlots,
        isFull: availableSlots === 0,
      };
    });
    res.json(mappedActivities);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo actividades', error: error.message });
  }
};

// @desc    Obtener detalles de una actividad concreta
// @route   GET /api/activities/:id
// @access  Public
exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id).populate('creator', 'name profileDetails').lean();

    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    const activityObj = activity;
    const participantsCount = activityObj.participants?.length || 0;
    const availableSlots = Math.max(0, activityObj.maxParticipants - participantsCount);

    if (activityObj.creator) activityObj.creator.avatar = activityObj.creator.profileDetails?.avatar;

    res.json({
      ...activityObj,
      participantsCount,
      availableSlots,
      isFull: availableSlots === 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo la actividad', error: error.message });
  }
};

// @desc    Apuntarse a una actividad
// @route   POST /api/activities/join/:id
// @access  Private
exports.joinActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    const alreadyJoined = activity.participants.some(participant => participant.toString() === req.user._id.toString());
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Ja estàs apuntat a aquesta activitat' });
    }

    if (activity.participants.length >= activity.maxParticipants) {
      return res.status(400).json({ message: 'Totes les plaçes ocupades' });
    }

    activity.participants.push(req.user._id);
    if (activity.participants.length >= activity.maxParticipants) {
      activity.status = 'FULL';
    }

    await activity.save();

    // Ejecutar verificación de insignias
    try {
      const { checkAndAwardBadges } = require('./ratingController');
      const io = req.app.get('io');
      await checkAndAwardBadges(req.user._id, io);
    } catch (badgeErr) {
      console.error('Error al verificar insignias tras apuntarse a actividad:', badgeErr);
    }

    const updatedActivity = await Activity.findById(activity._id).populate('creator', 'name profileDetails');
    const activityObj = updatedActivity.toObject();
    const participantsCount = activityObj.participants?.length || 0;
    const availableSlots = Math.max(0, activityObj.maxParticipants - participantsCount);

    if (activityObj.creator) activityObj.creator.avatar = activityObj.creator.profileDetails?.avatar;

    res.json({
      ...activityObj,
      participantsCount,
      availableSlots,
      isFull: availableSlots === 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error apuntándote a la actividad', error: error.message });
  }
};

// @desc    Crear una actividad
// @route   POST /api/activities
// @access  Private
exports.createActivity = async (req, res) => {
  try {
    const { sport, title, description, address, date, maxParticipants, level, location, images } = req.body;

    // Extract URL and address from location object if provided
    const locationUrl = location?.url || '';
    const locationAddress = location?.address || address || '';

    const activity = await Activity.create({
      creator: req.user._id,
      sport,
      title,
      description,
      location: {
        type: 'Point',
        coordinates: [2.1734, 41.3851], // Coordenadas de Barcelona por defecto
        address: locationAddress,
        url: locationUrl
      },
      images: Array.isArray(images) ? images : [],
      date,
      maxParticipants,
      level
    });

    const { sendActivityCreationEmail } = require('../services/email');
    await sendActivityCreationEmail(req.user.email, req.user.name, title);

    // Ejecutar verificación de insignias
    try {
      const { checkAndAwardBadges } = require('./ratingController');
      const io = req.app.get('io');
      await checkAndAwardBadges(req.user._id, io);
    } catch (badgeErr) {
      console.error('Error al verificar insignias tras crear actividad:', badgeErr);
    }

    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ message: 'Error creando actividad', error: error.message });
  }
};

// @desc    Alternar favorito (añadir/quitar)
// @route   POST /api/activities/favorite/:id
// @access  Private
exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const activityId = req.params.id;

    const isFavorite = user.favorites.includes(activityId);

    if (isFavorite) {
      user.favorites = user.favorites.filter(id => id.toString() !== activityId);
    } else {
      user.favorites.push(activityId);
    }

    await user.save();
    res.json({ success: true, isFavorite: !isFavorite });
  } catch (error) {
    res.status(500).json({ message: 'Error en favorits', error: error.message });
  }
};

// @desc    Obtener mis actividades favoritas
// @route   GET /api/activities/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'creator', select: 'name profileDetails' }
    });
    
    const mappedFavorites = (user.favorites || []).map(act => {
      const actObj = act.toObject();
      if (actObj.creator) actObj.creator.avatar = actObj.creator.profileDetails?.avatar;
      return actObj;
    });
    
    res.json(mappedFavorites);
  } catch (error) {
    res.status(500).json({ message: 'Error obtenint favorits', error: error.message });
  }
};

// @desc    Obtener mis propias actividades
// @route   GET /api/activities/my
// @access  Private
exports.getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ creator: req.user._id }).sort({ createdAt: -1 }).lean();
    const mappedActivities = activities.map(act => ({
      ...act,
      participantsCount: act.participants?.length || 0
    }));
    res.json(mappedActivities);
  } catch (error) {
    res.status(500).json({ message: 'Error obtenint les teves activitats', error: error.message });
  }
};

// @desc    Eliminar una actividad
// @route   DELETE /api/activities/:id
// @access  Private
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activitat no trobada' });
    }

    if (activity.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'No tens permís per eliminar aquesta activitat' });
    }

    await activity.deleteOne();
    res.json({ success: true, message: 'Activitat eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminant activitat', error: error.message });
  }
};

// @desc    Finalizar una actividad
// @route   PUT /api/activities/:id/finalize
// @access  Private
exports.finalizeActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activitat no trobada' });
    
    if (activity.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Només el creador pot finalitzar l\'activitat' });
    }
    
    activity.status = 'FINALITZADA';
    await activity.save();
    
    // Find admin user to send the automated notification message
    let adminUser = await User.findOne({ role: 'ADMIN' });
    if (!adminUser) {
      adminUser = await User.findOne({ email: 'admin@meetsport.com' });
    }
    const adminId = adminUser ? adminUser._id : req.user._id;
    
    // Send automated message to all participants
    const Message = require('../models/Message');
    const participants = activity.participants || [];
    for (const participantId of participants) {
      if (participantId.toString() !== req.user._id.toString()) {
        const messageContent = `sha tancat la activitat ${activity.title}, es el moment de fer una valoracio [${activity._id}]`;
        await Message.create({
          sender: adminId,
          recipient: participantId,
          content: messageContent,
          read: false
        });
      }
    }
    
    res.json({ success: true, message: 'Activitat finalitzada correctament' });
  } catch (error) {
    res.status(500).json({ message: 'Error finalitzant activitat', error: error.message });
  }
};

// @desc    Obtener participantes de una actividad
// @route   GET /api/activities/:id/participants
// @access  Public
exports.getActivityParticipants = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('creator', 'name total_points profileDetails badges')
      .populate({
        path: 'participants',
        select: 'name total_points profileDetails badges',
        populate: { path: 'badges', populate: { path: 'badge' } }
      });
    
    if (!activity) return res.status(404).json({ message: 'Activitat no trobada' });
    
    const people = [...activity.participants];
    if (activity.creator) {
      people.push(activity.creator);
    }
    
    res.json(people);
  } catch (error) {
    res.status(500).json({ message: 'Error obtenint participants', error: error.message });
  }
};
