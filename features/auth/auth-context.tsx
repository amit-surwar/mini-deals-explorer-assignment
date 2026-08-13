import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  AuthApiError,
  fetchMe,
  requestOtp,
  verifyOtp,
  type ApiAuthUser,
} from "@/lib/api/authApi";
import type { MockUser } from "@/types/user";

const TOKEN_KEY = "mde.auth.token";
const USER_KEY = "mde.auth.user";

/** "restoring" only during the initial session load on app start. */
export type AuthStatus = "restoring" | "signedOut" | "signedIn";

type AuthContextValue = {
  status: AuthStatus;
  user: MockUser | null;
  /** Step 1: ask the API to send a code. Returns `devCode` in demo mode. */
  requestCode: (email: string) => Promise<{ devCode?: string }>;
  /** Step 2: exchange the code for a JWT; persists the session. */
  verifyCode: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** API user ("Jane Doe") → the app's first/last shape used by identities. */
function toSessionUser(apiUser: ApiAuthUser): MockUser {
  const parts = apiUser.name.trim().split(/\s+/);
  return {
    id: apiUser.id,
    email: apiUser.email,
    first_name: parts[0] || "Investor",
    last_name: parts.slice(1).join(" ") || "Account",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("restoring");
  const [user, setUser] = useState<MockUser | null>(null);

  // Restore the persisted session on launch: trust the cached user right away
  // (no network wait), then validate the token in the background — a 401
  // (expired/invalid) signs the user out; transient network errors don't.
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [[, token], [, cachedUser]] = await AsyncStorage.multiGet([
          TOKEN_KEY,
          USER_KEY,
        ]);
        if (!token || !cachedUser) {
          if (active) setStatus("signedOut");
          return;
        }
        if (active) {
          setUser(JSON.parse(cachedUser) as MockUser);
          setStatus("signedIn");
        }
        try {
          const fresh = await fetchMe(token);
          if (active) setUser(toSessionUser(fresh));
        } catch (error) {
          if (
            active &&
            error instanceof AuthApiError &&
            error.status === 401
          ) {
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
            setUser(null);
            setStatus("signedOut");
          }
        }
      } catch {
        if (active) setStatus("signedOut");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const requestCode = useCallback(async (email: string) => {
    const result = await requestOtp(email.trim().toLowerCase());
    return { devCode: result.devCode };
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    const result = await verifyOtp(email.trim().toLowerCase(), code);
    const sessionUser = toSessionUser(result.user);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, result.accessToken],
      [USER_KEY, JSON.stringify(sessionUser)],
    ]);
    setUser(sessionUser);
    setStatus("signedIn");
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setUser(null);
    setStatus("signedOut");
  }, []);

  const value = useMemo(
    () => ({ status, user, requestCode, verifyCode, signOut }),
    [status, user, requestCode, verifyCode, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
