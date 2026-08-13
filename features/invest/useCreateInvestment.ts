import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createInvestment } from "@/lib/api/dealsApi";
import { dealKeys, myInvestmentKeys } from "@/lib/api/queryKeys";

export function useCreateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvestment,
    onSuccess: () => {
      // Refresh the list (summary totals), the detail (investor list, raise
      // stats), and the session's My Investments tab.
      void queryClient.invalidateQueries({ queryKey: dealKeys.all });
      void queryClient.invalidateQueries({ queryKey: myInvestmentKeys.all });
    },
  });
}
