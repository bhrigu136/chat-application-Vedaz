import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useChat } from '../hooks/useChat';
import { useTyping } from '../hooks/useTyping';
import { usePresence } from '../hooks/usePresence';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import OnlineStatusBar from '../components/OnlineStatusBar';

const ChatScreen = ({ route }) => {
  const { username } = route.params;

  // "Active" = this screen is focused AND the app is in the foreground.
  // Read receipts are only sent while active.
  const isFocused = useIsFocused();
  const [isForeground, setIsForeground] = useState(true);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      setIsForeground(state === 'active');
    });
    return () => sub.remove();
  }, []);
  const isActive = isFocused && isForeground;

  const { messages, isConnected, sendMessage } = useChat(username, isActive);
  const { typingUsers, notifyTyping, stopTyping } = useTyping();
  const { onlineUsers } = usePresence();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const handleChangeText = (text) => {
    setInputText(text);
    if (text.trim()) {
      notifyTyping();
    } else {
      stopTyping();
    }
  };

  const handleSend = () => {
    sendMessage(inputText);
    setInputText('');
    stopTyping();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Connection lost. Reconnecting...</Text>
        </View>
      )}

      <OnlineStatusBar onlineUsers={onlineUsers} currentUser={username} />

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

        <TypingIndicator users={typingUsers} />

        <MessageInput value={inputText} onChangeText={handleChangeText} onSend={handleSend} />
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
