import { View, Pressable, StyleSheet, Text } from 'react-native';
import { Link } from 'expo-router';

export default function InvoiceHistory() {
  return (
    <View style={styles.container}>
      <Text>Invoice History</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});