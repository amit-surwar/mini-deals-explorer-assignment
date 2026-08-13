import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { useAuth } from "@/features/auth/auth-context";
import { colors } from "@/lib/theme";

export default function TabsLayout() {
  const { signOut } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "600" },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerRight: () => (
          <Pressable
            onPress={signOut}
            hitSlop={8}
            accessibilityLabel="Sign out"
            style={styles.signOut}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.text} />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Deals",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-investments"
        options={{
          title: "My Investments",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  signOut: {
    marginRight: 16,
  },
});
