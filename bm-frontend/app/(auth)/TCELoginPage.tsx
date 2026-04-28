import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { login } from '@/services/authApi';

export default function TCELoginPage() {
  const backgroundImage = require('@/assets/images/LoginBackgroundOne.png');
  const brandImage = require('@/assets/images/brand_name.png');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Missing info', 'Enter username and password.');
      return;
    }
    setSubmitting(true);
    try {
      await login(username, password);
      router.replace('/tce-dashboard');
    } catch (err: any) {
      Alert.alert('Login failed', err?.message ?? 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Image source={brandImage} style={styles.logo} resizeMode="contain" />

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Signing in...' : 'Login'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push('/LoginForgetPassword')}>
          <Text style={styles.linkText}>Forgot password?</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  logo: {
    width: 313 * 1.1,
    height: 118 * 1.1,
    alignSelf: 'center',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e5e8',
    borderRadius: 14,
    backgroundColor: 'white',
    fontSize: 16,
  },
  button: {
    padding: 14,
    borderRadius: 14,
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#002F71',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  linkText: {
    color: '#0a7ea4',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
});
