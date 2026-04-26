import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native'; // Consultation Request Page
import Navbar from '@/components/Navbar';

export default function ConsultationRequest() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Consultation Request</Text>
        <View style={styles.photoUpload}>
          <Text>Photo Upload</Text>
        </View>
        <Pressable style={styles.uploadButton}>
          <Text style={styles.uploadText}>Upload Photo</Text>
        </Pressable>
        <TextInput style={styles.field} placeholder="Request Title" />
        <TextInput style={styles.field} placeholder="Request Info/Notes" multiline numberOfLines={4} />
        <TextInput style={styles.field} placeholder="Region" />
        <TextInput style={styles.field} placeholder="Contact Info" />
        <TextInput style={styles.field} placeholder="Name/User" />
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Submit Request</Text>
        </Pressable>
      </ScrollView>
      <Navbar />
    </View>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    color: 'white',
  },
  photoUpload: {
    width: '100%',
    height: 200,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginBottom: 15,
  },
  field: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 15,
    marginBottom: 12,
    color: '#000',
  },
  button: {
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#68BC45',
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
    marginBottom: 16,
  },
  uploadText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
},  
});
