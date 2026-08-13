/**
 * The signed-in user. Authenticated for real via the email-OTP API
 * (lib/api/authApi); the API's single `name` is split into first/last
 * because the investor-identity mocks build display names from the parts.
 */
export type MockUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};
