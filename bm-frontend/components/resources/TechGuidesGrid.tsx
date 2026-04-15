import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TechGuidelineCard from "./TechGuidesCard";

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Documentation: "document-text-outline",
  Tutorial: "school-outline",
  Video: "play-circle-outline",
  Design: "color-palette-outline",
  default: "book-outline",
};

const techGuidelines = [
  {
    label: "React Native Docs",
    title: "Core Components and APIs",
    category: "Documentation",
    url: "https://reactnative.dev/docs/components-and-apis",
    imageUrl:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Expo Router",
    title: "File-based Routing Guide",
    category: "Documentation",
    url: "https://docs.expo.dev/router/introduction/",
    imageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Design System",
    title: "BM Agricare Colors & Fonts",
    category: "Design",
    url: "https://www.figma.com/design/uRZm2ei1yoH2CIRCKwd5tr/Behn-Meyer-AgriCare?node-id=0-1&t=PJLXlLt1soPpIwkC-1",
    imageUrl:
      "https://images.unsplash.com/photo-1710666184386-9f42d0227237?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    label: "Frontend Architecture",
    title: "Find Reusable Components & Pages",
    category: "Design",
    url: "https://www.notion.so/Front-End-Architecture-READ-ME-33768aa8ba0a802a8286d498ec03646a?source=copy_link",
    imageUrl:
      "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "TypeScript",
    title: "TypeScript for React Native Beginners",
    category: "Tutorial",
    url: "https://reactnative.dev/docs/typescript",
    imageUrl:
      "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&w=800&q=80",
  },
];

export default function TechGuidelineGrid() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {techGuidelines.map((item, i) => (
        <View key={i} style={styles.cardWrapper}>
          <TechGuidelineCard
            label={item.label}
            title={item.title}
            category={item.category}
            icon={categoryIcons[item.category] || categoryIcons.default}
            url={item.url}
            imageUrl={item.imageUrl}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardWrapper: {
    width: "100%",
  },
});