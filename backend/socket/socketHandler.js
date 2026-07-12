const messageService = require('../services/messageService');
const connectionManager = require('./connectionManager');
const EVENTS = require('./events');

const registerSocketHandlers = (io) => {
  io.on(EVENTS.CONNECTION, (socket) => {
    const username = socket.handshake.auth?.username || 'Anonymous';
    connectionManager.addConnection(socket.id, username);
    console.log(
      `User connected: ${username} (${socket.id}) | online: ${connectionManager.getOnlineCount()}`
    );

    // Announce the updated online-users list to everyone.
    io.emit(EVENTS.PRESENCE, { users: connectionManager.getOnlineUsers() });

    // Let a client explicitly fetch the current online list (e.g. on screen mount).
    socket.on(EVENTS.GET_PRESENCE, () => {
      socket.emit(EVENTS.PRESENCE, { users: connectionManager.getOnlineUsers() });
    });

    // Chat history is loaded by the client via GET /api/messages (REST).
    // Sockets carry only live message delivery.
    socket.on(EVENTS.MESSAGE, async (payload, ack) => {
      const text = payload?.text;
      const tempId = payload?.tempId;

      // Server-side validation
      if (typeof text !== 'string' || !text.trim()) {
        if (typeof ack === 'function') {
          ack({ status: 'error', tempId, error: 'Message text is required.' });
        }
        return;
      }

      try {
        // Persist (server assigns id + timestamp) and get the canonical message.
        const saved = await messageService.saveMessage({ text, sender: username });

        // Deliver to everyone else in real time.
        socket.broadcast.emit(EVENTS.MESSAGE, saved);

        // Acknowledge the sender with the authoritative message so the client
        // can reconcile its optimistic copy (temp id -> real id + timestamp).
        if (typeof ack === 'function') {
          ack({ status: 'ok', tempId, message: saved });
        }
      } catch (error) {
        console.error('Failed to persist/broadcast message:', error.message);
        if (typeof ack === 'function') {
          ack({ status: 'error', tempId, error: 'Failed to send message. Please try again.' });
        } else {
          socket.emit(EVENTS.MESSAGE_ERROR, {
            error: 'Failed to send message. Please try again.',
          });
        }
      }
    });

    // Relay typing state to everyone else (server supplies who is typing).
    socket.on(EVENTS.TYPING, () => {
      socket.broadcast.emit(EVENTS.TYPING, { username });
    });

    socket.on(EVENTS.STOP_TYPING, () => {
      socket.broadcast.emit(EVENTS.STOP_TYPING, { username });
    });

    // Relay delivery/read receipts back to the (other) message senders.
    socket.on(EVENTS.MESSAGE_DELIVERED, (payload) => {
      const messageId = payload?.messageId;
      if (!messageId) return;
      socket.broadcast.emit(EVENTS.MESSAGE_STATUS, { messageId, status: 'delivered' });
    });

    socket.on(EVENTS.MESSAGE_READ, (payload) => {
      const messageId = payload?.messageId;
      if (!messageId) return;
      socket.broadcast.emit(EVENTS.MESSAGE_STATUS, { messageId, status: 'read' });
    });

    socket.on(EVENTS.DISCONNECT, () => {
      connectionManager.removeConnection(socket.id);
      console.log(
        `User disconnected: ${username} (${socket.id}) | online: ${connectionManager.getOnlineCount()}`
      );

      // Announce the updated online-users list to everyone remaining.
      io.emit(EVENTS.PRESENCE, { users: connectionManager.getOnlineUsers() });
    });
  });
};

module.exports = registerSocketHandlers;
