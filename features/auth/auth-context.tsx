import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import type { MockUser } from "@/types/user";

type AuthContextValue = {
  user: MockUser | null;
  signIn: (email: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** "jane.doe@fund.com" → { first_name: "Jane", last_name: "Doe" }. */
function nameFromEmail(email: string): Pick<MockUser, "first_name" | "last_name"> {
  const localPart = email.split("@")[0] ?? "";
  const tokens = localPart.split(/[._\-+0-9]+/).filter((token) => token.length > 0);
  return {
    first_name: capitalize(tokens[0] ?? "Demo"),
    last_name: capitalize(tokens[1] ?? "Investor"),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);

  const signIn = useCallback((email: string) => {
    const normalized = email.trim().toLowerCase();
    setUser({
      id: `user_${normalized}`,
      email: normalized,
      ...nameFromEmail(normalized),
    });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, signIn, signOut }),
    [user, signIn, signOut],
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
