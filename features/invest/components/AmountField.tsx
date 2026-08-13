import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { colors, radius, spacing } from "@/lib/theme";

const QUICK_MULTIPLIERS = [1, 2, 5] as const;
const MAX_DIGITS = 9;

type AmountFieldProps = {
  amountDigits: string;
  onChangeDigits: (digits: string) => void;
  minimumInvestment: number;
  showError: boolean;
};

function sanitizeDigits(text: string): string {
  return text
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "")
    .slice(0, MAX_DIGITS);
}

function groupDigits(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Currency input: stores raw digits, displays "25,000" as the user types. */
export function AmountField({
  amountDigits,
  onChangeDigits,
  minimumInvestment,
  showError,
}: AmountFieldProps) {
  const displayValue = amountDigits.length > 0 ? groupDigits(amountDigits) : "";

  return (
    <View style={styles.container}>
      <View style={[styles.inputRow, showError && styles.inputRowError]}>
        <Text style={styles.currencySymbol}>$</Text>
        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={(text) => onChangeDigits(sanitizeDigits(text))}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          accessibilityLabel="Investment amount in dollars"
        />
      </View>

      <View style={styles.quickRow}>
        {QUICK_MULTIPLIERS.map((multiplier) => {
          const amount = minimumInvestment * multiplier;
          return (
            <Pressable
              key={multiplier}
              onPress={() => onChangeDigits(String(amount))}
              style={({ pressed }) => [styles.quickChip, pressed && styles.quickChipPressed]}
              accessibilityLabel={`Set amount to ${formatCurrency(amount)}`}
            >
              <Text style={styles.quickChipLabel}>{formatCompactCurrency(amount)}</Text>
            </Pressable>
          );
        })}
      </View>

      {showError ? (
        <Text style={styles.error}>
          Amount is below the {formatCurrency(minimumInvestment)} minimum for this deal.
        </Text>
      ) : (
        <Text style={styles.helper}>
          Minimum investment: {formatCurrency(minimumInvestment)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  inputRowError: {
    borderColor: colors.danger,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.textMuted,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.lg,
    fontSize: 22,
    fontWeight: "600",
    color: colors.text,
  },
  quickRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  quickChipPressed: {
    backgroundColor: colors.neutralSoft,
  },
  quickChipLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  error: {
    fontSize: 13,
    color: colors.danger,
    lineHeight: 18,
  },
  helper: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
