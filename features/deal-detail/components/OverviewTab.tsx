import { StyleSheet, Text, View } from "react-native";

import { ProgressBar } from "@/components/ProgressBar";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { colors, radius, spacing } from "@/lib/theme";
import type { Deal } from "@/types/deal";

export function OverviewTab({ deal }: { deal: Deal }) {
  const { total_raised_subscribed, total_raised_wired, investor_count } = deal.stats;
  const wiredRatio =
    total_raised_subscribed > 0 ? total_raised_wired / total_raised_subscribed : 0;
  const wiredPercent = Math.round(wiredRatio * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Terms</Text>
      <View style={styles.card}>
        <Row label="Entity" value={deal.entity_name} />
        <Row label="Type" value={deal.type === "spv" ? "SPV" : "Fund"} />
        <Row label="Management fee" value={formatPercent(deal.management_fee_percent)} />
        <Row label="Carry" value={formatPercent(deal.total_carry)} />
        <Row label="Minimum investment" value={formatCurrency(deal.minimum_investment)} />
        <Row label="Closing date" value={formatDate(deal.closing_date)} last />
      </View>

      <Text style={styles.sectionTitle}>Raise</Text>
      <View style={styles.card}>
        <View style={styles.raiseHeadline}>
          <Text style={styles.raiseValue}>{formatCurrency(total_raised_subscribed)}</Text>
          <Text style={styles.raiseCaption}>total subscribed</Text>
        </View>
        <View style={styles.progressBlock}>
          <ProgressBar value={wiredRatio} />
          <Text style={styles.progressLabel}>
            {wiredPercent}% of subscriptions wired
          </Text>
        </View>
        <Row label="Total wired" value={formatCurrency(total_raised_wired)} />
        <Row label="Investors" value={String(investor_count)} last />
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  rowValue: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  raiseHeadline: {
    paddingTop: spacing.lg,
    gap: 2,
  },
  raiseValue: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
  },
  raiseCaption: {
    fontSize: 13,
    color: colors.textMuted,
  },
  progressBlock: {
    gap: spacing.xs + 2,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
