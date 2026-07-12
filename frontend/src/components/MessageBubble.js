import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatTime } from '../utils/formatTime';
import { colors, gradients } from '../constants/theme';

/**
 * Status ticks for the sender's own messages:
 *   sending ⋯ · sent ✓ · delivered ✓✓ · read ✓✓ (honey) · failed
 */
const StatusTicks = ({ status }) => {
  switch (status) {
    case 'sending':
      return <Text style={[styles.tick, styles.tickDim]}>⋯</Text>;
    case 'sent':
      return <Text style={[styles.tick, styles.tickDim]}>✓</Text>;
    case 'delivered':
      return <Text style={[styles.tick, styles.tickDim]}>✓✓</Text>;
    case 'read':
      return <Text style={[styles.tick, styles.tickRead]}>✓✓</Text>;
    case 'failed':
      return <Text style={[styles.tick, styles.tickFailed]}>Failed</Text>;
    default:
      return null;
  }
};

const MessageBubble = ({ message, isMe }) => {
  const content = (
    <>
      <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
        {message.text}
      </Text>
      <View style={styles.metaRow}>
        <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.otherTimestamp]}>
          {formatTime(message.createdAt)}
        </Text>
        {isMe && <StatusTicks status={message.status} />}
      </View>
    </>
  );

  return (
    <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
      {!isMe && <Text style={styles.senderLabel}>{message.sender}</Text>}
      {isMe ? (
        <LinearGradient
          colors={gradients.sent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.myBubble]}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.otherBubble]}>{content}</View>
      )}
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
    color: colors.muted,
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: colors.received,
    borderWidth: 1,
    borderColor: colors.receivedBorder,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 21,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: colors.textDark,
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
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherTimestamp: {
    color: colors.muted,
  },
  tick: {
    fontSize: 11,
    marginLeft: 4,
  },
  tickDim: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tickRead: {
    color: '#FFD166',
    fontWeight: '700',
  },
  tickFailed: {
    fontSize: 10,
    color: '#FFE0E0',
  },
});
