import "@/lib/polyfills";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import { AuthProvider } from "@/features/auth/auth-context";
import { colors } from "@/lib/theme";

// Jest runs the same handlers through msw/node (see jest.setup.ts), so the
// in-app msw/native server must not start there.
const IS_TEST_ENV =
  typeof process !== "undefined" && process.env.JEST_WORKER_ID !== undefined;

export default function RootLayout() {
  // Created via state so Fast Refresh never re-instantiates the cache mid-session.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
          },
        },
      }),
  );

  // Hold rendering until the mock API is intercepting, so the first query
  // can't race past it onto the real network.
  const [apiReady, setApiReady] = useState(IS_TEST_ENV);

  useEffect(() => {
    if (IS_TEST_ENV) {
      return;
    }
    let active = true;
    void import("@/mocks/server/native").then(({ startMockApi }) => {
      startMockApi();
      if (active) {
        setApiReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!apiReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="(app)" />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
