import { useState, useEffect, useCallback } from 'react';
import { disconnectSocket, getSocket } from '../services/socketService';
import { fetchMessages } from '../services/api';
import { EVENTS } from '../constants/events';

const makeTempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Encapsulates all chat data + socket lifecycle for a given user:
 *  - loads history via REST on mount
 *  - subscribes to live socket messages + connection status
 *  - exposes sendMessage() with optimistic UI and ack reconciliation
 */
export const useChat = (username) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  // Load chat history via REST (database is the source of truth).
  useEffect(() => {
    let isMounted = true;
    fetchMessages()
      .then((history) => {
        if (isMounted) setMessages(history);
      })
      .catch((error) => {
        console.warn('Failed to load message history:', error.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Live updates via socket.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      return undefined;
    }

    setIsConnected(socket.connected);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onMessage = (incoming) => setMessages((prev) => [...prev, incoming]);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(EVENTS.MESSAGE, onMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(EVENTS.MESSAGE, onMessage);
      disconnectSocket();
    };
  }, []);

  const sendMessage = useCallback(
    (rawText) => {
      const text = (rawText || '').trim();
      if (!text) return;

      const socket = getSocket();
      const tempId = makeTempId();

      // Optimistic echo: show immediately with a temporary id.
      const optimistic = {
        id: tempId,
        text,
        sender: username,
        createdAt: new Date().toISOString(),
        status: 'sending',
      };
      setMessages((prev) => [...prev, optimistic]);

      if (!socket) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
        );
        return;
      }

      // Emit with an ack; reconcile the optimistic message with the server's
      // authoritative one (real id + DB timestamp) when it comes back.
      socket.emit(EVENTS.MESSAGE, { text, tempId }, (response) => {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== tempId) return m;
            if (response && response.status === 'ok' && response.message) {
              return { ...response.message, status: 'sent' };
            }
            return { ...m, status: 'failed' };
          })
        );
      });
    },
    [username]
  );

  return { messages, isConnected, sendMessage };
};
