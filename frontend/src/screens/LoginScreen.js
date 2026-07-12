import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { connectSocket } from '../services/socketService';
import { colors, gradients } from '../constants/theme';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      Alert.alert('Validation Error', 'Please enter a username.');
      return;
    }

    setLoading(true);
    const socket = connectSocket(trimmedUsername);

    const onConnect = () => {
      socket.off('connect_error', onError);
      setLoading(false);
      navigation.navigate('Chat', { username: trimmedUsername });
    };

    const onError = (error) => {
      socket.off('connect', onConnect);
      setLoading(false);
      Alert.alert(
        'Connection Error',
        'Could not connect to the chat server. Make sure the backend is running and the device is on the same network.'
      );
      console.error('Socket connection error:', error);
    };

    if (socket.connected) {
      onConnect();
      return;
    }

    socket.once('connect', onConnect);
    socket.once('connect_error', onError);

    setTimeout(() => {
      if (!socket.connected) {
        socket.off('connect', onConnect);
        socket.off('connect_error', onError);
        setLoading(false);
        Alert.alert('Timeout', 'Connection timed out. Please try again.');
      }
    }, 5000);
  };

  const disabled = !username.trim() || loading;

  return (
    <LinearGradient
      colors={gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          source={require('../../assets/hiveflow-chat-logo.png')}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.title}>HiveFlow Chat</Text>
        <Text style={styles.subtitle}>Enter a username to start chatting</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#9AA0AC"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          blurOnSubmit={false}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={disabled}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.accent} size="small" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 24,
  },
  logo: {
    width: 104,
    height: 104,
    borderRadius: 26,
    marginBottom: 22,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 18,
    color: colors.textDark,
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  buttonText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default LoginScreen;
