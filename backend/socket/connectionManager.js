/**
 * In-memory registry of connected sockets -> usernames.
 * Used now for connect/disconnect bookkeeping and logging; presence
 * broadcasting is built on top of this in a later phase.
 *
 * Note: this is per-process state. It is intentionally simple and fine for a
 * single backend instance; a multi-instance deployment would back this with a
 * shared store (e.g. Redis).
 */
const socketToUser = new Map(); // socketId -> username

const addConnection = (socketId, username) => {
  socketToUser.set(socketId, username);
};

const removeConnection = (socketId) => {
  const username = socketToUser.get(socketId);
  socketToUser.delete(socketId);
  return username;
};

const getUsername = (socketId) => socketToUser.get(socketId);

const getOnlineCount = () => socketToUser.size;

// Distinct usernames currently connected (a user may have multiple sockets).
const getOnlineUsers = () => [...new Set(socketToUser.values())];

module.exports = {
  addConnection,
  removeConnection,
  getUsername,
  getOnlineCount,
  getOnlineUsers,
};
