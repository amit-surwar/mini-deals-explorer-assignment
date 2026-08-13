import { Pressable, StyleSheet, Text, View } from "react-native";

import { haptic } from "@/lib/haptics";
import { colors, radius, spacing } from "@/lib/theme";
import type { Identity } from "@/types/deal";

type IdentityPickerProps = {
  identities: Identity[];
  selectedId: string | null;
  onSelect: (identityId: string) => void;
};

export function IdentityPicker({
  identities,
  selectedId,
  onSelect,
}: IdentityPickerProps) {
  return (
    <View style={styles.list}>
      {identities.map((identity) => {
        const selected = identity.id === selectedId;
        return (
          <Pressable
            key={identity.id}
            onPress={() => {
              haptic.select();
              onSelect(identity.id);
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.card, selected && styles.cardSelected]}
          >
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <View style={styles.radioDot} /> : null}
            </View>
            <View style={styles.nameBlock}>
              <Text style={styles.name} numberOfLines={1}>
                {identity.legal_name}
              </Text>
              <Text style={styles.meta}>
                {identity.type === "individual" ? "Individual" : "Entity"} ·{" "}
                {identity.country}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
