/**
 * Domain types for Mini Deals Explorer.
 * Field names intentionally mirror the future real API contract — do not rename.
 */

export type Deal = {
  id: string;
  name: string; // "Northwind Ventures SPV IV"
  entity_name: string; // "Northwind GP LLC"
  logo_url?: string;
  type: "spv" | "fund";
  status: "draft" | "active" | "closed";
  management_fee_percent: number; // 2.0
  total_carry: number; // 20
  minimum_investment: number; // 25000
  closing_date: string; // ISO date
  created_at: string;
  stats: {
    total_raised_subscribed: number;
    total_raised_wired: number;
    investor_count: number;
  };
};

export type Investment = {
  id: string;
  deal_id: string;
  identity: {
    legal_name: string;
    type: "individual" | "entity";
    country: string;
  };
  subscription_amount: number;
  net_investment: number;
  status: "pending" | "signed" | "wired";
};

/** An investing profile the signed-in user can subscribe under. */
export type Identity = {
  id: string;
  legal_name: string;
  type: "individual" | "entity";
  country: string;
};

export type DealType = Deal["type"];
export type DealStatus = Deal["status"];
export type DealStats = Deal["stats"];
export type InvestmentStatus = Investment["status"];
export type IdentityType = Identity["type"];

/** Shape returned by the deal-detail endpoint: the deal plus its investments. */
export type DealDetail = {
  deal: Deal;
  investments: Investment[];
};

/** Payload the client sends to create an investment. */
export type CreateInvestmentInput = {
  deal_id: string;
  identity: Identity;
  subscription_amount: number;
};

/** A session investment joined with its deal's name for display. */
export type MyInvestment = Investment & { deal_name: string };

/**
 * Deals list plus where it came from — "cache" means the network failed and
 * the offline fallback served the last successfully loaded list.
 */
export type DealsSnapshot = {
  deals: Deal[];
  source: "network" | "cache";
};
