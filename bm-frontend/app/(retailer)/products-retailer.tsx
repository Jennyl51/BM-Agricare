import { View, Text, StyleSheet } from 'react-native';
import Navbar from '@/components/Navbar';
export default function RetailerDashboard() {
  return (
    <View style={styles.container}>
      <Text>Products</Text>
      <Navbar />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});