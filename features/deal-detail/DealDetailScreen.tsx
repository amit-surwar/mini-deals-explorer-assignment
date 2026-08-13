import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ErrorState, LoadingState } from "@/components/feedback";
import { DealHeaderCard } from "@/features/deal-detail/components/DealHeaderCard";
import {
  DetailTabs,
  type DetailTabKey,
} from "@/features/deal-detail/components/DetailTabs";
import { DocumentsTab } from "@/features/deal-detail/components/DocumentsTab";
import { InvestCta } from "@/features/deal-detail/components/InvestCta";
import { InvestorsTab } from "@/features/deal-detail/components/InvestorsTab";
import { OverviewTab } from "@/features/deal-detail/components/OverviewTab";
import { useDealById } from "@/features/deal-detail/useDealById";
import { colors, spacing } from "@/lib/theme";

export function DealDetailScreen({ dealId }: { dealId: string }) {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useDealById(dealId);
  const [activeTab, setActiveTab] = useState<DetailTabKey>("overview");

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Deal" }} />
        <LoadingState label="Loading deal…" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Deal" }} />
        <ErrorState
          message={error?.message ?? "We couldn't load this deal."}
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  const { deal, investments } = data;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: deal.name }} />

      <ScrollView contentContainerStyle={styles.content}>
        <DealHeaderCard deal={deal} />
        <DetailTabs
          active={activeTab}
          onChange={setActiveTab}
          investorCount={investments.length}
        />
        {activeTab === "overview" ? <OverviewTab deal={deal} /> : null}
        {activeTab === "investors" ? <InvestorsTab investments={investments} /> : null}
        {activeTab === "documents" ? <DocumentsTab /> : null}
      </ScrollView>

      <InvestCta
        deal={deal}
        onInvest={() => router.push(`/deals/${deal.id}/invest`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
