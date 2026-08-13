import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "@/lib/theme";

const IS_TEST =
  typeof process !== "undefined" && process.env.JEST_WORKER_ID !== undefined;

/** Pulsing placeholder mirroring a deal card's layout while data loads. */
export function SkeletonCard() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (IS_TEST) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View style={[styles.card, { opacity: pulse }]}>
      <View style={styles.topRow}>
        <View style={styles.avatar} />
        <View style={styles.titleBlock}>
          <View style={[styles.line, styles.lineWide]} />
          <View style={[styles.line, styles.lineNarrow]} />
        </View>
        <View style={styles.badge} />
      </View>
      <View style={styles.bar} />
      <View style={[styles.line, styles.lineMeta]} />
    </Animated.View>
  );
}

/** A stack of skeleton cards for the deals list's loading state. */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralSoft,
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs + 2,
  },
  badge: {
    width: 56,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralSoft,
  },
  line: {
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralSoft,
  },
  lineWide: {
    width: "70%",
  },
  lineNarrow: {
    width: "45%",
  },
  lineMeta: {
    width: "85%",
  },
  bar: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralSoft,
  },
});
