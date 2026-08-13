import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { DealStatusBadge } from "@/components/StatusBadge";
import { colors, radius, spacing } from "@/lib/theme";
import type { Deal } from "@/types/deal";

export function DealHeaderCard({ deal }: { deal: Deal }) {
  return (
    <View style={styles.card}>
      <Avatar name={deal.name} uri={deal.logo_url} size={56} />
      <View style={styles.titleBlock}>
        <Text style={styles.name}>{deal.name}</Text>
        <Text style={styles.entity}>{deal.entity_name}</Text>
        <View style={styles.badges}>
          <View style={styles.typeChip}>
            <Text style={styles.typeChipLabel}>
              {deal.type === "spv" ? "SPV" : "Fund"}
            </Text>
          </View>
          <DealStatusBadge status={deal.status} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  entity: {
    fontSize: 14,
    color: colors.textMuted,
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 2,
  },
  typeChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
  },
  typeChipLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
});
