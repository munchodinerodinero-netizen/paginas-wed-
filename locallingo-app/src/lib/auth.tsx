import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setApiToken, setOnUnauthorized } from "./api";
import { deleteItem, getItem, setItem } from "./storage";

export type User = { id: string; email: string; name: string; role: "TOURIST" | "GUIDE" | "ADMIN"; locale: string; currency: string };
type AuthResponse = { token: string; user: { id: string } };

type Ctx = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: { name: string; email: string; password: string; role: "TOURIST" | "GUIDE" }) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);
const TOKEN_KEY = "ll_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const clear = useCallback(async () => {
    setApiToken(null);
    setUser(null);
    await deleteItem(TOKEN_KEY);
  }, []);

  const adopt = useCallback(async (token: string) => {
    setApiToken(token);
    const me = await api<User>("/me");
    await setItem(TOKEN_KEY, token);
    setUser(me);
    return me;
  }, []);

  useEffect(() => {
    // Sesión expirada o usuario suspendido → volver a estado sin sesión.
    setOnUnauthorized(() => void clear());
    getItem(TOKEN_KEY)
      .then((t) => (t ? adopt(t) : null))
      .catch(() => clear())
      .finally(() => setReady(true));
  }, [adopt, clear]);

  const value = useMemo<Ctx>(
    () => ({
      user,
      ready,
      login: async (email, password) => adopt((await api<AuthResponse>("/auth/login", { body: { email, password } })).token),
      register: async (input) => adopt((await api<AuthResponse>("/auth/register", { body: input })).token),
      logout: clear,
    }),
    [user, ready, adopt, clear],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fuera de AuthProvider");
  return ctx;
}
