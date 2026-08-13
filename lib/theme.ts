/** Single source of truth for colors and spacing. Brand accent: #05c168. */
export const colors = {
  primary: "#05c168",
  primaryDark: "#049350",
  primarySoft: "#e3f8ee",
  background: "#f5f7f6",
  card: "#ffffff",
  text: "#101828",
  textMuted: "#667085",
  border: "#e4e7ec",
  danger: "#d92d20",
  dangerSoft: "#fee4e2",
  warning: "#b54708",
  warningSoft: "#fef0c7",
  info: "#175cd3",
  infoSoft: "#eff4ff",
  neutralSoft: "#f2f4f7",
  disabled: "#d0d5dd",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;
