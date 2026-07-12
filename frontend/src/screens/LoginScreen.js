import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { connectSocket } from '../services/socketService';

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

    // If socket is already connected (e.g. returning to screen)
    if (socket.connected) {
      onConnect();
      return;
    }

    socket.once('connect', onConnect);
    socket.once('connect_error', onError);

    // Timeout fallback if connection hangs
    setTimeout(() => {
      if (!socket.connected) {
        socket.off('connect', onConnect);
        socket.off('connect_error', onError);
        setLoading(false);
        Alert.alert('Timeout', 'Connection timed out. Please try again.');
      }
    }, 5000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Chat App</Text>
        <Text style={styles.subtitle}>Enter your username to start chatting</Text>

        <TextInput
          style={[styles.input, loading && styles.disabledInput]}
          placeholder="Username"
          placeholderTextColor="#999"
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
          style={[styles.button, (!username.trim() || loading) && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={!username.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4A90D9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#A2C6EC',
    opacity: 0.8,
  },
  disabledInput: {
    backgroundColor: '#eaeaea',
    color: '#888',
  },
});

export default LoginScreen;
