import { useQuery } from "@tanstack/react-query";

import { fetchDeals } from "@/lib/api/dealsApi";
import { dealKeys } from "@/lib/api/queryKeys";

export function useDeals() {
  return useQuery({
    queryKey: dealKeys.list(),
    queryFn: fetchDeals,
  });
}
