/**
 * Socket.io event names — the wire contract between client and server.
 * Keep in sync with frontend/src/constants/events.js.
 */
const EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  MESSAGE_ERROR: 'message_error',
};

module.exports = EVENTS;
