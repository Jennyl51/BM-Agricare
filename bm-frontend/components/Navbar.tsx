import { View, Text, Pressable, StyleSheet } from "react-native";
import type { Href } from "expo-router";
import { useRouter, usePathname } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "home", route: "/home-retailers", icon: "home" },
    { name: "guides", route: "/tech_guidelines", icon: "align-left" },
    { name: "upload", route: "/points-transaction", icon: "plus" },
    { name: "rewards", route: "/rewards", icon: "gift" },
    { name: "user", route: "/users-retailers", icon: "user" },
  ];

  return (
    <View style={styles.wrapper}>
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
                size={24}
                color={isActive ? "#4CAF50" : "#FFFFFF"}
              />
              <Text style={[styles.text, isActive && styles.activeText]}>
                {tab.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: "transparent",
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#002F71",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 10,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  text: {
    fontSize: 12,
    color: "#FFFFFF",
    marginTop: 6,
    fontFamily: "Outfit-Regular",
  },
  activeText: {
    color: "#4CAF50",
    fontFamily: "Outfit-SemiBold",
  },
});
