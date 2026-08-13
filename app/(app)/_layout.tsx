import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/features/auth/auth-context";
import { colors } from "@/lib/theme";

/** Everything inside this group requires a signed-in user. */
export default function AppLayout() {
  const { status, user } = useAuth();

  // Session restore from AsyncStorage is in flight on cold start — render
  // nothing for that moment instead of flashing the sign-in screen.
  if (status === "restoring") {
    return null;
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "600" },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="deals/[id]/index" options={{ title: "Deal" }} />
      <Stack.Screen name="deals/[id]/invest" options={{ title: "Invest" }} />
      <Stack.Screen name="deals/[id]/success" options={{ title: "Success" }} />
    </Stack>
  );
}
