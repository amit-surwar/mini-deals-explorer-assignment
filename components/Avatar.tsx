import { Image, StyleSheet, Text, View } from "react-native";

import { colors } from "@/lib/theme";

type AvatarProps = {
  name: string;
  size?: number;
  uri?: string;
};

function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter((word) => word.length > 0);
  const initials = words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  return initials.length > 0 ? initials : "?";
}

/** Initials avatar; renders the image when a logo_url is provided. */
export function Avatar({ name, size = 44, uri }: AvatarProps) {
  const borderRadius = size / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius }}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius }]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initialsOf(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
});
