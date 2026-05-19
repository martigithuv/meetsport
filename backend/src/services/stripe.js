const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (userId) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          // Nota: Deberías crear un producto en Stripe y poner su ID aquí
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'MeetSport Premium',
              description: 'Accés il·limitat i funcionalitats destacades',
            },
            unit_amount: 999, // 9.99€
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/explore?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/premium?payment=canceled`,
      client_reference_id: userId.toString(),
    });

    return session;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    
    if (userId) {
      try {
        const User = require('../models/User');
        await User.findByIdAndUpdate(userId, { isPremium: true });
        console.log(`Usuario ${userId} es ahora premium y las ganancias se han actualizado!`);
      } catch (error) {
        console.error('Error al actualizar usuario a premium:', error);
      }
    }
  }

  res.send();
};
