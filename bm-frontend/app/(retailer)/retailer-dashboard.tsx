import { View, Pressable, StyleSheet ,Text } from 'react-native';
import { Link } from 'expo-router';

export default function RetailerDashboard() {
  return (
    <View style={styles.container}>
      <Text>Retailer Dashboard</Text>
      
    <Link href="/rewards-page" asChild>
    <Pressable style={styles.button}>
      <Text style={styles.buttonText}>Go to Rewards - specific product</Text>
    </Pressable>
  </Link>
  <Link href="/rewards" asChild>
    <Pressable style={styles.button}>
      <Text style={styles.buttonText}>Rewards</Text>
    </Pressable>
  </Link>
  <Link href="/points-transaction" asChild>
    <Pressable style={styles.button}>
      <Text style={styles.buttonText}>Points Transaction History</Text>
    </Pressable>
  </Link>
  <Link href="/home" asChild>
    <Pressable style={styles.button}>
      <Text style={styles.buttonText}>Home</Text>
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