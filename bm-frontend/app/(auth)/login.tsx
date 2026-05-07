import { useEffect, useRef } from 'react';
import { Animated, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BM } from '@/constants/theme';
import { BackgroundBlobs, BounceButton, FadeIn } from '@/components/AgricareUI';
import { useApp } from '@/components/AppContext';

export default function LoginScreen() {
  const backgroundImage = require('@/assets/images/LoginBackgroundOne.png');
  const brandImage = require('@/assets/images/brand_name.png');
  const { theme, toggleDarkMode, darkMode } = useApp();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 2500, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 2500, useNativeDriver: true }),
    ])).start();
  }, [pulse]);

  const logoScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });

  return (
    <ImageBackground source={backgroundImage} style={[styles.background, { backgroundColor: theme.bg }]} resizeMode="cover">
      <BackgroundBlobs />
      <View style={[styles.scrim, darkMode && { backgroundColor: 'rgba(0,0,0,0.32)' }]} />
      <Pressable style={styles.darkToggle} onPress={toggleDarkMode}><Feather name={darkMode ? 'sun' : 'moon'} size={18} color={BM.deepBlue} /></Pressable>
      <View style={styles.container}>
        <FadeIn delay={80} y={28} style={styles.brandWrap}>
          <Animated.Image source={brandImage} style={[styles.logo, { transform: [{ scale: logoScale }] }]} resizeMode="contain" />
          <Text style={[styles.caption, { color: darkMode ? '#E9FBE3' : '#385F32' }]}>Invoice rewards for every verified purchase.</Text>
        </FadeIn>

        <FadeIn delay={240} y={24} style={[styles.portalCard, { backgroundColor: darkMode ? 'rgba(16,38,23,0.78)' : 'rgba(255,255,255,0.62)' }]}> 
          <Text style={[styles.portalTitle, { color: theme.text }]}>Welcome back</Text>
          <Text style={[styles.portalSub, { color: theme.muted }]}>Choose your portal to continue.</Text>
          <BounceButton style={styles.primaryButton} onPress={() => router.push('/RetailerLoginPage')}>
            <Feather name="shopping-bag" size={19} color="#FFFFFF" />
            <Text style={styles.buttonText}>Log in / Sign up as RETAILER</Text>
          </BounceButton>
          <BounceButton style={styles.primaryButton} onPress={() => router.push('/TCELoginPage')}>
            <Feather name="briefcase" size={19} color="#FFFFFF" />
            <Text style={styles.buttonText}>Log in / Sign up as TCE</Text>
          </BounceButton>
        </FadeIn>

        <FadeIn delay={440} y={8} style={styles.signupWrap}>
          <Pressable onPress={() => router.push('/RetailerLoginPage')}>
            <Text style={[styles.signup, { color: theme.muted }]}>New account? <Text style={styles.signupLink}>Sign up here</Text></Text>
          </Pressable>
        </FadeIn>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.18)' },
  darkToggle: { position: 'absolute', right: 22, top: 22, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.78)', alignItems: 'center', justifyContent: 'center', zIndex: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  brandWrap: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 258, height: 98, alignSelf: 'center' },
  caption: { marginTop: -8, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  portalCard: { gap: 13, borderRadius: 30, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.65)', shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 10 }, shadowRadius: 22, elevation: 6 },
  portalTitle: { textAlign: 'center', fontSize: 25, fontWeight: '900' },
  portalSub: { textAlign: 'center', fontSize: 12, fontWeight: '700', marginTop: -8, marginBottom: 4 },
  primaryButton: { width: '100%', minHeight: 58, borderRadius: 17, backgroundColor: BM.deepBlue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12.5, letterSpacing: 0.2 },
  signupWrap: { position: 'absolute', bottom: 42, left: 0, right: 0, alignItems: 'center' },
  signup: { fontSize: 11, fontWeight: '800' },
  signupLink: { textDecorationLine: 'underline', color: BM.deepBlue },
});
