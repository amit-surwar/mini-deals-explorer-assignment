import AsyncStorage from "@react-native-async-storage/async-storage";

import { server } from "@/mocks/server/testServer";

// Official in-memory mock — no native module in Jest. (requireActual so the
// factory's own import isn't re-intercepted by this very mock.)
jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual(
    "@react-native-async-storage/async-storage/jest/async-storage-mock",
  ),
);

// Same MSW handlers as the app, running on msw/node for Jest. Tests can
// simulate outages etc. with `server.use(...)`; overrides reset between tests.
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(async () => {
  server.resetHandlers();
  // The persisted auth session must not leak between tests.
  await AsyncStorage.clear();
});
afterAll(() => server.close());
