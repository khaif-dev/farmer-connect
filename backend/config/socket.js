const { Server } = require('socket.io');
const ChatMessage = require('../models/chat');

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Middleware for socket authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      // Simple token parsing (in production, use proper JWT verification)
      const parts = token.split('-');
      if (parts.length >= 3 && parts[0] === 'token') {
        socket.userId = parts[1];
        return next();
      }
      return next(new Error('Invalid token format'));
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  // Socket connection handling
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join user to all their listing rooms for receiving messages about their listings
    socket.on('join_listing', (listingId) => {
      socket.join(`listing_${listingId}`);
      console.log(`User ${socket.userId} joined listing ${listingId}`);
    });

    // Leave listing room
    socket.on('leave_listing', (listingId) => {
      socket.leave(`listing_${listingId}`);
      console.log(`User ${socket.userId} left listing ${listingId}`);
    });

    // Handle new messages
    socket.on('send_message', async (data) => {
      try {
        const { listingId, receiverId, message } = data;
        const senderId = socket.userId;

        // Validate input
        if (!listingId || !receiverId || !message) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        // Save message to database
        const chatMessage = new ChatMessage({
          sender: senderId,
          receiver: receiverId,
          listingId,
          message: message.trim(),
          sentAt: new Date()
        });

        await chatMessage.save();

        // Populate sender and receiver info
        await chatMessage.populate([
          { path: 'sender', select: 'firstName lastName userType' },
          { path: 'receiver', select: 'firstName lastName userType' }
        ]);

        const messageData = {
          _id: chatMessage._id,
          sender: chatMessage.sender,
          receiver: chatMessage.receiver,
          listingId: chatMessage.listingId,
          message: chatMessage.message,
          sentAt: chatMessage.sentAt,
          read: chatMessage.read
        };

        // Send to receiver
        io.to(`user_${receiverId}`).emit('new_message', messageData);
        
        // Send to sender (confirmation)
        socket.emit('message_sent', messageData);

        // Also send to listing room (for real-time updates)
        io.to(`listing_${listingId}`).emit('message_updated', messageData);

        console.log(`Message sent from ${senderId} to ${receiverId} for listing ${listingId}`);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { listingId, receiverId } = data;
      socket.to(`user_${receiverId}`).emit('user_typing', {
        listingId,
        userId: socket.userId,
        typing: true
      });
    });

    socket.on('stop_typing', (data) => {
      const { listingId, receiverId } = data;
      socket.to(`user_${receiverId}`).emit('user_typing', {
        listingId,
        userId: socket.userId,
        typing: false
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  return io;
};

module.exports = setupSocket;