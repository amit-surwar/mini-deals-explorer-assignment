import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { AuthApiError } from "@/lib/api/authApi";
import { haptic } from "@/lib/haptics";
import { colors, radius, spacing } from "@/lib/theme";
import { useAuth } from "@/features/auth/auth-context";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

export function SignInScreen() {
  const { user, requestCode, verifyCode } = useAuth();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const verifyingRef = useRef(false);

  const trimmedEmail = email.trim();
  const isValidEmail = EMAIL_PATTERN.test(trimmedEmail);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  // Once verifyCode() sets the user, this screen redirects into the app —
  // and it also bounces already-signed-in users who land here.
  if (user) {
    return <Redirect href="/" />;
  }

  const handleSendCode = async () => {
    if (!isValidEmail || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await requestCode(trimmedEmail);
      setDevCode(result.devCode ?? null);
      setCode("");
      setStep("code");
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message
          : "Could not reach the server — it may be waking up. Try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (submitted: string) => {
    if (submitted.length !== CODE_LENGTH || verifyingRef.current) return;
    verifyingRef.current = true;
    setBusy(true);
    setError(null);
    try {
      await verifyCode(trimmedEmail, submitted);
      haptic.success();
      // Success: `user` is now set and the redirect above takes over.
    } catch (err) {
      haptic.error();
      setCode("");
      setError(
        err instanceof AuthApiError
          ? err.message
          : "Verification failed — try again.",
      );
    } finally {
      verifyingRef.current = false;
      setBusy(false);
    }
  };

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    if (digits.length === CODE_LENGTH) {
      void handleVerify(digits);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Ionicons name="trending-up" size={34} color={colors.card} />
          </View>
          <Text style={styles.title}>Mini Deals Explorer</Text>
          <Text style={styles.subtitle}>
            Browse deals, review terms, and track your investments.
          </Text>
        </View>

        <View style={styles.form}>
          {step === "email" ? (
            <>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                key="email-input"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="go"
                onSubmitEditing={() => void handleSendCode()}
              />
              <Button
                title="Send code"
                onPress={() => void handleSendCode()}
                disabled={!isValidEmail}
                loading={busy}
              />
              <Text style={styles.hint}>
                We&apos;ll email you a one-time 6-digit code. No password needed.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.label}>Enter code</Text>
              <Text style={styles.hint}>
                Code sent to {trimmedEmail}. It expires in 10 minutes.
              </Text>
              <TextInput
                key="otp-input"
                testID="otp-input"
                style={[styles.input, styles.codeInput]}
                value={code}
                onChangeText={handleCodeChange}
                placeholder="••••••"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={CODE_LENGTH}
                autoFocus
                editable={!busy}
              />
              {devCode && (
                <Text style={styles.hint}>
                  Demo mode — your code is{" "}
                  <Text style={styles.devCode}>{devCode}</Text>
                </Text>
              )}
              <Button
                title="Verify & sign in"
                onPress={() => void handleVerify(code)}
                disabled={code.length !== CODE_LENGTH}
                loading={busy}
              />
              <View style={styles.codeActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setStep("email");
                    setError(null);
                  }}
                  disabled={busy}
                >
                  <Text style={styles.linkText}>Change email</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void handleSendCode()}
                  disabled={resendIn > 0 || busy}
                >
                  <Text
                    style={[
                      styles.linkText,
                      (resendIn > 0 || busy) && styles.linkTextDisabled,
                    ]}
                  >
                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.xxl,
  },
  brand: {
    alignItems: "center",
    gap: spacing.md,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
    // Explicit resets: Fabric recycles native TextInputs, and a field reused
    // from the OTP step would otherwise keep its wide letter-spacing.
    letterSpacing: 0,
    textAlign: "left",
  },
  codeInput: {
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 12,
    fontVariant: ["tabular-nums"],
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
  devCode: {
    fontWeight: "700",
    color: colors.text,
  },
  codeActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  linkText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "600",
  },
  linkTextDisabled: {
    color: colors.textMuted,
    fontWeight: "400",
  },
  error: {
    fontSize: 13,
    color: "#b91c1c",
    textAlign: "center",
  },
});
