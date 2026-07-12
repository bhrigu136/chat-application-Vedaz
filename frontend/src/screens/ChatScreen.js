import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChat } from '../hooks/useChat';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';

const ChatScreen = ({ route }) => {
  const { username } = route.params;
  const { messages, isConnected, sendMessage } = useChat(username);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const handleSend = () => {
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Connection lost. Reconnecting...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => (
            <MessageBubble message={item} isMe={item.sender === username} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <MessageInput value={inputText} onChangeText={setInputText} onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  offlineBanner: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  offlineText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChatScreen;
