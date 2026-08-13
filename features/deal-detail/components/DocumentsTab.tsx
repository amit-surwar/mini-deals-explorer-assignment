import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/lib/theme";

const DOCUMENTS: { name: string; meta: string }[] = [
  { name: "Private Placement Memorandum.pdf", meta: "PDF · 2.4 MB" },
  { name: "Subscription Agreement.pdf", meta: "PDF · 860 KB" },
  { name: "Operating Agreement.pdf", meta: "PDF · 1.1 MB" },
];

/** Static file list — intentionally not downloadable in this mock app. */
export function DocumentsTab() {
  return (
    <View style={styles.card}>
      {DOCUMENTS.map((document, index) => (
        <View key={document.name} style={[styles.row, index > 0 && styles.rowBorder]}>
          <View style={styles.iconBox}>
            <Ionicons name="document-text-outline" size={22} color={colors.primaryDark} />
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={1}>
              {document.name}
            </Text>
            <Text style={styles.meta}>{document.meta}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
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
