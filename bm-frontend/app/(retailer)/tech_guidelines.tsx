import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, } from "react-native";
import TechGuidelineGrid from "@/components/resources/TechGuidesGrid";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Navbar from "@/components/Navbar";

export default function TechGuidelinesScreen() {
const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Imagine View as Grouping Feature in Figma 
        So when you are using flex box and auto layout,
        it is applied to groups
        */}
        {/* Group 1: Title & Subtitle */}
        <View> 
            <Text style={styles.title}>Tech Guidelines</Text>
            <Text style={styles.subtitle}>
            Example resource page for frontend members
            </Text>
        </View>

        
        {/* Group 2: Home Button */}
        <TouchableOpacity onPress={() => router.push("/home-retailers")}>
            <Feather name="home" size={22} color="#002F71"  />
        </TouchableOpacity>
      </View>
    {/* Break pages into reusable components */}
      <TechGuidelineGrid />
    <Navbar />
    </View>
    
  );
}

// COMMON BM STYLES:
// Colors: #002F71 (dark blue), #68BC45 (light green), #7F7F7F (light grey), #0A0908 (dark gray), #FFFFFF (white)
// Fonts: Montserrat (Heading, Title, Subtitle), Outfit (Body text, descriptions), DM sans (Light, small text)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D9EAC9",
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 8,
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    color: "#002F71",
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "Montserrat",
    marginBottom: 4,
  },
  subtitle: {
    color: "#4B6358",
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
  },
});