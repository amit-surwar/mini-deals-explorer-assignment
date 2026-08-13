/**
 * Base URL of the deals API. The host doesn't exist — every request to it is
 * intercepted in-process by the MSW mock server (mocks/server). Pointing the
 * app at a real backend means changing this constant and deleting the mocks.
 */
export const API_BASE_URL = "https://api.mini-deals.test";
