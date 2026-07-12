import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Shows who is currently typing. Renders nothing when no one is typing.
 */
const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;

  let label;
  if (users.length === 1) {
    label = `${users[0]} is typing…`;
  } else if (users.length === 2) {
    label = `${users[0]} and ${users[1]} are typing…`;
  } else {
    label = 'Several people are typing…';
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

export default TypingIndicator;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  text: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#888',
  },
});
