import { View, Pressable, Text } from 'react-native';
import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function TCEDashboard() {
  return (
    <View style={styles.container}>
      <Text>TCE Dashboard</Text>

      <Link href="/profile" asChild>
      <Pressable style={styles.button}>
      <Text style={styles.buttonText}>TCE profile</Text>
      </Pressable>
    </Link>
    <Link href="/consultation-requests" asChild>
      <Pressable style={styles.button}>
      <Text style={styles.buttonText}>Consultation Requests List</Text>
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
    marginBottom: 30,
    color: '#111827',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: 220,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});