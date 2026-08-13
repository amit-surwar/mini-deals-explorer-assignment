/**
 * Base URL of the deals API. The host doesn't exist — every request to it is
 * intercepted in-process by the MSW mock server (mocks/server). Pointing the
 * app at a real backend means changing this constant and deleting the mocks.
 */
export const API_BASE_URL = "https://api.mini-deals.test";

/**
 * Base URL of the real authentication API (NestJS on Render — email OTP →
 * JWT). Unlike deals data, auth requests go over the network: the in-app MSW
 * server bypasses unhandled hosts. Jest registers test-only handlers for
 * these endpoints so the suite stays offline (mocks/server/authTestHandlers).
 */
export const AUTH_API_BASE_URL = "https://kingsley-health-api.onrender.com";
