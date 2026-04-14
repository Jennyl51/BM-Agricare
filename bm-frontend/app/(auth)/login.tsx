import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.formBox}>
        <Text style={styles.fieldLabel}>Email</Text>
        <TextInput
         placeholder="Email"
         value={email}
         onChangeText={setEmail}
         keyboardType="email-address"
         autoCapitalize="none"
         autoCorrect={false}
         autoComplete="email"
       />
       <View style={styles.separator} />
       <Text style={styles.fieldLabel}>Password</Text>
       <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
      />
      </View>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/home-retailers')}
      >
        <Text style={styles.buttonText}>Enter as Retailer</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/tce-dashboard')}
      >
        <Text style={styles.buttonText}>Enter as TCE</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  formBox: {
    borderWidth: 1,
    borderColor: '#e2e5e8',
    borderRadius: 14,
    backgroundColor: '#f7f8f9',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#687076',
    marginBottom: 6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e5e8',
    marginVertical: 12,
  },
  button: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#222',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});
