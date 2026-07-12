import { io } from 'socket.io-client';
import { SERVER_URL } from '../constants/config';

let socket = null;

export const connectSocket = (username) => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SERVER_URL, {
    auth: { username },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

