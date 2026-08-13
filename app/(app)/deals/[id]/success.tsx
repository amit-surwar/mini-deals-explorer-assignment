import { useLocalSearchParams } from "expo-router";

import { InvestSuccessScreen } from "@/features/invest/InvestSuccessScreen";
import { firstParam } from "@/lib/routeParams";

export default function InvestSuccessRoute() {
  const params = useLocalSearchParams();
  const dealName = firstParam(params.dealName) || "this deal";
  const amountRaw = firstParam(params.amount);
  const parsedAmount = Number.parseInt(amountRaw, 10);
  const amount = Number.isFinite(parsedAmount) ? parsedAmount : null;

  return <InvestSuccessScreen dealName={dealName} amount={amount} />;
}
