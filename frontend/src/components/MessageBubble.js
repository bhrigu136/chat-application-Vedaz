import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime } from '../utils/formatTime';

/**
 * A single chat message bubble. Presentational only.
 * `isMe` decides alignment/colors; optimistic status is shown for own messages.
 */
const MessageBubble = ({ message, isMe }) => {
  return (
    <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
      {!isMe && <Text style={styles.senderLabel}>{message.sender}</Text>}
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
          {message.text}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.otherTimestamp]}>
            {formatTime(message.createdAt)}
          </Text>
          {isMe && message.status === 'sending' && (
            <Text style={styles.metaStatus}>· Sending…</Text>
          )}
          {isMe && message.status === 'failed' && (
            <Text style={styles.metaFailed}>· Failed</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default React.memo(MessageBubble);

const styles = StyleSheet.create({
  messageRow: {
    marginVertical: 6,
    flexDirection: 'column',
    maxWidth: '80%',
  },
  myMessageRow: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageRow: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#4A90D9',
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: '#e6e6e6',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: '#999',
  },
  metaStatus: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  metaFailed: {
    fontSize: 10,
    color: '#ffd6d6',
    marginLeft: 4,
  },
});
