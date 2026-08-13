import { setupServer } from "msw/native";

import { handlers } from "@/mocks/server/handlers";

let started = false;

/**
 * Starts the in-app MSW server that intercepts fetch/XHR before they reach
 * the network. Idempotent so Fast Refresh can't start it twice.
 */
export function startMockApi(): void {
  if (started) {
    return;
  }
  started = true;
  const server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: "bypass" });
}
