import { StyleSheet, View } from "react-native";

import { colors, radius } from "@/lib/theme";

/** Horizontal progress bar. `value` is 0..1 and is clamped, so 0/0 edge cases are safe. */
export function ProgressBar({ value }: { value: number }) {
  const clamped = Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.round(clamped * 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralSoft,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});
