import dealsJson from "@/mocks/deals.json";
import type {
  CreateInvestmentInput,
  Deal,
  DealDetail,
  Investment,
  MyInvestment,
} from "@/types/deal";

/**
 * The mock server's in-memory database, seeded from deals.json. Lives for the
 * app session, so created investments show up in deal stats, the investor
 * list, and the "My Investments" tab until the app restarts.
 */

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

/** Ids of investments created during this session (for "My Investments"). */
const sessionInvestmentIds: string[] = [];
let investmentSequence = 1;

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

/** Fresh shuffle on every call, so pull-to-refresh visibly reorders the list. */
export function listDeals(): Deal[] {
  return deepClone(shuffled(db.deals));
}

export function getDealDetail(dealId: string): DealDetail | null {
  const deal = db.deals.find((candidate) => candidate.id === dealId);
  if (!deal) {
    return null;
  }
  const investments = db.investments.filter(
    (investment) => investment.deal_id === dealId,
  );
  return deepClone({ deal, investments });
}

/** Throws with a user-facing message on unknown deal or below-minimum amount. */
export function createInvestmentRecord(input: CreateInvestmentInput): Investment {
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
    id: `inv_session_${investmentSequence++}`,
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

  // Keep the store internally consistent so the new subscription shows up in
  // the deal's investor list and raise stats.
  db.investments.push(investment);
  deal.stats.investor_count += 1;
  deal.stats.total_raised_subscribed += investment.subscription_amount;
  sessionInvestmentIds.push(investment.id);

  return deepClone(investment);
}

/** Investments created during this session, joined with their deal names. */
export function listSessionInvestments(): MyInvestment[] {
  const rows: MyInvestment[] = [];
  for (const id of sessionInvestmentIds) {
    const investment = db.investments.find((candidate) => candidate.id === id);
    if (!investment) {
      continue;
    }
    const deal = db.deals.find((candidate) => candidate.id === investment.deal_id);
    rows.push({
      ...deepClone(investment),
      deal_name: deal ? deal.name : "Unknown deal",
    });
  }
  return rows;
}
