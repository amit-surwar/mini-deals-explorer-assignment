import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/features/auth/auth-context";
import { colors } from "@/lib/theme";

/** Everything inside this group requires a signed-in user. */
export default function AppLayout() {
  const { user } = useAuth();

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
      <Stack.Screen name="index" options={{ title: "Deals" }} />
      <Stack.Screen name="deals/[id]/index" options={{ title: "Deal" }} />
      <Stack.Screen name="deals/[id]/invest" options={{ title: "Invest" }} />
      <Stack.Screen name="deals/[id]/success" options={{ title: "Success" }} />
    </Stack>
  );
}
