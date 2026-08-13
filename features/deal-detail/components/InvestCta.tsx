import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { colors, spacing } from "@/lib/theme";
import type { Deal } from "@/types/deal";

type InvestCtaProps = {
  deal: Deal;
  onInvest: () => void;
};

/** Bottom action bar: invest button for active deals, an explanation otherwise. */
export function InvestCta({ deal, onInvest }: InvestCtaProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
      {deal.status === "active" ? (
        <Button title="Invest in this deal" onPress={onInvest} />
      ) : (
        <View style={styles.notice}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.textMuted}
          />
          <Text style={styles.noticeText}>
            {deal.status === "draft"
              ? "This deal isn't open for investment yet."
              : "This deal has closed to new investors."}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noticeText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
