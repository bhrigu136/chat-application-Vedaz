import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Compact bar showing who is currently online. The current user is shown as
 * "You". Renders a muted state when no presence data has arrived yet.
 */
const OnlineStatusBar = ({ onlineUsers, currentUser }) => {
  const count = onlineUsers.length;
  const names = onlineUsers
    .map((u) => (u === currentUser ? 'You' : u))
    .join(', ');

  return (
    <View style={styles.bar}>
      <View style={[styles.dot, count > 0 ? styles.dotOnline : styles.dotOffline]} />
      <Text style={styles.text} numberOfLines={1}>
        {count > 0 ? `${count} online — ${names}` : 'Connecting…'}
      </Text>
    </View>
  );
};

export default OnlineStatusBar;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#eef3f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotOnline: {
    backgroundColor: '#3ec46d',
  },
  dotOffline: {
    backgroundColor: '#bbb',
  },
  text: {
    fontSize: 12,
    color: '#555',
    flexShrink: 1,
  },
});
