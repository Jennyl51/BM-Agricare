import { View, Pressable, StyleSheet, Text } from 'react-native';
import { Link } from 'expo-router';

export default function RetailerDashboard() {
  return (
    <View>
      <Text>Home</Text>

    <Link href="/retailer-dashboard" asChild>
    <Pressable style={styles.button}>
    <Text style={styles.buttonText}>Retailer Dashboard</Text>
    </Pressable>
  </Link>
    </View>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
