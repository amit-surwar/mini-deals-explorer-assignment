/** Centralized React Query keys so invalidation stays consistent across features. */
export const dealKeys = {
  all: ["deals"] as const,
  list: () => [...dealKeys.all, "list"] as const,
  detail: (dealId: string) => [...dealKeys.all, "detail", dealId] as const,
};

export const myInvestmentKeys = {
  all: ["my-investments"] as const,
  list: () => [...myInvestmentKeys.all, "list"] as const,
};
