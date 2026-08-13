import { setupServer } from "msw/node";

import { handlers } from "@/mocks/server/handlers";

/**
 * Node flavor of the mock API for Jest. Same handlers as the app; jest.setup.ts
 * manages its lifecycle, and tests can override handlers via `server.use(...)`.
 */
export const server = setupServer(...handlers);
