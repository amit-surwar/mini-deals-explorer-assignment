import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { InvestmentStatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { colors, radius, spacing } from "@/lib/theme";

const IS_TEST =
  typeof process !== "undefined" && process.env.JEST_WORKER_ID !== undefined;

type InvestSuccessScreenProps = {
  dealName: string;
  amount: number | null;
};

export function InvestSuccessScreen({ dealName, amount }: InvestSuccessScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // The payoff moment: checkmark springs in with a success haptic.
  const pop = useRef(new Animated.Value(IS_TEST ? 1 : 0)).current;
  useEffect(() => {
    if (IS_TEST) return;
    haptic.success();
    Animated.spring(pop, {
      toValue: 1,
      speed: 14,
      bounciness: 12,
      useNativeDriver: true,
    }).start();
  }, [pop]);

  const handleBackToDeal = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Success" }} />

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: pop, transform: [{ scale: pop }] }}>
          <Ionicons name="checkmark-circle" size={96} color={colors.primary} />
        </Animated.View>
        <Text style={styles.title}>Investment submitted</Text>
        <Text style={styles.subtitle}>
          {amount !== null
            ? `Your ${formatCurrency(amount)} subscription to ${dealName} is in.`
            : `Your subscription to ${dealName} is in.`}{" "}
          The deal team will review and countersign next.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Deal</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
              {dealName}
            </Text>
          </View>
          {amount !== null ? (
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.rowLabel}>Amount</Text>
              <Text style={styles.rowValue}>{formatCurrency(amount)}</Text>
            </View>
          ) : null}
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.rowLabel}>Status</Text>
            <InvestmentStatusBadge status="pending" />
          </View>
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
      >
        <Button title="Back to deal" onPress={handleBackToDeal} />
        <Button
          title="Browse all deals"
          variant="secondary"
          onPress={() => router.navigate("/")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  card: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  footer: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
});
