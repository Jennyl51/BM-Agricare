import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  View,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TechGuidelineCardProps = {
  label: string;
  title: string;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
  url: string;
  imageUrl?: string;
};

export default function TechGuidelineCard({
  label,
  title,
  category,
  icon,
  url,
  imageUrl,
}: TechGuidelineCardProps) {
  const handlePress = async () => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Cannot open link", url);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.headerRow}>
        <Ionicons name={icon} size={20} color="#FFFFFF" />
        <Text style={styles.label}>{label}</Text>
      </View>

      <Image
        source={{
          uri:
            imageUrl ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
        }}
        style={styles.image}
        resizeMode="cover"
      />

      <Text numberOfLines={2} style={styles.title}>
        {title}
      </Text>

      <View style={styles.tag}>
        <Text style={styles.tagText}>{category}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: "#68bc45",
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#D8E7DF",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 20,
  },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#DDEEE6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: "#0F3D2E",
    fontSize: 11,
    fontWeight: "600",
  },
});