const User = require('../models/User');
const Activity = require('../models/Activity');

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
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Usuari eliminat' });
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
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Activitat eliminada' });
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
