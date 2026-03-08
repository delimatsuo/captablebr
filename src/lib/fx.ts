/**
 * FX Rate Service — fetches USD/BRL exchange rate.
 *
 * Rate convention: BRL per 1 USD (e.g., 5.25).
 * To convert BRL to USD: amountBrl / rate
 * To convert USD to BRL: amountUsd * rate
 */

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const MAX_STALENESS = 24 * 60 * 60 * 1000; // 24 hours
const FETCH_TIMEOUT = 5_000; // 5 seconds
const MIN_RATE = 2.0;
const MAX_RATE = 15.0;
const FALLBACK_RATE = 5.25;

interface CachedRate {
  rate: number;
  fetchedAt: number;
}

let cache: CachedRate | null = null;

function isRateSane(rate: number): boolean {
  return rate >= MIN_RATE && rate <= MAX_RATE;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFromFrankfurter(): Promise<number | null> {
  try {
    const res = await fetchWithTimeout("https://api.frankfurter.app/latest?from=USD&to=BRL");
    if (!res.ok) return null;
    const data = await res.json();
    const rate = data?.rates?.BRL;
    if (typeof rate === "number" && isRateSane(rate)) return rate;
    console.warn("[FX] Frankfurter returned anomalous rate:", rate);
    return null;
  } catch (err) {
    console.warn("[FX] Frankfurter fetch failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function fetchFromExchangeRateApi(): Promise<number | null> {
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetchWithTimeout(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/USD/BRL`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const rate = data?.conversion_rate;
    if (typeof rate === "number" && isRateSane(rate)) return rate;
    console.warn("[FX] ExchangeRate API returned anomalous rate:", rate);
    return null;
  } catch (err) {
    console.warn("[FX] ExchangeRate API fetch failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Get the current USD→BRL exchange rate.
 * Returns the rate (BRL per 1 USD) or null if unavailable.
 */
export async function getUsdBrlRate(): Promise<number | null> {
  // Return cached value if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return cache.rate;
  }

  // Try primary source
  let rate = await fetchFromFrankfurter();

  // Try fallback source
  if (rate == null) {
    rate = await fetchFromExchangeRateApi();
  }

  if (rate != null) {
    cache = { rate, fetchedAt: Date.now() };
    return rate;
  }

  // Stale-while-revalidate: use stale cache if within max staleness
  if (cache && Date.now() - cache.fetchedAt < MAX_STALENESS) {
    console.warn("[FX] Using stale cached rate:", cache.rate);
    return cache.rate;
  }

  // Emergency fallback — only when both APIs fail AND no cached value
  console.error("[FX] All sources failed, no cache available. Using emergency fallback:", FALLBACK_RATE);
  return FALLBACK_RATE;
}
