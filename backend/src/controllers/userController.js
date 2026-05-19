const User = require('../models/User');

// @desc    Obtenir les dades de l'usuari actual
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuari no trobat' });
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        total_points: user.total_points || 0,
        favorites: user.favorites || [],
        avatar: user.profileDetails?.avatar,
        token: req.headers.authorization.split(' ')[1] // keep the same token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtenir dades', error: error.message });
  }
};

// @desc    Obtenir el perfil públic d'un altre usuari
// @route   GET /api/users/:id/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email profileDetails isPremium total_points followers following')
      .lean();
      
    if (!user) return res.status(404).json({ message: 'Usuari no trobat' });

    // També necessitem saber quantes activitats ha publicat per a la medalla d'organitzador
    const Activity = require('../models/Activity');
    const publishedActivitiesCount = await Activity.countDocuments({ creator: user._id });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      avatar: user.profileDetails?.avatar,
      bio: user.profileDetails?.bio,
      total_points: user.total_points || 0,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      publishedActivitiesCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtenir perfil', error: error.message });
  }
};

// @desc    Actualizar a Premium manualmente (útil para saltarse Stripe webhook)
// @route   POST /api/users/upgrade
// @access  Private
exports.upgradeToPremium = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Usuari no trobat' });
    
    user.isPremium = true;
    await user.save();
    
    res.json({ success: true, message: 'Usuari actualitzat a Premium correctament' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualitzar a Premium', error: error.message });
  }
};

// @desc    Cancelar Premium manualmente
// @route   POST /api/users/cancel-premium
// @access  Private
exports.cancelPremium = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Usuari no trobat' });
    
    user.isPremium = false;
    await user.save();
    
    res.json({ success: true, message: 'Suscripció Premium cancel·lada correctament' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancel·lar Premium', error: error.message });
  }
};

// @desc    Buscar usuarios por nombre o email
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const followingIds = (req.user.following || []).map(id => id.toString());

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user._id } // No buscarse a sí mismo
    }).select('name email profileDetails isPremium followers');

    const mappedUsers = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      avatar: u.profileDetails?.avatar,
      isPremium: u.isPremium,
      followersCount: u.followers?.length || 0,
      isFollowing: followingIds.includes(u._id.toString())
    }));

    res.json(mappedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error en la cerca d\'usuaris', error: error.message });
  }
};

// @desc    Seguir a un usuario
// @route   POST /api/users/follow/:id
// @access  Private
exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) return res.status(404).json({ message: 'Usuari no trobat' });

    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'Ja segueixes a aquest usuari' });
    }

    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user._id);

    await currentUser.save();
    await userToFollow.save();

    res.json({ success: true, message: 'Ara segueixes a aquest usuari' });
  } catch (error) {
    res.status(500).json({ message: 'Error al seguir usuari', error: error.message });
  }
};

// @desc    Dejar de seguir a un usuario
// @route   POST /api/users/unfollow/:id
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) return res.status(404).json({ message: 'Usuari no trobat' });

    currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user._id.toString());

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ success: true, message: 'Has deixat de seguir a aquest usuari' });
  } catch (error) {
    res.status(500).json({ message: 'Error al deixar de seguir usuari', error: error.message });
  }
};

// @desc    Actualizar perfil (incluyendo avatar)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, avatar, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    if (!user.profileDetails) user.profileDetails = {};

    if (avatar) {
      // Validación básica: aceptar solo data URLs de imagen o URLs normales (por compatibilidad).
      const isDataUrlImage = typeof avatar === 'string' && avatar.startsWith('data:image/');
      const isHttpUrl = typeof avatar === 'string' && /^https?:\/\//i.test(avatar);
      if (!isDataUrlImage && !isHttpUrl) {
        return res.status(400).json({ message: 'Format d\'avatar no permès' });
      }
      user.profileDetails.avatar = avatar;
    }

    if (bio !== undefined) user.profileDetails.bio = bio;

    await user.save();

    res.json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        avatar: user.profileDetails.avatar,
        bio: user.profileDetails.bio,
        followersCount: user.followers.length,
        followingCount: user.following.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualitzar perfil', error: error.message });
  }
};

// @desc    Cambiar contraseña del usuario
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Tots els camps són obligatoris' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Les contrasenyes no coincideixen' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La contrasenya ha de tenir almenys 6 caràcters' });
    }

    const user = await User.findById(req.user._id);
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Contrasenya canviada correctament' });
  } catch (error) {
    res.status(500).json({ message: 'Error al canviar la contrasenya', error: error.message });
  }
};

// @desc    Obtener contadores de seguidores
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('followers following profileViews total_points name email profileDetails isPremium')
      .populate('followers', 'name profileDetails email isPremium')
      .populate('following', 'name profileDetails email isPremium')
      .populate('profileViews.user', 'name email profileDetails isPremium')
      .lean();
    
    const mapUser = (u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      isPremium: u.isPremium,
      avatar: u.profileDetails?.avatar
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      total_points: user.total_points || 0,
      profileDetails: user.profileDetails,
      isPremium: user.isPremium,
      followers: user.followers.map(mapUser),
      following: user.following.map(mapUser),
      followersCount: user.followers.length,
      followingCount: user.following.length,
      profileViews: (() => {
        const latestByUser = new Map();
        for (const v of (user.profileViews || [])) {
          const id = v.user?._id ? v.user._id.toString() : v.user?.toString?.();
          if (!id) continue;
          const existing = latestByUser.get(id);
          if (!existing || (v.viewedAt && existing.viewedAt && v.viewedAt > existing.viewedAt)) {
            latestByUser.set(id, { user: mapUser(v.user), viewedAt: v.viewedAt });
          }
        }
        return Array.from(latestByUser.values()).sort((a, b) => b.viewedAt - a.viewedAt);
      })()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtenir estadístiques', error: error.message });
  }
};

// @desc    Registrar una visualización de perfil
// @route   POST /api/users/view/:id
// @access  Private
exports.registerProfileView = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) return res.json({ success: true });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'Usuari no trobat' });

    // Solo registramos si el perfil es premium
    if (targetUser.isPremium) {
      // Guardar una sola "visita" por usuario (si existe, actualizamos la fecha).
      const existingView = targetUser.profileViews.find(v => v.user.toString() === currentUserId.toString());

      if (existingView) {
        // Evitar escrituras constantes si el usuario refresca (ej: en la última hora)
        const isRecent = (new Date() - existingView.viewedAt) < 3600000;
        if (!isRecent) {
          existingView.viewedAt = new Date();
          await targetUser.save();
        }
      } else {
        targetUser.profileViews.push({ user: currentUserId });
        await targetUser.save();
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar visualització', error: error.message });
  }
};

// @desc    Añadir o quitar de favoritos
// @route   POST /api/users/favorites/:activityId
// @access  Private (Premium only)

// @desc    Obtener lista de favoritos
// @route   GET /api/users/favorites
// @access  Private (Premium only)
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    if (!user.isPremium) return res.status(403).json({ message: 'Opció només disponible per usuaris Premium' });

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtenir preferits', error: error.message });
  }
};

// @desc    Añadir o quitar de favoritos
// @route   POST /api/users/favorites/:activityId
// @access  Private (Premium only)
exports.toggleFavorite = async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user._id);
    if (!user.isPremium) return res.status(403).json({ message: 'Opció només disponible per usuaris Premium' });

    const { activityId } = req.params;
    const isFavorite = user.favorites.some(id => id.toString() === activityId);

    if (isFavorite) {
      user.favorites = user.favorites.filter(id => id.toString() !== activityId);
    } else {
      user.favorites.push(activityId);
    }

    await user.save();
    res.json({ success: true, isFavorite: !isFavorite });
  } catch (error) {
    res.status(500).json({ message: 'Error al gestionar preferits', error: error.message });
  }
};

// @desc    Trigger automated badge unlock chat message from admin
// @route   POST /api/users/badge-notification
// @access  Private
exports.triggerBadgeNotification = async (req, res) => {
  try {
    const { badgeType } = req.body;
    if (!badgeType || (badgeType !== 'MEDAL' && badgeType !== 'STAR')) {
      return res.status(400).json({ message: 'Tipus d\'insígnia incorrecte' });
    }

    let expectedContent = '';
    if (badgeType === 'MEDAL') {
      expectedContent = 'Has desbloquejat la medalla per publicar 30 activitats.';
    } else {
      expectedContent = 'Has desbloquejat l\'estrella per aconseguir els 8000 punts.';
    }

    // Find admin user
    let adminUser = await User.findOne({ role: 'ADMIN' });
    if (!adminUser) {
      adminUser = await User.findOne({ email: 'admin@meetsport.com' });
    }
    const adminId = adminUser ? adminUser._id : req.user._id;

    // Check if message already exists to prevent duplicate messages
    const Message = require('../models/Message');
    const existingMessage = await Message.findOne({
      sender: adminId,
      recipient: req.user._id,
      content: expectedContent
    });

    if (!existingMessage) {
      await Message.create({
        sender: adminId,
        recipient: req.user._id,
        content: expectedContent,
        read: false
      });
      return res.status(201).json({ success: true, sent: true, message: 'Notificació enviada correctament' });
    }

    res.json({ success: true, sent: false, message: 'Notificació ja enviada prèviament' });
  } catch (error) {
    res.status(500).json({ message: 'Error al processar notificació de medalla', error: error.message });
  }
};

