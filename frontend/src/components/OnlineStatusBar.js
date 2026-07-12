import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

/**
 * Compact bar showing who is currently online. The current user is shown as
 * "You". Renders a muted state when no presence data has arrived yet.
 */
const OnlineStatusBar = ({ onlineUsers, currentUser }) => {
  const count = onlineUsers.length;
  const names = onlineUsers.map((u) => (u === currentUser ? 'You' : u)).join(', ');

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
    paddingVertical: 7,
    backgroundColor: '#F3F0FB',
    borderBottomWidth: 1,
    borderBottomColor: '#E9E4F7',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotOnline: {
    backgroundColor: colors.online,
  },
  dotOffline: {
    backgroundColor: '#BBB',
  },
  text: {
    fontSize: 12,
    color: '#5B5670',
    flexShrink: 1,
  },
});
