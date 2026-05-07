import { View, Text, StyleSheet, Pressable, ImageBackground, Image, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { login, signup } from '@/services/authApi';
import { BM } from '@/constants/theme';
import { BackgroundBlobs, BounceButton, FadeIn } from '@/components/AgricareUI';
import { useApp } from '@/components/AppContext';

export default function RetailerLoginPage() {
  const backgroundImage = require('@/assets/images/LoginBackgroundOne.png');
  const brandImage = require('@/assets/images/brand_name.png');
  const { theme, darkMode } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('retailer@demo.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('Tin Bao Tran');
  const [phone, setPhone] = useState('+84 000 000');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password || (mode === 'signup' && !name)) {
      Alert.alert('Missing information', 'Please enter the required account information.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'signup') await signup({ username, password, name, email: username, phone_number: phone, user_type: 'retailer' });
      else await login(username, password);
      router.replace('/home-retailers');
    } catch (err: any) {
      Alert.alert('Login issue', err?.message || 'Please check backend connection or use the demo account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={[styles.background, { backgroundColor: theme.bg }]} resizeMode="cover">
      <BackgroundBlobs />
      <View style={styles.container}>
        <FadeIn delay={80} style={[styles.card, { backgroundColor: darkMode ? 'rgba(16,38,23,0.92)' : 'rgba(255,255,255,0.84)' }]}> 
          <Image source={brandImage} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.title, { color: theme.text }]}>{mode === 'login' ? 'Retailer Login' : 'Retailer Sign Up'}</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>Demo account: retailer@demo.com / password</Text>
          {mode === 'signup' ? <TextInput placeholder="Name" placeholderTextColor="#8EA08B" value={name} onChangeText={setName} style={styles.input} /> : null}
          <TextInput placeholder="Email / Username" placeholderTextColor="#8EA08B" value={username} onChangeText={setUsername} autoCapitalize="none" style={styles.input} />
          {mode === 'signup' ? <TextInput placeholder="Phone number" placeholderTextColor="#8EA08B" value={phone} onChangeText={setPhone} style={styles.input} /> : null}
          <TextInput placeholder="Password" placeholderTextColor="#8EA08B" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
          <BounceButton style={styles.button} onPress={handleSubmit} disabled={submitting}>
            <Text style={styles.buttonText}>{submitting ? 'Opening...' : mode === 'login' ? 'Login to Retailer App' : 'Create Retailer Account'}</Text>
          </BounceButton>
          <Pressable onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            <Text style={styles.linkText}>{mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}</Text>
          </Pressable>
        </FadeIn>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  card: { borderRadius: 30, padding: 22, gap: 12, shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 10 }, shadowRadius: 22, elevation: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.65)' },
  logo: { width: 220, height: 82, alignSelf: 'center' },
  title: { textAlign: 'center', fontSize: 26, fontWeight: '900' },
  subtitle: { textAlign: 'center', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  input: { width: '100%', padding: 14, borderWidth: 1, borderColor: '#dbe7d5', borderRadius: 15, backgroundColor: 'white', fontSize: 15, fontWeight: '700', color: '#0A0908' },
  button: { padding: 16, borderRadius: 16, backgroundColor: BM.deepBlue, marginTop: 6 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '900' },
  linkText: { color: BM.deepBlue, fontSize: 12, fontWeight: '900', textAlign: 'center', marginTop: 2 },
});
