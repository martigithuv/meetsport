const User = require('../models/User');

// @desc    Buscar usuarios por nombre o email
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

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
      followersCount: u.followers?.length || 0
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
    if (avatar) user.profileDetails.avatar = avatar;
    if (bio) user.profileDetails.bio = bio;

    await user.save();

    res.json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        avatar: user.profileDetails.avatar,
        followersCount: user.followers.length,
        followingCount: user.following.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualitzar perfil', error: error.message });
  }
};

// @desc    Obtener contadores de seguidores
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('followers following profileViews')
      .populate('followers', 'name profileDetails email isPremium')
      .populate('following', 'name profileDetails email isPremium')
      .populate('profileViews.user', 'name email profileDetails isPremium');
    
    const mapUser = (u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      isPremium: u.isPremium,
      avatar: u.profileDetails?.avatar
    });

    res.json({
      followers: user.followers.map(mapUser),
      following: user.following.map(mapUser),
      followersCount: user.followers.length,
      followingCount: user.following.length,
      profileViews: user.profileViews.map(v => ({
        user: mapUser(v.user),
        viewedAt: v.viewedAt
      })).sort((a, b) => b.viewedAt - a.viewedAt)
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
      // Evitar duplicados recientes (ej: en la última hora)
      const recentView = targetUser.profileViews.find(v => 
        v.user.toString() === currentUserId.toString() && 
        (new Date() - v.viewedAt) < 3600000
      );

      if (!recentView) {
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
exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.isPremium) return res.status(403).json({ message: 'Opció només disponible per usuaris Premium' });

    const { activityId } = req.params;
    const isFavorite = user.favorites.includes(activityId);

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
