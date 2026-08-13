import { useQuery } from "@tanstack/react-query";

import { fetchMyInvestments } from "@/lib/api/dealsApi";
import { myInvestmentKeys } from "@/lib/api/queryKeys";

export function useMyInvestments() {
  return useQuery({
    queryKey: myInvestmentKeys.list(),
    queryFn: fetchMyInvestments,
  });
}
