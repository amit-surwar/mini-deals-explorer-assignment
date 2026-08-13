import { AUTH_API_BASE_URL } from "@/lib/api/config";

/** User shape returned by the auth API. */
export type ApiAuthUser = {
  id: string;
  email: string;
  name: string;
};

export class AuthApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

// The auth API runs on a free tier that sleeps when idle; the first request
// can take ~30-40s to wake it. A generous timeout plus one retry absorbs it.
const TIMEOUT_MS = 20_000;

async function attempt(
  path: string,
  options: { method?: string; body?: unknown; token?: string },
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${AUTH_API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      ...(options.body !== undefined && { body: JSON.stringify(options.body) }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await attempt(path, options);
  } catch {
    // Network failure or timeout — retry once before surfacing.
    response = await attempt(path, options);
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (body.message) {
        message = Array.isArray(body.message)
          ? body.message.join(", ")
          : body.message;
      }
    } catch {
      // Non-JSON error body — keep the generic message.
    }
    throw new AuthApiError(response.status, message);
  }

  return (await response.json()) as T;
}

/** Ask the API to email a 6-digit code. In demo mode it returns `devCode`. */
export function requestOtp(
  email: string,
): Promise<{ message: string; devCode?: string }> {
  return request("/auth/request-otp", { method: "POST", body: { email } });
}

/** Exchange a correct code for a 24h JWT and the user profile. */
export function verifyOtp(
  email: string,
  code: string,
): Promise<{ accessToken: string; user: ApiAuthUser }> {
  return request("/auth/verify-otp", { method: "POST", body: { email, code } });
}

/** Validate a stored token and fetch the current user. */
export function fetchMe(token: string): Promise<ApiAuthUser> {
  return request("/auth/me", { token });
}
