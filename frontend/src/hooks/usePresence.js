import { useState, useEffect } from 'react';
import { getSocket } from '../services/socketService';
import { EVENTS } from '../constants/events';

/**
 * Tracks the list of currently-online usernames.
 * The server pushes the full list on every connect/disconnect; we also request
 * it once on mount so we have presence immediately without waiting for an event.
 */
export const usePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const onPresence = (payload) => {
      setOnlineUsers(Array.isArray(payload?.users) ? payload.users : []);
    };

    socket.on(EVENTS.PRESENCE, onPresence);
    socket.emit(EVENTS.GET_PRESENCE);

    return () => {
      socket.off(EVENTS.PRESENCE, onPresence);
    };
  }, []);

  return { onlineUsers };
};
