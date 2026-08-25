import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { loginAdmin } from '@/lib/api';

type AuthContextValue = {
  token: string | null;
  adminLabel: string | null;
  isLoggingIn: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [adminLabel, setAdminLabel] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      adminLabel,
      isLoggingIn,
      error,
      login: async (email, password) => {
        setIsLoggingIn(true);
        setError(null);
        try {
          const result = await loginAdmin(email.trim(), password);
          setToken(result.accessToken);
          setAdminLabel(result.admin?.displayName || result.admin?.email || email.trim());
        } catch (caught) {
          const message = caught instanceof Error ? caught.message : 'Unable to sign in';
          setError(message);
          throw caught;
        } finally {
          setIsLoggingIn(false);
        }
      },
      logout: () => {
        setToken(null);
        setAdminLabel(null);
        setError(null);
      },
    }),
    [adminLabel, error, isLoggingIn, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
