import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Avatar } from "@/components/Avatar";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback";
import { InvestmentStatusBadge } from "@/components/StatusBadge";
import { useMyInvestments } from "@/features/my-investments/useMyInvestments";
import { formatCurrency } from "@/lib/format";
import { colors, radius, spacing } from "@/lib/theme";
import type { MyInvestment } from "@/types/deal";

/** All mock investments made during this session, across deals. */
export function MyInvestmentsScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useMyInvestments();

  const investments = useMemo<MyInvestment[]>(() => data ?? [], [data]);
  const totalCommitted = useMemo(
    () =>
      investments.reduce(
        (sum, investment) => sum + investment.subscription_amount,
        0,
      ),
    [investments],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingState label="Loading your investments…" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <ErrorState
          message={error?.message ?? "We couldn't load your investments."}
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={investments}
        keyExtractor={(investment) => investment.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ListSeparator}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          investments.length > 0 ? (
            <View style={styles.summary}>
              <Text style={styles.summaryValue}>{formatCurrency(totalCommitted)}</Text>
              <Text style={styles.summaryLabel}>
                committed this session across {investments.length}{" "}
                {investments.length === 1 ? "investment" : "investments"}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/deals/${item.deal_id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.deal_name}`}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <Avatar name={item.deal_name} size={40} />
            <View style={styles.nameBlock}>
              <Text style={styles.dealName} numberOfLines={1}>
                {item.deal_name}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                as {item.identity.legal_name}
              </Text>
            </View>
            <View style={styles.amountBlock}>
              <Text style={styles.amount}>
                {formatCurrency(item.subscription_amount)}
              </Text>
              <InvestmentStatusBadge status={item.status} />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="wallet-outline"
            title="No investments yet"
            message="Invest in a deal and it will show up here for the rest of your session."
            actionLabel="Browse deals"
            onAction={() => router.navigate("/")}
          />
        }
      />
    </View>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  summary: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: 2,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.9,
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  dealName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  amountBlock: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  amount: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  separator: {
    height: spacing.md,
  },
});
