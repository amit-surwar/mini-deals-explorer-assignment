import { http, HttpResponse } from "msw";

import { AUTH_API_BASE_URL } from "@/lib/api/config";

export const TEST_OTP_CODE = "123456";
const TEST_TOKEN = "test-access-token";

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "test";
  return local
    .split(/[._\-+0-9]+/)
    .filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(" ") || "Test Investor";
}

let lastEmail = "test@example.com";

/**
 * TEST-ONLY handlers for the real auth API. The running app never uses these
 * (msw/native bypasses the auth host); Jest registers them so the suite is
 * hermetic — no network, fixed code "123456".
 */
export const authTestHandlers = [
  http.post(`${AUTH_API_BASE_URL}/auth/request-otp`, async ({ request }) => {
    const body = (await request.json()) as { email: string };
    lastEmail = body.email;
    return HttpResponse.json({
      message: "Code sent",
      devCode: TEST_OTP_CODE,
    });
  }),

  http.post(`${AUTH_API_BASE_URL}/auth/verify-otp`, async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string };
    if (body.code !== TEST_OTP_CODE) {
      return HttpResponse.json(
        { statusCode: 401, message: "Incorrect code", error: "Unauthorized" },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      accessToken: TEST_TOKEN,
      user: {
        id: `user_${body.email}`,
        email: body.email,
        name: nameFromEmail(body.email),
      },
    });
  }),

  http.get(`${AUTH_API_BASE_URL}/auth/me`, ({ request }) => {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${TEST_TOKEN}`) {
      return HttpResponse.json(
        { statusCode: 401, message: "Unauthorized", error: "Unauthorized" },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      id: `user_${lastEmail}`,
      email: lastEmail,
      name: nameFromEmail(lastEmail),
    });
  }),
];
