const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Cargar variables de entorno (busca en la raíz del backend o un nivel arriba)
dotenv.config(); 
if (!process.env.STRIPE_SECRET_KEY) {
    dotenv.config({ path: '../backend/.env' });
}

// Conectar a MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Configuración de Socket.io
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://localhost',
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Middlewares
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' })); // Body parser para fotos grandes
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rutas base (Ejemplos)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/stripe', require('./routes/stripeRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => {
  res.send('API de Sports Matching funcionando');
});

// Lógica de Sockets (Chat en tiempo real)
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  socket.on('join_match_room', (matchId) => {
    socket.join(matchId);
    console.log(`Usuario unido a sala de match: ${matchId}`);
  });

  socket.on('join_user_room', (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`Usuario unido a sala de usuario: ${userId}`);
  });

  socket.on('send_message', async (data) => {
    const roomId = data.recipientId || data.matchId;
    if (roomId) {
      io.to(roomId).emit('receive_message', data);
    }
    if (data.senderId) {
      io.to(data.senderId).emit('receive_message', data);
    }

    try {
      const User = require('./models/User');
      const { sendMessageNotification } = require('./services/email');
      
      // El mensaje ya se guarda en la base de datos a través del controlador REST (POST /api/messages/send/:recipientId)
      // Aquí solo nos encargamos de las notificaciones por email si es necesario.
      
      const sender = await User.findById(data.senderId);
      const recipient = await User.findById(data.recipientId);
      
      if (sender && recipient) {
        const previewText = data.content || "📸 Ha enviat una imatge";
        await sendMessageNotification(recipient.email, recipient.name, sender.name, previewText);
      }
    } catch (error) {
      console.error('Error al procesar notificación de mensaje:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en modo ${process.env.NODE_ENV || 'development'} en puerto ${PORT}`);
});
