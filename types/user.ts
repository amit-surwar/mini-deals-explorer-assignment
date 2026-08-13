/** The mock signed-in user. No real auth — any email produces one of these. */
export type MockUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};
