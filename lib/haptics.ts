import * as Haptics from "expo-haptics";

/**
 * Fire-and-forget haptic feedback. Failures (web, simulator, Jest) are
 * silently ignored — haptics are seasoning, never load-bearing.
 */
export const haptic = {
  /** Small tick for selections: filter chips, identity picker, toggles. */
  select(): void {
    void Haptics.selectionAsync().catch(() => {});
  },
  /** Light tap for card presses and minor confirmations. */
  tap(): void {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  /** Success notification: investment submitted, signed in. */
  success(): void {
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => {});
  },
  /** Error notification: wrong OTP code, failed submit. */
  error(): void {
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Error,
    ).catch(() => {});
  },
};
