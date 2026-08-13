import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/lib/theme";
import type { DealStatus, InvestmentStatus } from "@/types/deal";

type BadgeConfig = {
  label: string;
  background: string;
  foreground: string;
};

const DEAL_STATUS_CONFIG: Record<DealStatus, BadgeConfig> = {
  draft: { label: "Draft", background: colors.neutralSoft, foreground: colors.textMuted },
  active: { label: "Active", background: colors.primarySoft, foreground: colors.primaryDark },
  closed: { label: "Closed", background: colors.infoSoft, foreground: colors.info },
};

const INVESTMENT_STATUS_CONFIG: Record<InvestmentStatus, BadgeConfig> = {
  pending: { label: "Pending", background: colors.warningSoft, foreground: colors.warning },
  signed: { label: "Signed", background: colors.infoSoft, foreground: colors.info },
  wired: { label: "Wired", background: colors.primarySoft, foreground: colors.primaryDark },
};

function Badge({ config }: { config: BadgeConfig }) {
  return (
    <View style={[styles.badge, { backgroundColor: config.background }]}>
      <Text style={[styles.label, { color: config.foreground }]}>{config.label}</Text>
    </View>
  );
}

export function DealStatusBadge({ status }: { status: DealStatus }) {
  return <Badge config={DEAL_STATUS_CONFIG[status]} />;
}

export function InvestmentStatusBadge({ status }: { status: InvestmentStatus }) {
  return <Badge config={INVESTMENT_STATUS_CONFIG[status]} />;
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
