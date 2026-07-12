import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../services/socketService';
import { EVENTS } from '../constants/events';

// How long after the last keystroke we consider the user to have stopped.
const STOP_DELAY_MS = 2500;
// Safety net: drop a remote typer if no stop_typing arrives (dropped event).
const REMOTE_EXPIRY_MS = 4000;

/**
 * Manages typing indicators:
 *  - notifyTyping(): throttled emit of `typing` (+ auto `stop_typing` after idle)
 *  - stopTyping(): emit `stop_typing` immediately (e.g. on send)
 *  - typingUsers: usernames of OTHER users currently typing
 */
export const useTyping = () => {
  const [typingUsers, setTypingUsers] = useState([]);
  const isTypingRef = useRef(false);
  const stopTimerRef = useRef(null);
  const remoteExpiryRef = useRef({}); // username -> timeout id

  // Listen for other users' typing state.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const clearExpiry = (user) => {
      clearTimeout(remoteExpiryRef.current[user]);
      delete remoteExpiryRef.current[user];
    };

    const onTyping = ({ username: user }) => {
      if (!user) return;
      setTypingUsers((prev) => (prev.includes(user) ? prev : [...prev, user]));
      clearExpiry(user);
      remoteExpiryRef.current[user] = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== user));
        delete remoteExpiryRef.current[user];
      }, REMOTE_EXPIRY_MS);
    };

    const onStopTyping = ({ username: user }) => {
      if (!user) return;
      clearExpiry(user);
      setTypingUsers((prev) => prev.filter((u) => u !== user));
    };

    socket.on(EVENTS.TYPING, onTyping);
    socket.on(EVENTS.STOP_TYPING, onStopTyping);

    return () => {
      socket.off(EVENTS.TYPING, onTyping);
      socket.off(EVENTS.STOP_TYPING, onStopTyping);
      Object.values(remoteExpiryRef.current).forEach(clearTimeout);
      remoteExpiryRef.current = {};
    };
  }, []);

  const stopTyping = useCallback(() => {
    clearTimeout(stopTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      const socket = getSocket();
      if (socket) socket.emit(EVENTS.STOP_TYPING);
    }
  }, []);

  const notifyTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit(EVENTS.TYPING);
    }

    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit(EVENTS.STOP_TYPING);
    }, STOP_DELAY_MS);
  }, []);

  return { typingUsers, notifyTyping, stopTyping };
};
