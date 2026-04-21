import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import Navbar from '@/components/Navbar';

export default function Profile() {
  return (
    <View style={{flex: 1}}>
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.profilePic} />
      <TextInput style={styles.field} placeholder="Name/User"/>
      <TextInput style={styles.field} placeholder="Region"/>
      <TextInput style={styles.field} placeholder="Email"/>
      <TextInput style={styles.field} placeholder="Phone #"/>
      <View style={styles.retailers}>
        <Text style={styles.retailersTitle}>Assigned Retailers</Text>
        <Text style={styles.retailerRow}>Retailer name, region, profile</Text>
        <Text style={styles.retailerRow}>Retailer name, region, profile</Text>
        <Text style={styles.retailerRow}>Retailer name, region, profile</Text>
      </View>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>User Settings/Edit</Text>
        </Pressable>
      </View>
        <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  profilePic: {
    width: 100,
    height: 100,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    borderRadius: 8,
  },
  field: {
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 12, 
    borderRadius: 6,
  },
  retailers: {
    borderWidth: 1,
    borderColor: '#ccc', 
    padding: 12,
    borderRadius: 6, 
  },
  retailersTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  retailerRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#ccc', 
  },
  button: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#222',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});