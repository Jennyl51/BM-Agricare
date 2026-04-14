import { View, Pressable, StyleSheet ,Text } from 'react-native';
import { Link } from 'expo-router';

export default function RetailerDashboard() {
  return (
    <View>
      <Text>Retailer Dashboard</Text>
      
    <Link href="/rewards-page" asChild>
    <Pressable style={styles.button}>
      <Text style={styles.buttonText}>Go to Rewards</Text>
    </Pressable>
  </Link>
</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
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
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});