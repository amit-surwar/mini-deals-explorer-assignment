import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { EmptyState, ErrorState, LoadingState } from "@/components/feedback";
import { DealCard } from "@/features/deals-list/components/DealCard";
import { SearchBar } from "@/features/deals-list/components/SearchBar";
import {
  StatusFilterChips,
  type StatusFilterValue,
} from "@/features/deals-list/components/StatusFilterChips";
import { SummaryHeader } from "@/features/deals-list/components/SummaryHeader";
import { useDeals } from "@/features/deals-list/useDeals";
import { colors, radius, spacing } from "@/lib/theme";
import type { Deal } from "@/types/deal";

export function DealsListScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } = useDeals();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");

  const deals = useMemo<Deal[]>(() => data?.deals ?? [], [data]);
  const isFromCache = data?.source === "cache";

  const filteredDeals = useMemo(() => {
    const query = search.trim().toLowerCase();
    return deals.filter((deal) => {
      const matchesStatus = statusFilter === "all" || deal.status === statusFilter;
      const matchesQuery =
        query.length === 0 || deal.name.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [deals, search, statusFilter]);

  const totalRaised = useMemo(
    () =>
      deals.reduce((sum, deal) => sum + deal.stats.total_raised_subscribed, 0),
    [deals],
  );

  const hasActiveFilters = search.trim().length > 0 || statusFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingState label="Loading deals…" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <ErrorState
          message={error?.message ?? "We couldn't load the deals."}
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Controls live outside the FlatList header so the search input never
          remounts (and drops the keyboard) while results re-render. */}
      <View style={styles.controls}>
        {isFromCache ? (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
            <Text style={styles.offlineText}>
              Offline — showing your last synced deals.
            </Text>
          </View>
        ) : null}
        <SummaryHeader dealCount={deals.length} totalRaised={totalRaised} />
        <SearchBar value={search} onChange={setSearch} />
        <StatusFilterChips value={statusFilter} onChange={setStatusFilter} />
      </View>

      <FlatList
        testID="deals-list"
        data={filteredDeals}
        keyExtractor={(deal) => deal.id}
        renderItem={({ item }) => (
          <DealCard deal={item} onPress={() => router.push(`/deals/${item.id}`)} />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ListSeparator}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No deals match"
            message={
              hasActiveFilters
                ? "Try a different search or status filter."
                : "There are no deals to show right now."
            }
            actionLabel={hasActiveFilters ? "Clear filters" : undefined}
            onAction={hasActiveFilters ? clearFilters : undefined}
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
  controls: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  offlineText: {
    flex: 1,
    fontSize: 13,
    color: colors.warning,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  separator: {
    height: spacing.md,
  },
});
