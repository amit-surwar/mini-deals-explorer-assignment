/**
 * Headless end-to-end audit of the real route tree: the actual layouts,
 * screens, data layer (real fetch() calls answered by the MSW mock server,
 * with its 400 ms latency), and navigation run against expo-router's testing
 * library — no mocks of app code.
 */
import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { renderRouter } from "expo-router/testing-library";
import { http, HttpResponse } from "msw";

import TabsLayout from "@/app/(app)/(tabs)/_layout";
import DealsIndexRoute from "@/app/(app)/(tabs)/index";
import MyInvestmentsRoute from "@/app/(app)/(tabs)/my-investments";
import AppLayout from "@/app/(app)/_layout";
import DealDetailRoute from "@/app/(app)/deals/[id]/index";
import InvestRoute from "@/app/(app)/deals/[id]/invest";
import SuccessRoute from "@/app/(app)/deals/[id]/success";
import RootLayout from "@/app/_layout";
import SignInRoute from "@/app/sign-in";
import { API_BASE_URL } from "@/lib/api/config";
import { server } from "@/mocks/server/testServer";

const routes = {
  _layout: RootLayout,
  "sign-in": SignInRoute,
  "(app)/_layout": AppLayout,
  "(app)/(tabs)/_layout": TabsLayout,
  "(app)/(tabs)/index": DealsIndexRoute,
  "(app)/(tabs)/my-investments": MyInvestmentsRoute,
  "(app)/deals/[id]/index": DealDetailRoute,
  "(app)/deals/[id]/invest": InvestRoute,
  "(app)/deals/[id]/success": SuccessRoute,
} as const;

const LONG: { timeout: number } = { timeout: 8000 };

type RefreshControlLike = { props: { onRefresh?: () => void } };

/** Pull-to-refresh: RefreshControl is a prop, not an ancestor, so fireEvent
 *  can't reach its handler — invoke it the way RNTL documents. */
function triggerPullToRefresh(testId: string) {
  const { refreshControl } = screen.getByTestId(testId).props as {
    refreshControl?: RefreshControlLike;
  };
  act(() => {
    refreshControl?.props.onRefresh?.();
  });
}

async function signIn(email: string) {
  renderRouter(routes, { initialUrl: "/" });
  // The (app) guard must bounce an unauthenticated "/" to the sign-in screen.
  const emailInput = await screen.findByPlaceholderText("you@example.com", {}, LONG);
  fireEvent.changeText(emailInput, email);
  fireEvent.press(screen.getByText("Sign in"));
}

describe("audit: happy path", () => {
  test("sign-in → deals list → detail tabs → invest (validated) → success", async () => {
    await signIn("jane.doe@example.com");

    // Deals list: data arrives after the fake delay; summary header totals.
    await screen.findByText("Northwind Ventures SPV IV", {}, LONG);
    expect(screen.getByText("Total raised")).toBeTruthy();
    expect(screen.getByText("$7.5M")).toBeTruthy();
    expect(screen.getByText("8")).toBeTruthy(); // deal count

    // → Deal detail
    fireEvent.press(screen.getByLabelText("Open Northwind Ventures SPV IV"));
    await screen.findByText("Management fee", {}, LONG);
    // Entity name appears in both the header card and the Overview terms row.
    expect(screen.getAllByText("Northwind GP LLC").length).toBeGreaterThan(0);
    expect(screen.getAllByText("SPV").length).toBeGreaterThan(0); // header chip + type row
    expect(screen.getByText("2%")).toBeTruthy(); // fee
    expect(screen.getByText("20%")).toBeTruthy(); // carry
    expect(screen.getByText("$25,000")).toBeTruthy(); // minimum
    expect(screen.getByText("$215,000")).toBeTruthy(); // subscribed

    // Investors tab shows this deal's records.
    fireEvent.press(screen.getByText("Investors (4)"));
    await screen.findByText("Priya Raman", {}, LONG);
    expect(screen.getByText("Kestrel Family Trust")).toBeTruthy();
    expect(screen.getByText("$100,000")).toBeTruthy();

    // Documents tab: static files with icons.
    fireEvent.press(screen.getByText("Documents"));
    await screen.findByText("Subscription Agreement.pdf", {}, LONG);
    expect(screen.getByText("Private Placement Memorandum.pdf")).toBeTruthy();
    expect(screen.getByText("Operating Agreement.pdf")).toBeTruthy();

    // → Invest
    fireEvent.press(screen.getByText("Invest in this deal"));
    await screen.findByText("1. Investing identity", {}, LONG);

    // Three identities derived from the signed-in user.
    expect(screen.getByText("Jane Doe")).toBeTruthy();
    expect(screen.getByText("The Doe Family Trust")).toBeTruthy();
    expect(screen.getByText("Doe Capital Holdings LLC")).toBeTruthy();
    fireEvent.press(screen.getByText("Jane Doe"));

    // Below-minimum amount → inline error, submit stays disabled.
    const amountInput = screen.getByLabelText("Investment amount in dollars");
    fireEvent.changeText(amountInput, "1000");
    expect(amountInput.props.value).toBe("1,000"); // currency formatting
    await screen.findByText(/below the \$25,000 minimum/, {}, LONG);
    let submit = screen.getByRole("button", { name: "Invest" });
    expect(submit.props.accessibilityState.disabled).toBe(true);

    // Valid amount but terms unchecked → still disabled; pressing does nothing.
    fireEvent.changeText(amountInput, "50000");
    expect(amountInput.props.value).toBe("50,000");
    expect(screen.queryByText(/below the \$25,000 minimum/)).toBeNull();
    submit = screen.getByRole("button", { name: "Invest $50,000" });
    expect(submit.props.accessibilityState.disabled).toBe(true);
    fireEvent.press(submit);
    expect(screen.queryByText("Investment submitted")).toBeNull();

    // Accept terms → enabled → submit → success screen.
    fireEvent.press(screen.getByText(/I have reviewed the deal documents/));
    submit = screen.getByRole("button", { name: "Invest $50,000" });
    expect(submit.props.accessibilityState.disabled).toBe(false);
    fireEvent.press(submit);
    await screen.findByText("Investment submitted", {}, LONG);
    expect(
      screen.getByText(/Your \$50,000 subscription to Northwind Ventures SPV IV/),
    ).toBeTruthy();
    expect(screen.getByText("Pending")).toBeTruthy();

    // Back to deal: cache was invalidated, so the new investment is visible.
    fireEvent.press(screen.getByRole("button", { name: "Back to deal" }));
    const investorsTab = await screen.findByText("Investors (5)", {}, LONG);
    fireEvent.press(investorsTab);
    await screen.findByText("Jane Doe", {}, LONG);
  });
});

describe("audit: stretch goals", () => {
  test("My Investments tab lists the session's investments across deals", async () => {
    await signIn("stretch.goals@example.com");
    await screen.findByPlaceholderText("Search deals by name", {}, LONG);

    // The happy-path test invested $50,000 in Northwind this session; the
    // shared mock server keeps it, so the tab must list it with its deal name.
    fireEvent.press(screen.getByText("My Investments"));
    await screen.findByText("Northwind Ventures SPV IV", {}, LONG);
    // "$50,000" appears in both the session summary and the row itself.
    expect(screen.getAllByText("$50,000").length).toBeGreaterThan(0);
    expect(screen.getByText("as Jane Doe")).toBeTruthy();
    expect(screen.getByText(/committed this session across/)).toBeTruthy();
  });

  test("deals list falls back to the cached list with a banner when the network dies", async () => {
    await signIn("offline.mode@example.com");
    // First load succeeds (and persists the list to the offline cache).
    await screen.findByText("Total raised", {}, LONG);
    expect(screen.queryByText(/Offline — showing your last synced deals/)).toBeNull();

    // Kill the "network": every /deals request now fails at the socket level.
    server.use(
      http.get(`${API_BASE_URL}/deals`, () => HttpResponse.error()),
    );
    triggerPullToRefresh("deals-list");

    // The list must keep rendering — served from the cache, with a banner.
    await screen.findByText(/Offline — showing your last synced deals/, {}, LONG);
    expect(screen.getByText("Total raised")).toBeTruthy();
    expect(screen.getAllByLabelText(/^Open /).length).toBeGreaterThan(0);

    // Network restored → banner clears on the next refresh.
    server.resetHandlers();
    triggerPullToRefresh("deals-list");
    await waitFor(
      () =>
        expect(
          screen.queryByText(/Offline — showing your last synced deals/),
        ).toBeNull(),
      LONG,
    );
  });
});

describe("audit: edge cases", () => {
  test("search with no matches shows empty state and recovers via Clear filters", async () => {
    await signIn("edge.case@example.com");
    await screen.findByText("Total raised", {}, LONG);
    await screen.findByPlaceholderText("Search deals by name", {}, LONG);

    fireEvent.changeText(
      screen.getByPlaceholderText("Search deals by name"),
      "zzz nothing matches this",
    );
    await screen.findByText("No deals match", {}, LONG);
    fireEvent.press(screen.getByText("Clear filters"));
    await screen.findByText("Juniper Climate Fund I", {}, LONG);
  });

  test("deal with zero investors renders Investors tab without crashing", async () => {
    await signIn("zero.investors@example.com");
    await screen.findByPlaceholderText("Search deals by name", {}, LONG);
    fireEvent.changeText(screen.getByPlaceholderText("Search deals by name"), "Aurora");
    await screen.findByText("Aurora Deep Tech SPV", {}, LONG);

    fireEvent.press(screen.getByLabelText("Open Aurora Deep Tech SPV"));
    await screen.findByText("Investors (0)", {}, LONG);
    fireEvent.press(screen.getByText("Investors (0)"));
    await screen.findByText("No investors yet", {}, LONG);
    // Draft deal: no dead-end invest button, an explanation instead.
    expect(screen.getByText("This deal isn't open for investment yet.")).toBeTruthy();
  });

  test("empty and non-numeric amount input never crashes or enables submit", async () => {
    await signIn("fat.fingers@example.com");
    await screen.findByPlaceholderText("Search deals by name", {}, LONG);
    fireEvent.changeText(screen.getByPlaceholderText("Search deals by name"), "Saltgrass");
    await screen.findByText("Saltgrass Seed SPV III", {}, LONG);
    fireEvent.press(screen.getByLabelText("Open Saltgrass Seed SPV III"));
    await screen.findByText("Invest in this deal", {}, LONG);
    fireEvent.press(screen.getByText("Invest in this deal"));
    await screen.findByText("1. Investing identity", {}, LONG);

    const amountInput = screen.getByLabelText("Investment amount in dollars");

    // Non-numeric input is stripped, no crash, no error, submit disabled.
    fireEvent.changeText(amountInput, "abc!?—🙂");
    expect(amountInput.props.value).toBe("");
    expect(screen.queryByText(/below the .* minimum/)).toBeNull();
    expect(
      screen.getByRole("button", { name: "Invest" }).props.accessibilityState.disabled,
    ).toBe(true);

    // Zero is kept, flagged as below minimum, still blocked (button title
    // stays the generic "Invest" while the amount is invalid).
    fireEvent.changeText(amountInput, "0");
    expect(amountInput.props.value).toBe("0");
    await screen.findByText(/below the \$5,000 minimum/, {}, LONG);
    expect(
      screen.getByRole("button", { name: "Invest" }).props.accessibilityState.disabled,
    ).toBe(true);

    // Emptying the field clears the error and keeps submit disabled.
    fireEvent.changeText(amountInput, "");
    expect(amountInput.props.value).toBe("");
    expect(screen.queryByText(/below the .* minimum/)).toBeNull();
  });
});
