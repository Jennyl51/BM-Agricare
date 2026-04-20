import { View, Text } from 'react-native';
import Navbar from '@/components/Navbar';
import { StyleSheet } from 'react-native';
export default function RetailerDashboard() {
  return (
    <View style={styles.container}>
      <Text>Rewards Page</Text>
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