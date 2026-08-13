import { StyleSheet, Text, View } from "react-native";

import { formatCompactCurrency } from "@/lib/format";
import { colors, radius, spacing } from "@/lib/theme";

type SummaryHeaderProps = {
  dealCount: number;
  totalRaised: number;
};

/** Portfolio-level totals across ALL deals, independent of search/filter state. */
export function SummaryHeader({ dealCount, totalRaised }: SummaryHeaderProps) {
  return (
    <View style={styles.card}>
      <View style={styles.stat}>
        <Text style={styles.value}>{dealCount}</Text>
        <Text style={styles.label}>{dealCount === 1 ? "Deal" : "Deals"}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text style={styles.value}>{formatCompactCurrency(totalRaised)}</Text>
        <Text style={styles.label}>Total raised</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
