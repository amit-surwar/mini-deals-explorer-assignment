import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createInvestment } from "@/lib/api/dealsApi";
import { dealKeys } from "@/lib/api/queryKeys";

export function useCreateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvestment,
    onSuccess: () => {
      // Refresh both the list (summary totals) and the detail (investor list,
      // raise stats) so the new subscription is visible everywhere.
      void queryClient.invalidateQueries({ queryKey: dealKeys.all });
    },
  });
}
