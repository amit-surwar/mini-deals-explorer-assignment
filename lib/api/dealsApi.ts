import dealsJson from "@/mocks/deals.json";
import type { Deal, DealDetail, Identity, Investment } from "@/types/deal";

/**
 * The mock "backend". This is the ONLY module that knows where deal data
 * comes from — to point the app at a real API, replace the bodies of
 * fetchDeals / fetchDealById / createInvestment with fetch() calls and
 * delete the in-memory store. Hook signatures and screens stay untouched.
 */

const FAKE_LATENCY_MS = 400;

type MockDb = {
  deals: Deal[];
  investments: Investment[];
};

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// JSON imports widen string literals (e.g. status becomes `string`), so the
// seed data is narrowed back to the domain types once, at this boundary.
const db: MockDb = deepClone(dealsJson as unknown as MockDb);

async function fakeNetwork(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));
}

function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = copy[i];
    const b = copy[j];
    copy[i] = b;
    copy[j] = a;
  }
  return copy;
}

/** Every fetch returns a fresh shuffle, so pull-to-refresh visibly reorders the list. */
export async function fetchDeals(): Promise<Deal[]> {
  await fakeNetwork();
  return deepClone(shuffled(db.deals));
}

export async function fetchDealById(dealId: string): Promise<DealDetail> {
  await fakeNetwork();
  const deal = db.deals.find((candidate) => candidate.id === dealId);
  if (!deal) {
    throw new Error("This deal could not be found. It may have been removed.");
  }
  const investments = db.investments.filter(
    (investment) => investment.deal_id === dealId,
  );
  return deepClone({ deal, investments });
}

export type CreateInvestmentInput = {
  deal_id: string;
  identity: Identity;
  subscription_amount: number;
};

let localInvestmentSequence = 1;

export async function createInvestment(
  input: CreateInvestmentInput,
): Promise<Investment> {
  await fakeNetwork();
  const deal = db.deals.find((candidate) => candidate.id === input.deal_id);
  if (!deal) {
    throw new Error("This deal could not be found. It may have been removed.");
  }
  if (input.subscription_amount < deal.minimum_investment) {
    throw new Error(
      `The minimum investment for ${deal.name} is $${deal.minimum_investment.toLocaleString("en-US")}.`,
    );
  }

  const feeMultiplier = 1 - deal.management_fee_percent / 100;
  const investment: Investment = {
    id: `inv_local_${localInvestmentSequence++}`,
    deal_id: deal.id,
    identity: {
      legal_name: input.identity.legal_name,
      type: input.identity.type,
      country: input.identity.country,
    },
    subscription_amount: input.subscription_amount,
    net_investment: Math.round(input.subscription_amount * feeMultiplier),
    status: "pending",
  };

  // Keep the store internally consistent so the new subscription shows up
  // in the deal's investor list and raise stats after cache invalidation.
  db.investments.push(investment);
  deal.stats.investor_count += 1;
  deal.stats.total_raised_subscribed += investment.subscription_amount;

  return deepClone(investment);
}
