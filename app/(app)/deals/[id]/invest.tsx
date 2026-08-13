import { useLocalSearchParams } from "expo-router";

import { InvestScreen } from "@/features/invest/InvestScreen";
import { firstParam } from "@/lib/routeParams";

export default function InvestRoute() {
  const params = useLocalSearchParams();
  return <InvestScreen dealId={firstParam(params.id)} />;
}
