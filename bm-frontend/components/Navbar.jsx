import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Navbar() {
  return (
    <View style={styles.nav}>
      <Text style={styles.logo}>BM Rewards</Text>

      <View style={styles.links}>
        <Link href="/retailer-dashboard" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkText}>Home</Text>
          </Pressable>
        </Link>

        <Link href="/rewards-page" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkText}>Rewards</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#1f2937',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  links: {
    flexDirection: 'row',
    gap: 10,
  },
  linkButton: {
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  linkText: {
    color: 'white',
    fontWeight: '600',
  },
});