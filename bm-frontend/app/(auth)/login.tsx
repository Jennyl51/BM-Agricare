import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/retailer-dashboard')}
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