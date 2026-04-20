import React, { useState } from "react";
import { View, StyleSheet, Text, Pressable, TextInput} from "react-native";
import TechGuidelineGrid from "@/components/resources/TechGuidesGrid";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Navbar from "@/components/Navbar";

export default function InvoiceHistory() {
  const [invoiceName, setInvoiceName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  return (
    
    <View style={styles.container}>
      <View style= {styles.searchRow}>
        <MaterialCommunityIcons
        name='clipboard-text-search-outline'
        size={24}
        color='#687076'
        style={styles.inputIcon}
        />

        <TextInput 
        style={styles.largeInputBox}
        value={invoiceName}
        onChangeText={setInvoiceName}
        placeholder='Search by invoice name'
        placeholderTextColor='#687076'
        />
      </View>
      <View style={styles.dateRow}>
        <TextInput 
          style={styles.dateInputBox}
          value={fromDate}
          onChangeText={setFromDate}
          placeholder="From (YYYY-MM-DD)"
          placeholderTextColor="#687076"
          />
          <TextInput 
          style={styles.dateInputBox}
          value={toDate}
          onChangeText={setToDate}
          placeholder="To (YYYY-MM-DD)"
          placeholderTextColor="#687076"
          />
      
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    justifyContent: 'flex-start',
  },
  largeInputBox: {
    flex: 1,
    borderWidth: 0.6,
    borderColor: '#e2e5e8',
    borderRadius: 14,
    backgroundColor: '#f7f8f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '60%',
    marginTop: 12,
    gap: 12,  
  },
  dateInputBox: {
    flex: 1,
    borderWidth: 0.6,
    borderColor: '#e2e5e8',
    borderRadius: 14,
    backgroundColor: '#f7f8f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  input: {
    fontSize: 16,
    lineHeight: 24,
    color: '#11181C',
    marginBottom: 4,
  },
  inputIcon: {
    marginRight: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '60%',
  },
});