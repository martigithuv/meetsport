const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../services/stripe');
const { protect } = require('../middlewares/authMiddleware');

// @desc    Crear sesión de pago en Stripe
// @route   POST /api/stripe/create-checkout-session
// @access  Private
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const session = await createCheckoutSession(req.user._id);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error en Stripe session:', error);
    res.status(500).json({ message: 'Error al crear sesión de pago', error: error.message });
  }
});

// @desc    Verificar sesión de pago y activar Premium
// @route   GET /api/stripe/verify-session
// @access  Private
router.get('/verify-session', protect, async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ message: 'Session ID requerido' });

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const User = require('../models/User');
      const user = await User.findById(req.user._id);
      user.isPremium = true;
      await user.save();
      
      res.json({ success: true, message: 'Felicitats! Ara ets Premium.' });
    } else {
      res.status(400).json({ success: false, message: 'El pagament no s\'ha completat.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error verificant pagament', error: error.message });
  }
});

// @desc    Cancelar Premium
// @route   POST /api/stripe/cancel-premium
// @access  Private
router.post('/cancel-premium', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Usuari no trobat' });

    user.isPremium = false;
    await user.save();

    res.json({ success: true, message: 'S\'ha cancel·lat el teu pla Premium' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancel·lar el pla', error: error.message });
  }
});

module.exports = router;
