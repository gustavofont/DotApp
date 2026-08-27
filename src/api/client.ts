import createClient from "openapi-fetch";
import type { paths as DotCardPaths } from "./dotcard.types";
import type { paths as AuthForgePaths } from "./authforge.types";
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
} from "../auth/tokenStore";

const DOTCARD_API_URL = import.meta.env.VITE_DOTCARD_API_URL ?? "http://localhost:3001";
const AUTHFORGE_URL = import.meta.env.VITE_AUTHFORGE_URL ?? "http://localhost:3000";

export const authForgeClient = createClient<AuthForgePaths>({ baseUrl: AUTHFORGE_URL });
export const dotCardClient = createClient<DotCardPaths>({ baseUrl: DOTCARD_API_URL });

// Concurrent requests that all hit a 401 at once must not each trigger their
// own refresh — they share this one in-flight attempt.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const { data, error } = await authForgeClient.POST("/auth/refresh", {
    body: { refreshToken },
  });

  if (error || !data) {
    setAccessToken(null);
    setRefreshToken(null);
    return false;
  }

  setAccessToken(data.accessToken);
  setRefreshToken(data.refreshToken);
  return true;
}

// Both clients need the access token attached (AuthForge's own /auth/logout
// is @ApiBearerAuth-protected too) — only DotCard-API calls get the
// 401-triggers-a-refresh-and-retry behavior, since that's the client every
// screen actually depends on staying authenticated.
function attachAccessToken({ request }: { request: Request }): Request {
  const token = getAccessToken();
  if (token) {
    request.headers.set("Authorization", `Bearer ${token}`);
  }
  return request;
}

authForgeClient.use({ onRequest: attachAccessToken });

dotCardClient.use({
  onRequest: attachAccessToken,
  async onResponse({ request, response }) {
    if (response.status !== 401) return response;

    refreshInFlight ??= refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
    const refreshed = await refreshInFlight;
    if (!refreshed) return response;

    const retryRequest = request.clone();
    retryRequest.headers.set("Authorization", `Bearer ${getAccessToken()}`);
    return fetch(retryRequest);
  },
});
