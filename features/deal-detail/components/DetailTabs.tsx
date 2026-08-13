import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/lib/theme";

export type DetailTabKey = "overview" | "investors" | "documents";

type DetailTabsProps = {
  active: DetailTabKey;
  onChange: (tab: DetailTabKey) => void;
  investorCount: number;
};

export function DetailTabs({ active, onChange, investorCount }: DetailTabsProps) {
  const tabs: { key: DetailTabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "investors", label: `Investors (${investorCount})` },
    { key: "documents", label: "Documents" },
  ];

  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const selected = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.tab, selected && styles.tabSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {tab.label}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -1,
  },
  tabSelected: {
    borderBottomColor: colors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  labelSelected: {
    color: colors.primaryDark,
  },
});
