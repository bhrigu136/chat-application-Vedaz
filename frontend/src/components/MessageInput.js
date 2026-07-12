import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * Message composer row. Controlled input: parent owns the text value.
 * Calls onSend() when the send button is pressed or the keyboard "send" key
 * is used (ignored when the trimmed value is empty).
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
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        multiline={false}
        returnKeyType="send"
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
      />
      <TouchableOpacity
        style={[styles.sendButton, isEmpty && styles.disabledSendButton]}
        onPress={handleSend}
        disabled={isEmpty}
      >
        <Text style={styles.sendButtonText}>Send</Text>
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
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4A90D9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledSendButton: {
    backgroundColor: '#A2C6EC',
    opacity: 0.7,
  },
});
