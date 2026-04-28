import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  ImageBackground,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const brandImage = require('@/assets/images/brand_name.png');
  const backgroundImage = require('@/assets/images/LoginBackgroundOne.png');


  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode = 'cover'
    >
    <View style={styles.container}>
      {/* Logo Image on the top of the screen */}
      <Image 
        source={brandImage} 
        style={styles.logo} 
        resizeMode="contain"
      />

      <Pressable
        style={styles.button}
        onPress={() => router.push('/RetailerLoginPage')}
      >
        <Text style={styles.buttonText}>Enter as Retailer</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/TCELoginPage')}
      >
        <Text style={styles.buttonText}>Enter as TCE</Text>
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
    justifyContent: 'flex-start',
    paddingTop: 275,
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 313 * 1.1,
    height: 118 * 1.1,
    alignSelf: 'center',
    marginBottom: 20,
  },
  formBox: {
    borderWidth: 1,
    borderColor: '#e2e5e8',
    borderRadius: 14,
    backgroundColor: '#f7f8f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#687076',
    marginBottom: 6,
  },
  linkText: {
    color: '#0a7ea4',
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e5e8',
    marginVertical: 12,
  },
  button: {
    padding: 14,
    borderRadius: 14,
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#002F71',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});
