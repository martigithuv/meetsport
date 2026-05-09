const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../services/email');

// Generar Token JWT
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_meetsport';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET no está definido. Usando clave por defecto en desarrollo.');
  }
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Enviar email de bienvenida (sin esperar para no bloquear la respuesta)
      sendWelcomeEmail(user.email, user.name);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.profileDetails?.avatar,
        bio: user.profileDetails?.bio,
        isPremium: user.isPremium,
        favorites: user.favorites || [],
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Autenticar usuario & obtener token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.isBlocked) {
        return res.status(403).json({ message: 'El teu compte ha estat bloquejat per un administrador' });
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        avatar: user.profileDetails?.avatar,
        bio: user.profileDetails?.bio,
        favorites: user.favorites || [],
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email o contraseña inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
// @desc    Autenticar administrador con contraseña maestra
// @route   POST /api/auth/admin-login
// @access  Public
exports.loginAdmin = async (req, res) => {
  try {
    const { password } = req.body;

    if (password === '123456789') {
      // Buscar el usuario admin o crearlo si no existe
      let adminUser = await User.findOne({ email: 'admin@meetsport.com' });
      
      if (!adminUser) {
        adminUser = await User.create({
          name: 'Administrador',
          email: 'admin@meetsport.com',
          password: 'masterpassword_meetsport_2026', // Contraseña interna aleatoria
          role: 'ADMIN'
        });
      }

      res.json({
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: 'ADMIN', // Forzamos el rol ADMIN para asegurar la redirección
        token: generateToken(adminUser._id),
      });
    } else {
      res.status(401).json({ message: 'Contrasenya d\'administrador incorrecta' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
