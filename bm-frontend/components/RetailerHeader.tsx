import { View, Pressable, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function RetailerHeader() {
  return (
    <View style={styles.row}>
      <Pressable style={styles.hit}>
        <Feather name="menu" size={22} color="#002F71" />
      </Pressable>
      <Text style={styles.title}>BM AgriCare</Text>
      <Pressable style={styles.hit}>
        <View style={styles.avatar}>
          <Feather name="user" size={18} color="#002F71" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  hit: {
    padding: 8,
    marginHorizontal: -8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Montserrat',
    fontSize: 18,
    fontWeight: '700',
    color: '#002F71',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#002F71',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
