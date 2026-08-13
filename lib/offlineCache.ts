import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Deal } from "@/types/deal";

const CACHE_KEY = "mini-deals/last-deals";

/**
 * Best-effort offline cache for the deals list: saved after every successful
 * fetch, read back when a fetch fails so the list screen still renders.
 */
export async function saveCachedDeals(deals: Deal[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(deals));
  } catch {
    // Caching must never break the happy path.
  }
}

export async function loadCachedDeals(): Promise<Deal[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw) as Deal[];
  } catch {
    return null;
  }
}
