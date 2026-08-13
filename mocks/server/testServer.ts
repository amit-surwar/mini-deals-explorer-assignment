import { setupServer } from "msw/node";

import { authTestHandlers } from "@/mocks/server/authTestHandlers";
import { handlers } from "@/mocks/server/handlers";

/**
 * Node flavor of the mock API for Jest. Same deals handlers as the app, plus
 * test-only handlers for the real auth API (which the app reaches over the
 * network but tests must not). jest.setup.ts manages its lifecycle, and tests
 * can override handlers via `server.use(...)`.
 */
export const server = setupServer(...handlers, ...authTestHandlers);
