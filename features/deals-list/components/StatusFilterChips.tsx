import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/lib/theme";
import type { DealStatus } from "@/types/deal";

export type StatusFilterValue = "all" | DealStatus;

const OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

type StatusFilterChipsProps = {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
};

export function StatusFilterChips({ value, onChange }: StatusFilterChipsProps) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && !selected && styles.chipPressed,
            ]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipPressed: {
    backgroundColor: colors.neutralSoft,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  labelSelected: {
    color: colors.card,
  },
});
