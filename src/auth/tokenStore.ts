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
