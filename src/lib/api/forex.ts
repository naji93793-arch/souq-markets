// src/lib/api/forex.ts
// Fetches FX rates — especially pairs involving EGP

import axios from 'axios';
import type { ForexRate } from '@/types';

const EXCHANGERATE_BASE = 'https://v6.exchangerate-api.com/v6';

// Pairs to track: all quoted in EGP
const TRACKED_PAIRS = [
  { base: 'USD', quote: 'EGP' },
  { base: 'EUR', quote: 'EGP' },
  { base: 'GBP', quote: 'EGP' },
  { base: 'SAR', quote: 'EGP' },  // Saudi Riyal
  { base: 'AED', quote: 'EGP' },  // UAE Dirham
  { base: 'KWD', quote: 'EGP' },  // Kuwaiti Dinar
  { base: 'EUR', quote: 'USD' },
  { base: 'GBP', quote: 'USD' },
] as const;

export async function fetchForexRates(): Promise<ForexRate[]> {
  const key = process.env.EXCHANGERATE_API_KEY;

  if (!key) {
    return getDemoForexRates();
  }

  try {
    // Fetch all rates based on USD first (most efficient: 1 API call)
    const res = await axios.get(`${EXCHANGERATE_BASE}/${key}/latest/USD`, {
      timeout: 8000,
    });

    const rates: Record<string, number> = res.data.conversion_rates ?? {};

    return TRACKED_PAIRS.map(({ base, quote }): ForexRate => {
      // Convert: base → USD → quote
      const baseToUSD = base === 'USD' ? 1 : 1 / (rates[base] ?? 1);
      const usdToQuote = rates[quote] ?? 1;
      const rate = baseToUSD * usdToQuote;

      return {
        pair: `${base}/${quote}`,
        base,
        quote,
        rate: round(rate, 4),
        change24h: 0, // ExchangeRate-API free tier doesn't give history
      };
    });
  } catch (error) {
    console.error('[Forex API] Fetch failed:', error);
    return getDemoForexRates();
  }
}

// ─── Demo fallback ────────────────────────────────────────────────────────────
function getDemoForexRates(): ForexRate[] {
  return [
    { pair: 'USD/EGP', base: 'USD', quote: 'EGP', rate: 48.55, change24h: 0.12 },
    { pair: 'EUR/EGP', base: 'EUR', quote: 'EGP', rate: 52.30, change24h: -0.08 },
    { pair: 'GBP/EGP', base: 'GBP', quote: 'EGP', rate: 61.90, change24h: 0.22 },
    { pair: 'SAR/EGP', base: 'SAR', quote: 'EGP', rate: 12.94, change24h: 0.05 },
    { pair: 'AED/EGP', base: 'AED', quote: 'EGP', rate: 13.22, change24h: 0.03 },
    { pair: 'KWD/EGP', base: 'KWD', quote: 'EGP', rate: 158.0, change24h: 0.15 },
    { pair: 'EUR/USD', base: 'EUR', quote: 'USD', rate: 1.0780, change24h: -0.10 },
    { pair: 'GBP/USD', base: 'GBP', quote: 'USD', rate: 1.2750, change24h: 0.20 },
  ];
}

function round(n: number, decimals: number = 2): number {
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
