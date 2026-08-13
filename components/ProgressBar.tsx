import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

import { colors, radius } from "@/lib/theme";

const IS_TEST =
  typeof process !== "undefined" && process.env.JEST_WORKER_ID !== undefined;

/**
 * Horizontal progress bar. `value` is 0..1 and is clamped, so 0/0 edge cases
 * are safe. The fill animates to its value on mount and on change (skipped in
 * Jest so tests stay deterministic).
 */
export function ProgressBar({ value }: { value: number }) {
  const clamped = Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;
  const progress = useRef(new Animated.Value(IS_TEST ? clamped : 0)).current;

  useEffect(() => {
    if (IS_TEST) {
      progress.setValue(clamped);
      return;
    }
    Animated.timing(progress, {
      toValue: clamped,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      // Width can't run on the native driver; a one-shot 650ms JS animation
      // on a handful of bars is imperceptible.
      useNativeDriver: false,
    }).start();
  }, [clamped, progress]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { width }]} />
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
