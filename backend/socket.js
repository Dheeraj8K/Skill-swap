function setupSocketIO(io) {
  // Map of roomId => Set of sockets/users
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log('⚡ Client connected:', socket.id);

    // Join Video Room
    socket.on('join-room', ({ roomId, userId, userName, userAvatar }) => {
      socket.join(roomId);
      socket.data = { roomId, userId, userName, userAvatar };

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);

      console.log(`👤 ${userName} (${socket.id}) joined room: ${roomId}`);

      // Notify others in room
      socket.to(roomId).emit('user-connected', {
        socketId: socket.id,
        userId,
        userName,
        userAvatar
      });

      // Send existing participants to the new user
      const participants = [];
      const roomSockets = rooms.get(roomId);
      for (const sId of roomSockets) {
        if (sId !== socket.id) {
          const s = io.sockets.sockets.get(sId);
          if (s && s.data) {
            participants.push({ socketId: sId, ...s.data });
          }
        }
      }
      socket.emit('room-participants', participants);
    });

    // WebRTC Signaling
    socket.on('signal-offer', ({ targetSocketId, offer }) => {
      io.to(targetSocketId).emit('signal-offer', {
        callerSocketId: socket.id,
        offer,
        callerData: socket.data
      });
    });

    socket.on('signal-answer', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('signal-answer', {
        responderSocketId: socket.id,
        answer
      });
    });

    socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('ice-candidate', {
        fromSocketId: socket.id,
        candidate
      });
    });

    // In-call text messages
    socket.on('send-call-message', ({ roomId, message, senderName, senderAvatar }) => {
      io.to(roomId).emit('new-call-message', {
        id: 'cmsg_' + Date.now(),
        message,
        senderName: senderName || socket.data?.userName || 'Anonymous',
        senderAvatar: senderAvatar || socket.data?.userAvatar,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    // Collaborative shared notes / code
    socket.on('update-shared-notes', ({ roomId, notes }) => {
      socket.to(roomId).emit('shared-notes-updated', { notes, updatedBy: socket.data?.userName });
    });

    // Media toggle status (Mute/Video off/Screen sharing)
    socket.on('toggle-media-status', ({ roomId, isAudioMuted, isVideoOff, isScreenSharing }) => {
      socket.to(roomId).emit('peer-media-status', {
        socketId: socket.id,
        isAudioMuted,
        isVideoOff,
        isScreenSharing
      });
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
      const { roomId, userName } = socket.data || {};
      if (roomId && rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
        }
        socket.to(roomId).emit('user-disconnected', {
          socketId: socket.id,
          userName
        });
      }
      console.log('🔌 Client disconnected:', socket.id);
    });
  });
}

module.exports = setupSocketIO;
