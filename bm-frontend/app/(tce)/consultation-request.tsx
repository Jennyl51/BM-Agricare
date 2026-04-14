import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';

export default function ConsultationRequest() {
  return (
    <View style ={styles.container}>
      <Text style={styles.title}>Consultation Request</Text> 
      <View style={styles.photoUpload}>
        <Text>Photo Upload</Text>
      </View>   
      <TextInput style={styles.field} placeholder="Request Title" />
      <TextInput style={styles.field} placeholder="Request Info/Notes" multiline numberOfLines={4} />
      <TextInput style={styles.field} placeholder="Region" />
      <TextInput style={styles.field} placeholder="Contact Info" />
      <TextInput style={styles.field} placeholder="Name/User" />
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Submit Request</Text>
      </Pressable>
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
  photoUpload: {
  width: '100%',
  height: 150,
  backgroundColor: '#ccc',
  justifyContent: 'center',
  alignItems: 'center',
  },
  field: {
  borderWidth: 1,
  borderColor: '#ccc',
  padding: 12,
  borderRadius: 6,
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
