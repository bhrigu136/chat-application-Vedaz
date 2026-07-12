// Socket.io event names — must match backend/socket/events.js.
export const EVENTS = {
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
