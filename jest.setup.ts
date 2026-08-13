import { server } from "@/mocks/server/testServer";

// Same MSW handlers as the app, running on msw/node for Jest. Tests can
// simulate outages etc. with `server.use(...)`; overrides reset between tests.
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
