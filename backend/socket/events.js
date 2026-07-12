/**
 * Socket.io event names — the wire contract between client and server.
 * Keep in sync with frontend/src/constants/events.js.
 */
const EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  MESSAGE_ERROR: 'message_error',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',
  PRESENCE: 'presence',
  GET_PRESENCE: 'get_presence',
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGE_READ: 'message_read',
  MESSAGE_STATUS: 'message_status',
};

module.exports = EVENTS;
