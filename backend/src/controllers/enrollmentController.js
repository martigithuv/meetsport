const Enrollment = require('../models/Enrollment');
const Activity = require('../models/Activity');
const User = require('../models/User');

// @desc    Obtener todas las inscripciones del usuario
// @route   GET /api/enrollments/my
// @access  Private
exports.getMyEnrollments = async (req, res) => {
  try {
    // Correct nested populate syntax for Mongoose
    const enrollments = await Enrollment.find({ user: req.user._id, status: 'ACTIVE' })
      .populate({
        path: 'activity',
        populate: { path: 'creator', select: 'name profileDetails' }
      })
      .lean();

    const enriched = enrollments
      .filter(e => e.activity) // Filter out enrollments for deleted activities
      .map(enrollment => {
        const activity = enrollment.activity;
        const participantsCount = activity.participants?.length || 0;
        const availableSlots = Math.max(0, activity.maxParticipants - participantsCount);
        if (activity.creator) activity.creator.avatar = activity.creator.profileDetails?.avatar;
        return {
          ...activity,
          enrollmentId: enrollment._id.toString(),
          _id: activity._id.toString(),
          participantsCount,
          availableSlots,
          isFull: availableSlots === 0,
          enrolledAt: enrollment.enrolledAt
        };
      });

    res.json(enriched);
  } catch (error) {
    console.error('[enrollmentController] getMyEnrollments error:', error);
    res.status(500).json({ message: 'Error obteniendo inscripciones', error: error.message });
  }
};

// @desc    Inscribirse a una actividad (usando Enrollment)
// @route   POST /api/enrollments/:activityId
// @access  Private
exports.enrollInActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.activityId);

    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    // Block enrollment on FINALITZADA activities
    if (activity.status === 'FINALITZADA' || activity.status === 'COMPLETED' || activity.status === 'CANCELLED') {
      return res.status(400).json({ message: 'No pots inscriure\'t en activitats finalitzades o cancel·lades' });
    }

    // Verificar si ya existe una inscripción (any status)
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      activity: req.params.activityId
    });

    if (existingEnrollment && existingEnrollment.status === 'ACTIVE') {
      return res.status(400).json({ message: 'Ja estàs inscrit en aquesta activitat' });
    }

    // If previously cancelled, reactivate
    if (existingEnrollment && existingEnrollment.status === 'CANCELLED') {
      // Check capacity first
      const participantsCount = activity.participants?.length || 0;
      if (participantsCount >= activity.maxParticipants) {
        return res.status(400).json({ message: 'No hi ha places disponibles' });
      }

      existingEnrollment.status = 'ACTIVE';
      existingEnrollment.cancelledAt = undefined;
      existingEnrollment.enrolledAt = new Date();
      await existingEnrollment.save();

      if (!activity.participants.map(p => p.toString()).includes(req.user._id.toString())) {
        activity.participants.push(req.user._id);
      }
      if (activity.participants.length >= activity.maxParticipants) {
        activity.status = 'FULL';
      } else {
        activity.status = 'OPEN';
      }
      await activity.save();

      return res.status(200).json(existingEnrollment);
    }

    // Verificar si hay plazas disponibles
    const participantsCount = activity.participants?.length || 0;
    if (participantsCount >= activity.maxParticipants) {
      return res.status(400).json({ message: 'No hi ha places disponibles' });
    }

    // Crear inscripción
    const enrollment = await Enrollment.create({
      user: req.user._id,
      activity: req.params.activityId
    });

    // Agregar usuario a participants de Activity
    if (!activity.participants.map(p => p.toString()).includes(req.user._id.toString())) {
      activity.participants.push(req.user._id);
    }
    
    // Actualizar estado a FULL si se alcanza el máximo
    if (activity.participants.length >= activity.maxParticipants) {
      activity.status = 'FULL';
    }
    await activity.save();

    // Agregar enrollment a usuario
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { enrollments: enrollment._id } },
      { new: true }
    );

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('[enrollmentController] enrollInActivity error:', error);
    res.status(400).json({ message: 'Error inscribiéndose en la actividad', error: error.message });
  }
};

// @desc    Cancelar inscripción
// @route   DELETE /api/enrollments/:activityId
// @access  Private
exports.cancelEnrollment = async (req, res) => {
  try {
    console.log(`[BACKEND DEBUG] cancelEnrollment request: user=${req.user._id}, activity=${req.params.activityId}`);
    
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      activity: req.params.activityId,
      status: { $ne: 'CANCELLED' }
    });

    if (!enrollment) {
      console.log(`[BACKEND DEBUG] Enrollment not found for user ${req.user._id} and activity ${req.params.activityId}`);
      return res.status(404).json({ message: 'Inscripció no trobada o ja cancel·lada' });
    }

    // Mark as cancelled
    enrollment.status = 'CANCELLED';
    enrollment.cancelledAt = new Date();
    await enrollment.save();
    console.log('[enrollmentController] Enrollment marked as CANCELLED');

    // Remove user from activity participants
    const activity = await Activity.findById(req.params.activityId);
    if (activity) {
      const before = activity.participants.length;
      activity.participants = activity.participants.filter(
        p => p.toString() !== req.user._id.toString()
      );
      console.log(`[enrollmentController] Participants: ${before} -> ${activity.participants.length}`);

      // Only change status if not already FINALITZADA
      if (activity.status !== 'FINALITZADA' && activity.status !== 'COMPLETED') {
        if (activity.participants.length < activity.maxParticipants) {
          activity.status = 'OPEN';
        }
      }
      await activity.save();
    }

    // Remove enrollment reference from user
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { enrollments: enrollment._id } },
      { new: true }
    );

    console.log('[enrollmentController] cancelEnrollment completed successfully');
    res.json({ success: true, message: 'Inscripció cancel·lada correctament' });
  } catch (error) {
    console.error('[enrollmentController] cancelEnrollment error:', error);
    res.status(500).json({ message: 'Error cancel·lant inscripció', error: error.message });
  }
};

// @desc    Verificar si usuario está inscrito
// @route   GET /api/enrollments/check/:activityId
// @access  Private
exports.checkEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      activity: req.params.activityId,
      status: 'ACTIVE'
    });

    res.json({
      isEnrolled: !!enrollment,
      enrollmentId: enrollment?._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verificando inscripción', error: error.message });
  }
};
