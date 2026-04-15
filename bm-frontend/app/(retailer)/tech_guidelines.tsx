import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, } from "react-native";
import TechGuidelineGrid from "@/components/resources/TechGuidesGrid";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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
            <Feather name="home" size={22} color="FFFFFF"  />
        </TouchableOpacity>
      </View>
    {/* Break pages into reusable components */}
      <TechGuidelineGrid />
    </View>
  );
}

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
    color: "#0F3D2E",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "#4B6358",
    fontSize: 14,
  },
});