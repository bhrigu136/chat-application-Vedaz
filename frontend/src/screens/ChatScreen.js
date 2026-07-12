import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  AppState,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { colors } from '../constants/theme';
import { useChat } from '../hooks/useChat';
import { useTyping } from '../hooks/useTyping';
import { usePresence } from '../hooks/usePresence';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import OnlineStatusBar from '../components/OnlineStatusBar';

const ChatScreen = ({ route }) => {
  const { username } = route.params;
  const insets = useSafeAreaInsets();

  // "Active" = this screen is focused AND the app is in the foreground.
  const isFocused = useIsFocused();
  const [isForeground, setIsForeground] = useState(true);

  // Track the real keyboard height and pad by exactly that. Deterministic and
  // reliable under Android edge-to-edge (unlike KeyboardAvoidingView offsets).
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const appSub = AppState.addEventListener('change', (state) => {
      setIsForeground(state === 'active');
    });
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      appSub.remove();
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isActive = isFocused && isForeground;

  const { messages, isConnected, sendMessage } = useChat(username, isActive);
  const { typingUsers, notifyTyping, stopTyping } = useTyping();
  const { onlineUsers } = usePresence();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  // Keep the latest message visible when the keyboard opens.
  useEffect(() => {
    if (keyboardHeight > 0) {
      const t = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [keyboardHeight]);

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

  const isEmpty = messages.length === 0;
  // Above the keyboard when open; above the system nav bar when closed.
  const bottomPad = keyboardHeight > 0 ? keyboardHeight : insets.bottom;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={[styles.container, { paddingBottom: bottomPad }]}>
        {!isConnected && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>Connection lost. Reconnecting...</Text>
          </View>
        )}

        <OnlineStatusBar onlineUsers={onlineUsers} currentUser={username} />

        <FlatList
          ref={flatListRef}
          style={styles.list}
          data={messages}
          renderItem={({ item }) => (
            <MessageBubble message={item} isMe={item.sender === username} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, isEmpty && styles.emptyListContainer]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySub}>Say hello 👋</Text>
            </View>
          }
        />

        <TypingIndicator users={typingUsers} />

        <MessageInput value={inputText} onChangeText={handleChangeText} onSend={handleSend} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  emptySub: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
  },
  offlineBanner: {
    backgroundColor: colors.offline,
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
