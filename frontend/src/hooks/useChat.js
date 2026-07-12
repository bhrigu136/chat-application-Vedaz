import { useState, useEffect, useRef, useCallback } from 'react';
import { disconnectSocket, getSocket } from '../services/socketService';
import { fetchMessages } from '../services/api';
import { EVENTS } from '../constants/events';

const makeTempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Status progression; a message only ever moves forward.
const STATUS_RANK = { sending: 0, sent: 1, delivered: 2, read: 3 };
const rankOf = (status) => (status in STATUS_RANK ? STATUS_RANK[status] : -1);

/**
 * Chat data + socket lifecycle for a user.
 *  - loads history via REST
 *  - live messages + connection status
 *  - sendMessage() with optimistic UI + ack reconciliation
 *  - emits delivered/read receipts for incoming messages and applies
 *    incoming message_status updates to our own sent messages
 *
 * `isActive` = the chat is focused AND the app is foregrounded; gates `read`.
 */
export const useChat = (username, isActive = true) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  const deliveredSentRef = useRef(new Set()); // ids we've sent a delivered receipt for
  const readSentRef = useRef(new Set()); // ids we've sent a read receipt for
  const pendingReadRef = useRef(new Set()); // received while inactive; read once active
  const isActiveRef = useRef(isActive);

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

    const onMessage = (incoming) => {
      setMessages((prev) => [...prev, incoming]);
      if (!incoming || !incoming.id) return;

      // Acknowledge delivery once.
      if (!deliveredSentRef.current.has(incoming.id)) {
        deliveredSentRef.current.add(incoming.id);
        socket.emit(EVENTS.MESSAGE_DELIVERED, { messageId: incoming.id });
      }

      // Acknowledge read now if active, otherwise defer until active.
      if (isActiveRef.current) {
        if (!readSentRef.current.has(incoming.id)) {
          readSentRef.current.add(incoming.id);
          socket.emit(EVENTS.MESSAGE_READ, { messageId: incoming.id });
        }
      } else {
        pendingReadRef.current.add(incoming.id);
      }
    };

    // Apply delivered/read updates to our own messages (forward-only).
    const onStatus = (payload) => {
      const { messageId, status } = payload || {};
      if (!messageId || !status) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId && rankOf(status) > rankOf(m.status) ? { ...m, status } : m
        )
      );
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(EVENTS.MESSAGE, onMessage);
    socket.on(EVENTS.MESSAGE_STATUS, onStatus);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(EVENTS.MESSAGE, onMessage);
      socket.off(EVENTS.MESSAGE_STATUS, onStatus);
      disconnectSocket();
    };
  }, []);

  // When the chat becomes active, flush read receipts for anything received while away.
  useEffect(() => {
    isActiveRef.current = isActive;
    if (!isActive) return;

    const socket = getSocket();
    if (!socket) return;

    pendingReadRef.current.forEach((id) => {
      if (!readSentRef.current.has(id)) {
        readSentRef.current.add(id);
        socket.emit(EVENTS.MESSAGE_READ, { messageId: id });
      }
    });
    pendingReadRef.current.clear();
  }, [isActive]);

  const sendMessage = useCallback(
    (rawText) => {
      const text = (rawText || '').trim();
      if (!text) return;

      const socket = getSocket();
      const tempId = makeTempId();

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
