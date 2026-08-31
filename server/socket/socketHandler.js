const User = require('../models/User');

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('setup', async (userData) => {
      if (!userData || !userData._id) return;

      const userId = userData._id.toString();
      socket.join(userId);
      socket.userId = userId;

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);

      try {
        await User.findByIdAndUpdate(userId, { status: 'online' });
        io.emit('user_status_changed', { userId, status: 'online' });
      } catch (err) {
        console.error('Error updating online status:', err.message);
      }

      socket.emit('connected');
    });

    socket.on('join_chat', (room) => {
      socket.join(room);
      console.log(`User ${socket.userId} joined chat room: ${room}`);
    });

    socket.on('leave_chat', (room) => {
      socket.leave(room);
      console.log(`User ${socket.userId} left chat room: ${room}`);
    });

    socket.on('typing', ({ room, user }) => {
      socket.to(room).emit('typing', { room, user });
    });

    socket.on('stop_typing', ({ room, user }) => {
      socket.to(room).emit('stop_typing', { room, user });
    });

    socket.on('send_message', (newMessageReceived) => {
      const chat = newMessageReceived.chatId;

      if (!chat || !chat.participants) {
        return console.log('chat.participants not defined');
      }

      const senderId = newMessageReceived.sender?._id?.toString() || newMessageReceived.sender?.toString();

      chat.participants.forEach((participant) => {
        const participantId = typeof participant === 'object' ? participant._id.toString() : participant.toString();
        // Skip the sender — they already added it to local state optimistically
        if (participantId === senderId) return;
        io.to(participantId).emit('message_received', newMessageReceived);
      });
    });

    socket.on('mark_as_read', ({ chatId, userId }) => {
      socket.to(chatId).emit('messages_read', { chatId, userId });
    });

    socket.on('disconnect', async () => {
      console.log('Socket disconnected:', socket.id);
      const userId = socket.userId;

      if (userId && onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          const lastSeen = new Date();
          try {
            await User.findByIdAndUpdate(userId, { status: 'offline', lastSeen });
            io.emit('user_status_changed', { userId, status: 'offline', lastSeen });
          } catch (err) {
            console.error('Error updating offline status:', err.message);
          }
        }
      }
    });
  });
};

module.exports = socketHandler;
