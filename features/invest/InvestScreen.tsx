import { Stack, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback";
import { useAuth } from "@/features/auth/auth-context";
import { useDealById } from "@/features/deal-detail/useDealById";
import { AmountField } from "@/features/invest/components/AmountField";
import { IdentityPicker } from "@/features/invest/components/IdentityPicker";
import { TermsCheckbox } from "@/features/invest/components/TermsCheckbox";
import { useCreateInvestment } from "@/features/invest/useCreateInvestment";
import { formatCurrency, formatDate } from "@/lib/format";
import { colors, radius, spacing } from "@/lib/theme";
import { identitiesForUser } from "@/mocks/identities";

export function InvestScreen({ dealId }: { dealId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useDealById(dealId);
  const createInvestment = useCreateInvestment();
  const insets = useSafeAreaInsets();

  const [selectedIdentityId, setSelectedIdentityId] = useState<string | null>(null);
  const [amountDigits, setAmountDigits] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const identities = useMemo(
    () => (user ? identitiesForUser(user) : []),
    [user],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingState label="Preparing investment…" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.container}>
        <ErrorState
          message={error?.message ?? "We couldn't load this deal."}
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  const { deal } = data;

  if (deal.status !== "active") {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="lock-closed-outline"
          title="Not accepting investments"
          message={
            deal.status === "draft"
              ? "This deal isn't open for investment yet."
              : "This deal has closed to new investors."
          }
          actionLabel="Back to deal"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const amount =
    amountDigits.length > 0 ? Number.parseInt(amountDigits, 10) : null;
  const selectedIdentity =
    identities.find((identity) => identity.id === selectedIdentityId) ?? null;
  const isBelowMinimum = amount !== null && amount < deal.minimum_investment;
  const canSubmit =
    selectedIdentity !== null &&
    amount !== null &&
    !isBelowMinimum &&
    acceptedTerms &&
    !createInvestment.isPending;

  const handleSubmit = () => {
    if (!canSubmit || amount === null || selectedIdentity === null) {
      return;
    }
    createInvestment.mutate(
      {
        deal_id: deal.id,
        identity: selectedIdentity,
        subscription_amount: amount,
      },
      {
        onSuccess: (investment) => {
          // Replace the form with the success screen so "back" from success
          // returns to the deal, never to a stale, already-submitted form.
          router.replace({
            pathname: "/deals/[id]/success",
            params: {
              id: deal.id,
              amount: String(investment.subscription_amount),
              dealName: deal.name,
            },
          });
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Invest" }} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.dealSummary}>
          <Text style={styles.dealSummaryTitle}>{deal.name}</Text>
          <Text style={styles.dealSummaryMeta}>
            Minimum {formatCurrency(deal.minimum_investment)} · Closes{" "}
            {formatDate(deal.closing_date)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>1. Investing identity</Text>
        <IdentityPicker
          identities={identities}
          selectedId={selectedIdentityId}
          onSelect={setSelectedIdentityId}
        />

        <Text style={styles.sectionTitle}>2. Investment amount</Text>
        <AmountField
          amountDigits={amountDigits}
          onChangeDigits={setAmountDigits}
          minimumInvestment={deal.minimum_investment}
          showError={isBelowMinimum}
        />

        <Text style={styles.sectionTitle}>3. Terms</Text>
        <TermsCheckbox
          checked={acceptedTerms}
          onToggle={() => setAcceptedTerms((current) => !current)}
        />

        {createInvestment.isError ? (
          <Text style={styles.submitError}>
            {createInvestment.error.message}
          </Text>
        ) : null}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
      >
        <Button
          title={
            amount !== null && !isBelowMinimum
              ? `Invest ${formatCurrency(amount)}`
              : "Invest"
          }
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={createInvestment.isPending}
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  dealSummary: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 2,
    marginBottom: spacing.sm,
  },
  dealSummaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  dealSummaryMeta: {
    fontSize: 13,
    color: colors.primaryDark,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  submitError: {
    fontSize: 14,
    color: colors.danger,
    lineHeight: 20,
    marginTop: spacing.md,
    textAlign: "center",
  },
  footer: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
