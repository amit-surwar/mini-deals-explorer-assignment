import { API_BASE_URL } from "@/lib/api/config";
import type {
  CreateInvestmentInput,
  Deal,
  DealDetail,
  Investment,
  MyInvestment,
} from "@/types/deal";

/**
 * The app's only API boundary. These are real fetch() calls — in this project
 * they're answered in-process by the MSW mock server (mocks/server), so
 * pointing the app at a real backend means changing API_BASE_URL and deleting
 * the mocks. Hook signatures and screens stay untouched.
 */

type ErrorBody = { message: string };

function isErrorBody(value: unknown): value is ErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as { message: unknown }).message === "string"
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const body: unknown = await response.json();
  if (!response.ok) {
    throw new Error(
      isErrorBody(body) ? body.message : `Request failed with status ${response.status}.`,
    );
  }
  return body as T;
}

export async function fetchDeals(): Promise<Deal[]> {
  return request<Deal[]>("/deals");
}

export async function fetchDealById(dealId: string): Promise<DealDetail> {
  return request<DealDetail>(`/deals/${dealId}`);
}

export async function createInvestment(
  input: CreateInvestmentInput,
): Promise<Investment> {
  return request<Investment>(`/deals/${input.deal_id}/investments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function fetchMyInvestments(): Promise<MyInvestment[]> {
  return request<MyInvestment[]>("/my-investments");
}
