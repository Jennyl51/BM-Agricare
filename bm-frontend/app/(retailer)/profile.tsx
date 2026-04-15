import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';

export default function RetailerProfile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.profilePic} />
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Edit User Info</Text>
      </Pressable>
      <TextInput style={styles.field} placeholder="Name/User" />
      <TextInput style={styles.field} placeholder="Location/Address" />
      <TextInput style={styles.field} placeholder="Email" />
      <TextInput style={styles.field} placeholder="Phone #" />
      <View style={styles.row}>
         <TextInput style={styles.halfField} placeholder="# of pts" />
         <TextInput style={styles.halfField} placeholder="Tier" />
      </View>
      <View style={styles.historyBox}>
        <Text>Points & Invoice History</Text>
      </View>
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
    borderRadius: 15,
  },
  button: {
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#ccc',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
  field: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 15,
    },
  row: {
  flexDirection: 'row',
  gap: 10,
},
halfField: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#ccc',
  padding: 12,
  borderRadius: 15,
},
historyBox: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 15,
  padding: 12,
  height: 150,
}
});