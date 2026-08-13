import type { Identity } from "@/types/deal";
import type { MockUser } from "@/types/user";

/**
 * The investing identities the signed-in user can subscribe under.
 * Derived from the mock user so the flow feels personal without real KYC data.
 */
export function identitiesForUser(user: MockUser): Identity[] {
  const fullName = `${user.first_name} ${user.last_name}`;
  return [
    {
      id: "identity_individual",
      legal_name: fullName,
      type: "individual",
      country: "US",
    },
    {
      id: "identity_trust",
      legal_name: `The ${user.last_name} Family Trust`,
      type: "entity",
      country: "US",
    },
    {
      id: "identity_llc",
      legal_name: `${user.last_name} Capital Holdings LLC`,
      type: "entity",
      country: "US",
    },
  ];
}
