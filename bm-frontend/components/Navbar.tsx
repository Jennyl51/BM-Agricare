import { View, Text, Pressable, StyleSheet } from "react-native";
import type { Href } from "expo-router";
import { useRouter, usePathname } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "Home", route: "/home-retailers", icon: "home" },
    { name: "Guides", route: "/tech_guidelines", icon: "book" },
    { name: "Upload", route: "/points-transaction", icon: "upload" },
    { name: "Rewards", route: "/rewards", icon: "gift" },
    { name: "Products", route: "/products-retailer", icon: "package" },
    { name: "Users", route: "/users-retailers", icon: "users" },
  ];

  return (
    <View style={styles.nav}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.route;

        return (
          <Pressable
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.route as Href)}
          >
            <Feather
              name={tab.icon as any}
              size={20}
              color={isActive ? "#B3F275" : "#FFFFFF"}
            />

            <Text
              style={[
                styles.text,
                isActive && styles.activeText,
              ]}
            >
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#002F71",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 12,
    color: "#FFFFFF",
    marginTop: 4,
    fontFamily: "Outfit-Regular",
  },
  activeText: {
    color: "#B3F275",
    fontFamily: "Outfit-SemiBold",
  },
});
