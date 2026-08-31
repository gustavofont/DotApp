import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authForgeClient } from "../api/client";
import { setAccessToken, getRefreshToken, setRefreshToken } from "./tokenStore";

interface AuthContextValue {
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Refresh token in localStorage survives a page reload; the access token
  // in memory does not — so on mount we try to trade one for the other
  // before rendering anything that assumes a session.
  useEffect(() => {
    async function restoreSession() {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setIsInitializing(false);
        return;
      }

      const { data, error } = await authForgeClient.POST("/auth/refresh", {
        body: { refreshToken },
      });

      if (error || !data) {
        setRefreshToken(null);
      } else {
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setIsAuthenticated(true);
      }
      setIsInitializing(false);
    }

    void restoreSession();
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const { data, error, response } = await authForgeClient.POST("/auth/login", {
      body: { email, password },
    });

    if (error || !data) {
      // Flat `status` (not nested under `.response`, openapi-fetch doesn't
      // shape errors that way) so callers can tell a throttle (429) apart
      // from a locked account (403) from bad credentials (401/400).
      throw Object.assign({}, error, { status: response.status });
    }

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setIsAuthenticated(true);
  }

  async function logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // Best effort — even if revocation fails server-side, the client
      // forgets its tokens either way; the user is logged out locally.
      await authForgeClient.POST("/auth/logout", { body: { refreshToken } }).catch(() => {});
    }
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
