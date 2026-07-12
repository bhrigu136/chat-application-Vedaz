const messageService = require('../services/messageService');

const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    const username = socket.handshake.auth.username;
    console.log(`User connected: ${username} (${socket.id})`);

    // 1. Send conversation history to the newly connected client
    const history = messageService.getMessages();
    socket.emit('message_history', history);

    // Listen for incoming messages from this client
    socket.on('message', async (messageData) => {
      console.log(`Message received from ${username}:`, messageData.text);
      
      // Basic server-side validation
      if (!messageData || !messageData.text || !messageData.text.trim()) {
        return;
      }

      const formattedMessage = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text: messageData.text,
        sender: username,
        timestamp: messageData.timestamp,
      };

      // 2. Persist the message to JSON file storage
      await messageService.saveMessage(formattedMessage);

      // 3. Broadcast the message to all other connected clients
      socket.broadcast.emit('message', formattedMessage);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${username} (${socket.id})`);
    });
  });
};

module.exports = registerSocketHandlers;

