const User = require('../models/User');
const Activity = require('../models/Activity');
const Enrollment = require('../models/Enrollment');
const Message = require('../models/Message');

// @desc    Obtenir tots els usuaris
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtenir usuaris', error: error.message });
  }
};

// @desc    Eliminar usuari
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 1. Delete user
    await User.findByIdAndDelete(userId);
    
    // 2. Cascading delete: Remove user's activities
    await Activity.deleteMany({ creator: userId });
    
    // 3. Cascading delete: Remove user's enrollments
    await Enrollment.deleteMany({ user: userId });
    
    // 4. Remove user from all other activities' participants
    await Activity.updateMany(
      { participants: userId },
      { $pull: { participants: userId } }
    );

    res.json({ success: true, message: 'Usuari i les seves dades eliminats' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuari', error: error.message });
  }
};

// @desc    Bloquejar/Desbloquejar usuari
// @route   PUT /api/admin/users/block/:id
// @access  Private/Admin
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuari no trobat' });
    
    user.isBlocked = !user.isBlocked;
    await user.save();
    
    res.json({ success: true, isBlocked: user.isBlocked });
  } catch (error) {
    res.status(500).json({ message: 'Error al bloquejar usuari', error: error.message });
  }
};

// @desc    Obtenir totes les activitats
// @route   GET /api/admin/activities
// @access  Private/Admin
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find({}).populate('creator', 'name email').sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtenir activitats', error: error.message });
  }
};

// @desc    Eliminar activitat
// @route   DELETE /api/admin/activities/:id
// @access  Private/Admin
exports.deleteActivity = async (req, res) => {
  try {
    const activityId = req.params.id;
    
    // 1. Delete activity
    await Activity.findByIdAndDelete(activityId);
    
    // 2. Cascading delete: Remove all enrollments for this activity
    await Enrollment.deleteMany({ activity: activityId });
    
    res.json({ success: true, message: 'Activitat i inscripcions eliminades' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar activitat', error: error.message });
  }
};

// @desc    Ocultar/Mostrar activitat
// @route   PUT /api/admin/activities/hide/:id
// @access  Private/Admin
exports.toggleHideActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activitat no trobada' });
    
    activity.isHidden = !activity.isHidden;
    await activity.save();
    
    res.json({ success: true, isHidden: activity.isHidden });
  } catch (error) {
    res.status(500).json({ message: 'Error al ocultar activitat', error: error.message });
  }
};

// @desc    Obtenir estadístiques per als gràfics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    // Usuaris per mes (últims 6 mesos)
    const userStats = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Guanyis Premium reals basats en quan es van crear els usuaris que ara són premium
    const earningsStats = await User.aggregate([
      { $match: { isPremium: true } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          amount: { $sum: 9.99 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const totalPremiumUsers = await User.countDocuments({ isPremium: true });
    const totalEarnings = (totalPremiumUsers * 9.99).toFixed(2);

    // Definir los meses a mostrar empezando por Mayo (índice 5)
    const monthNames = ['Maig', 'Juny', 'Juliol', 'Agost', 'Setembre'];
    
    // Calcular ganancias: como el usuario indica que la primera compra fue en Mayo,
    // agrupamos todos los premium actuales en Mayo por ahora.
    const earningsHistory = monthNames.map((name, index) => {
      const monthNum = index + 5; // Mayo es 5
      
      let amount = 0;
      if (monthNum === 5) {
        amount = parseFloat(totalEarnings);
      }
      
      return {
        month: name,
        amount: amount.toFixed(2)
      };
    });

    const totalUsers = await User.countDocuments({});

    // Historial de usuarios empezando en Mayo
    const userGrowthHistory = monthNames.map((name, index) => {
      const monthNum = index + 5;
      let count = 0;
      if (monthNum === 5) {
        count = totalUsers; // Registrados hasta Mayo
      }
      return {
        month: name,
        count
      };
    });

    res.json({
      totalUsers,
      totalPremiumUsers,
      totalEarnings,
      earningsHistory,
      userGrowthHistory
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtenir estadístiques', error: error.message });
  }
};

// @desc    Restar punts a un usuari i enviar missatge
// @route   POST /api/admin/users/deduct-points/:id
// @access  Private/Admin
exports.deductPoints = async (req, res) => {
  try {
    const { points, comment } = req.body;
    const userId = req.params.id;
    const adminId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuari no trobat' });

    // Restar punts (assegurar-se que no baixin de 0 si es vol, però l'usuari no ho ha especificat, així que restem normalment)
    user.total_points = (user.total_points || 0) - parseInt(points);
    await user.save();

    // Enviar missatge al xat
    const message = await Message.create({
      sender: adminId,
      recipient: userId,
      content: `⚠️ NOTIFICACIÓ D'ADMINISTRACIÓ: Has tingut una deducció de ${points} punts pel següent motiu: "${comment}".`
    });

    // Emissió per socket en temps real
    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('receive_message', {
        _id: message._id,
        senderId: adminId,
        senderName: 'MeetSport Admin',
        recipientId: userId,
        content: message.content,
        time: message.createdAt
      });
      
      io.to(userId).emit('points_updated', {
        total_points: user.total_points,
        pointsAwarded: -parseInt(points)
      });
    }

    res.json({ success: true, message: 'Punts restats i missatge enviat correctament', newPoints: user.total_points });
  } catch (error) {
    res.status(500).json({ message: 'Error al restar punts', error: error.message });
  }
};

// @desc    Actualitzar activitat
// @route   PUT /api/admin/activities/:id
// @access  Private/Admin
exports.updateActivity = async (req, res) => {
  try {
    const { title, sport, description, date, maxParticipants, level, address, url, status } = req.body;
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activitat no trobada' });
    
    activity.title = title || activity.title;
    activity.sport = sport || activity.sport;
    activity.description = description !== undefined ? description : activity.description;
    activity.date = date || activity.date;
    activity.maxParticipants = maxParticipants || activity.maxParticipants;
    activity.level = level || activity.level;
    activity.status = status || activity.status;
    
    if (activity.location) {
      activity.location.address = address !== undefined ? address : activity.location.address;
      activity.location.url = url !== undefined ? url : activity.location.url;
    } else {
      activity.location = {
        type: 'Point',
        coordinates: [2.1734, 41.3851], // BCN default coordinates
        address: address || '',
        url: url || ''
      };
    }
    
    await activity.save();
    res.json({ success: true, message: 'Activitat actualitzada correctament', activity });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualitzar activitat', error: error.message });
  }
};
