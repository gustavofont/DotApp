/**
 * The access token lives only here, in memory — never in localStorage, never
 * in a cookie. It's read synchronously by api/client.ts's fetch middleware,
 * outside of React, which is why it isn't just React state on AuthContext.
 * AuthContext is the only thing that calls the setter.
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/**
 * Decodes `sub` straight out of the in-memory access token instead of
 * round-tripping through the backend — the JWT already carries it, and
 * reading your own token's payload client-side needs no extra endpoint.
 */
export function getCurrentUserId(): string | null {
  if (!accessToken) return null;
  try {
    const payload = accessToken.split(".")[1];
    const decoded: unknown = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (decoded && typeof decoded === "object" && "sub" in decoded) {
      const sub = (decoded as { sub: unknown }).sub;
      return typeof sub === "string" ? sub : null;
    }
    return null;
  } catch {
    return null;
  }
}

const REFRESH_TOKEN_KEY = "dotapp.refreshToken";

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
