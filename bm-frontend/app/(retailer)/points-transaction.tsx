import Navbar from '@/components/Navbar';
import { View, Text, StyleSheet } from 'react-native';

export default function RetailerDashboard() {
  return (
    <View style={styles.container}>

      <Text>Points Transaction History</Text>
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