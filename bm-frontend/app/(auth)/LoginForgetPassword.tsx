import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function LoginForgetPassword() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forget Password</Text>
      <Text>Forget Password</Text>
      
      <Pressable
        onPress={() => router.push('/login')}
      >
        <Text style={styles.title}>Go Back to Login</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 200,
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
})