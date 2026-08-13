import { delay, http, HttpResponse } from "msw";

import { API_BASE_URL } from "@/lib/api/config";
import {
  createInvestmentRecord,
  getDealDetail,
  listDeals,
  listSessionInvestments,
} from "@/mocks/server/db";
import type { CreateInvestmentInput } from "@/types/deal";

const FAKE_LATENCY_MS = 400;

/**
 * REST surface of the mock API. The same handlers run in the app (msw/native)
 * and in Jest (msw/node), so tests exercise the exact production code path.
 */
export const handlers = [
  http.get(`${API_BASE_URL}/deals`, async () => {
    await delay(FAKE_LATENCY_MS);
    return HttpResponse.json(listDeals());
  }),

  http.get(`${API_BASE_URL}/deals/:dealId`, async ({ params }) => {
    await delay(FAKE_LATENCY_MS);
    const detail = getDealDetail(String(params.dealId));
    if (!detail) {
      return HttpResponse.json(
        { message: "This deal could not be found. It may have been removed." },
        { status: 404 },
      );
    }
    return HttpResponse.json(detail);
  }),

  http.post(`${API_BASE_URL}/deals/:dealId/investments`, async ({ params, request }) => {
    await delay(FAKE_LATENCY_MS);
    const body = (await request.json()) as CreateInvestmentInput;
    try {
      const investment = createInvestmentRecord({
        ...body,
        deal_id: String(params.dealId),
      });
      return HttpResponse.json(investment, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        {
          message:
            error instanceof Error ? error.message : "Unable to create the investment.",
        },
        { status: 422 },
      );
    }
  }),

  http.get(`${API_BASE_URL}/my-investments`, async () => {
    await delay(FAKE_LATENCY_MS);
    return HttpResponse.json(listSessionInvestments());
  }),
];
