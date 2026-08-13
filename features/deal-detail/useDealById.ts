import { useQuery } from "@tanstack/react-query";

import { fetchDealById } from "@/lib/api/dealsApi";
import { dealKeys } from "@/lib/api/queryKeys";

export function useDealById(dealId: string) {
  return useQuery({
    queryKey: dealKeys.detail(dealId),
    queryFn: () => fetchDealById(dealId),
    enabled: dealId.length > 0,
  });
}
