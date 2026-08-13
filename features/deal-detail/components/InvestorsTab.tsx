import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/feedback";
import { InvestmentStatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/format";
import { colors, radius, spacing } from "@/lib/theme";
import type { Investment } from "@/types/deal";

export function InvestorsTab({ investments }: { investments: Investment[] }) {
  if (investments.length === 0) {
    return (
      <EmptyState
        icon="people-outline"
        title="No investors yet"
        message="Subscriptions will appear here once investors commit to this deal."
      />
    );
  }

  return (
    <View style={styles.card}>
      {investments.map((investment, index) => (
        <View
          key={investment.id}
          style={[styles.row, index > 0 && styles.rowBorder]}
        >
          <Avatar name={investment.identity.legal_name} size={40} />
          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={1}>
              {investment.identity.legal_name}
            </Text>
            <Text style={styles.meta}>
              {investment.identity.type === "individual" ? "Individual" : "Entity"} ·{" "}
              {investment.identity.country}
            </Text>
          </View>
          <View style={styles.amountBlock}>
            <Text style={styles.amount}>
              {formatCurrency(investment.subscription_amount)}
            </Text>
            <InvestmentStatusBadge status={investment.status} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  amountBlock: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  amount: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
});
