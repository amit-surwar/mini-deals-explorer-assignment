/**
 * Proves the invariants of mocks/deals.json instead of eyeballing them:
 *   - investor_count === number of investment records per deal
 *   - total_raised_subscribed === sum of subscription_amount
 *   - total_raised_wired === sum of subscription_amount where status is "wired" (and ≤ subscribed)
 *   - net_investment === subscription_amount × (1 − management_fee_percent / 100)
 *   - created_at < closing_date; closed deals have past closing dates
 *   - every status appears at least once; no orphaned investments
 *
 * Run with: npm run verify:mocks
 */
import { readFileSync } from "node:fs";

const db = JSON.parse(
  readFileSync(new URL("../mocks/deals.json", import.meta.url), "utf8"),
);

let failures = 0;
const fail = (message) => {
  failures += 1;
  console.error(`  ✗ ${message}`);
};

const dealIds = new Set(db.deals.map((deal) => deal.id));

for (const deal of db.deals) {
  const investments = db.investments.filter((inv) => inv.deal_id === deal.id);

  if (investments.length !== deal.stats.investor_count) {
    fail(
      `${deal.id}: investor_count is ${deal.stats.investor_count} but there are ${investments.length} investment records`,
    );
  }

  const subscribed = investments.reduce((sum, inv) => sum + inv.subscription_amount, 0);
  if (subscribed !== deal.stats.total_raised_subscribed) {
    fail(
      `${deal.id}: total_raised_subscribed is ${deal.stats.total_raised_subscribed} but subscriptions sum to ${subscribed}`,
    );
  }

  const wired = investments
    .filter((inv) => inv.status === "wired")
    .reduce((sum, inv) => sum + inv.subscription_amount, 0);
  if (wired !== deal.stats.total_raised_wired) {
    fail(
      `${deal.id}: total_raised_wired is ${deal.stats.total_raised_wired} but wired subscriptions sum to ${wired}`,
    );
  }

  if (deal.stats.total_raised_wired > deal.stats.total_raised_subscribed) {
    fail(`${deal.id}: total_raised_wired exceeds total_raised_subscribed`);
  }

  if (new Date(deal.created_at) >= new Date(deal.closing_date)) {
    fail(`${deal.id}: created_at is not before closing_date`);
  }

  if (deal.status === "closed" && new Date(deal.closing_date) > new Date()) {
    fail(`${deal.id}: closed deal has a closing_date in the future`);
  }

  if (deal.status !== "closed" && new Date(deal.closing_date) < new Date()) {
    fail(`${deal.id}: ${deal.status} deal has a closing_date in the past`);
  }

  for (const inv of investments) {
    const expectedNet = Math.round(
      inv.subscription_amount * (1 - deal.management_fee_percent / 100),
    );
    if (inv.net_investment !== expectedNet) {
      fail(
        `${inv.id}: net_investment is ${inv.net_investment}, expected ${expectedNet} (fee ${deal.management_fee_percent}%)`,
      );
    }
    if (inv.net_investment > inv.subscription_amount) {
      fail(`${inv.id}: net_investment exceeds subscription_amount`);
    }
  }
}

for (const inv of db.investments) {
  if (!dealIds.has(inv.deal_id)) {
    fail(`${inv.id}: references unknown deal ${inv.deal_id}`);
  }
}

for (const status of ["draft", "active", "closed"]) {
  if (!db.deals.some((deal) => deal.status === status)) {
    fail(`no deal with status "${status}"`);
  }
}

const totalRaised = db.deals.reduce(
  (sum, deal) => sum + deal.stats.total_raised_subscribed,
  0,
);

if (failures > 0) {
  console.error(`\n${failures} invariant(s) violated.`);
  process.exit(1);
}

console.log(
  `✓ All invariants hold: ${db.deals.length} deals, ${db.investments.length} investments, $${totalRaised.toLocaleString("en-US")} total subscribed.`,
);
