const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginAdmin } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin-login', loginAdmin);

// Ruta de ejemplo para obtener el perfil logueado
router.get('/profile', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;
