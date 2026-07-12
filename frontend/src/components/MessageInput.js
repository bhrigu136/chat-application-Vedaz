import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../constants/theme';

/**
 * Message composer row. Controlled input: parent owns the text value.
 * Calls onSend() on the send button or the keyboard "send" key (ignored when empty).
 */
const MessageInput = ({ value, onChangeText, onSend }) => {
  const isEmpty = !value.trim();

  const handleSend = () => {
    if (!isEmpty) onSend();
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        multiline={false}
        returnKeyType="send"
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
      />
      <TouchableOpacity onPress={handleSend} disabled={isEmpty} activeOpacity={0.85}>
        <LinearGradient
          colors={isEmpty ? [colors.inputBorder, colors.inputBorder] : gradients.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sendButton}
        >
          <Text style={[styles.sendButtonText, isEmpty && styles.sendButtonTextDisabled]}>
            Send
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default MessageInput;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.receivedBorder,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 42,
    backgroundColor: colors.inputBg,
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textDark,
    marginRight: 10,
  },
  sendButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sendButtonTextDisabled: {
    color: colors.muted,
  },
});
