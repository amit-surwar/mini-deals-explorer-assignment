import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { ProgressBar } from "@/components/ProgressBar";
import { DealStatusBadge } from "@/components/StatusBadge";
import { formatCompactCurrency, formatDate } from "@/lib/format";
import { colors, radius, spacing } from "@/lib/theme";
import type { Deal } from "@/types/deal";

type DealCardProps = {
  deal: Deal;
  onPress: () => void;
};

export function DealCard({ deal, onPress }: DealCardProps) {
  const { total_raised_subscribed, total_raised_wired, investor_count } = deal.stats;
  const wiredRatio =
    total_raised_subscribed > 0 ? total_raised_wired / total_raised_subscribed : 0;
  const closingLabel =
    deal.status === "closed"
      ? `Closed ${formatDate(deal.closing_date)}`
      : `Closes ${formatDate(deal.closing_date)}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${deal.name}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <Avatar name={deal.name} uri={deal.logo_url} />
        <View style={styles.titleBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {deal.name}
          </Text>
          <Text style={styles.entity} numberOfLines={1}>
            {deal.entity_name}
          </Text>
        </View>
        <DealStatusBadge status={deal.status} />
      </View>

      <View style={styles.progressBlock}>
        <ProgressBar value={wiredRatio} />
        <Text style={styles.progressLabel}>
          {formatCompactCurrency(total_raised_wired)} wired of{" "}
          {formatCompactCurrency(total_raised_subscribed)} subscribed
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          Min {formatCompactCurrency(deal.minimum_investment)}
        </Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.meta}>
          {investor_count} {investor_count === 1 ? "investor" : "investors"}
        </Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={[styles.meta, styles.metaGrow]} numberOfLines={1}>
          {closingLabel}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.9,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  entity: {
    fontSize: 13,
    color: colors.textMuted,
  },
  progressBlock: {
    gap: spacing.xs + 2,
  },
  progressLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  metaDot: {
    fontSize: 13,
    color: colors.border,
  },
  metaGrow: {
    flex: 1,
  },
});
