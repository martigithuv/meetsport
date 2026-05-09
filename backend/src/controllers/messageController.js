const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Obtener lista de conversaciones
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    }).sort({ createdAt: -1 });

    const otherUserIds = [...new Set(messages.map(m =>
      m.sender.toString() === userId.toString() ? m.recipient.toString() : m.sender.toString()
    ))];

    const conversations = await Promise.all(otherUserIds.map(async (id) => {
      const otherUser = await User.findById(id).select('name email avatar isPremium');
      const lastMsg = await Message.findOne({
        $or: [
          { sender: userId, recipient: id },
          { sender: id, recipient: userId }
        ]
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        sender: id,
        recipient: userId,
        read: false
      });

      return {
        id: otherUser._id,
        name: otherUser.name,
        avatar: otherUser.avatar,
        isPremium: otherUser.isPremium,
        lastMessage: lastMsg.content || (lastMsg.image ? "📸 Foto" : ""),
        time: lastMsg.createdAt,
        unread: unreadCount > 0
      };
    }));

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error obtenint converses', error: error.message });
  }
};

// @desc    Obtener mensajes con un usuario específico
exports.getMessagesWithUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]
    }).sort({ createdAt: 1 });

    // Marcar como leídos
    await Message.updateMany(
      { sender: otherUserId, recipient: userId, read: false },
      { $set: { read: true } }
    );

    res.json(messages.map(m => ({
      id: m._id,
      content: m.content,
      image: m.image,
      time: m.createdAt,
      read: m.read,
      isMe: m.sender.toString() === userId.toString()
    })));
  } catch (error) {
    res.status(500).json({ message: 'Error obtenint missatges', error: error.message });
  }
};

// @desc    Marcar conversación como leída
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const recipientId = req.params.recipientId;
    const { content, image } = req.body;

    if (!content && !image) {
      return res.status(400).json({ message: 'El missatge no pot estar buit' });
    }

    if (senderId.toString() === recipientId.toString()) {
      return res.status(400).json({ message: 'No et pots enviar un missatge a tu mateix' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Usuari destinatari no trobat' });
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content,
      image
    });

    res.status(201).json({
      id: message._id,
      content: message.content,
      image: message.image,
      time: message.createdAt,
      read: message.read,
      isMe: true,
      senderId,
      recipientId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error enviant missatge', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    await Message.updateMany(
      { sender: otherUserId, recipient: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
