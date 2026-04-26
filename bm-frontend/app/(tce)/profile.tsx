import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import Navbar from '@/components/Navbar';

export default function Profile() {
  return (
    <View style={{flex: 1}}>
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.profilePic} />
        <Pressable style={styles.uploadButton}>
          <Text style={styles.uploadText}>Upload Photo</Text>   
        </Pressable> 
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
    paddingTop: 15,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    color: 'white,'
  },
  profilePic: {
    width: 140,
    height: 140,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    borderRadius: 70,
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
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#68BC45',
    alignSelf: 'center',
    paddingHorizontal: 30, 
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  uploadButton: {
  backgroundColor: '#68BC45',
  padding: 10,
  borderRadius: 15,
  alignSelf: 'center',
  },
  uploadText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 16
},
});