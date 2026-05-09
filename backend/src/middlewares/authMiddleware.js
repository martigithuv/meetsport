const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_meetsport';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
      }
      
      next();
    } catch (error) {
      console.error("JWT ERROR:", error.message);
      return res.status(401).json({ message: 'No autorizado, token fallido: ' + error.message });
    }
  } else {
    return res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(401).json({ 
      success: false,
      message: 'No autorizado como administrador. Rol actual: ' + (req.user ? req.user.role : 'ninguno') 
    });
  }
};

module.exports = { protect, admin };
