import { useLocalSearchParams } from "expo-router";

import { DealDetailScreen } from "@/features/deal-detail/DealDetailScreen";
import { firstParam } from "@/lib/routeParams";

export default function DealDetailRoute() {
  const params = useLocalSearchParams();
  return <DealDetailScreen dealId={firstParam(params.id)} />;
}
