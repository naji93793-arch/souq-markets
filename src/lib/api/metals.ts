// src/lib/api/metals.ts
// Fetches gold, silver, platinum prices from GoldAPI.io
// Converts to EGP using live FX rates

import axios from 'axios';
import type { MetalPrice } from '@/types';

const GOLDAPI_BASE = 'https://www.goldapi.io/api';
const GOLDAPI_KEY = process.env.GOLDAPI_KEY ?? '';

// Fallback demo data when no API key is set (for local dev / demos)
const DEMO_PRICES: Record<string, { usd_per_oz: number }> = {
  gold:     { usd_per_oz: 2350.50 },
  silver:   { usd_per_oz: 29.80 },
  platinum: { usd_per_oz: 1010.00 },
};

const TROY_OZ_TO_GRAM = 31.1035;
const TROY_OZ_TO_KILO = 32.1507;

/**
 * Fetch a single metal price from GoldAPI in the given currency.
 * Returns price per gram, per troy oz, and per kilo.
 */
export async function fetchMetalFromAPI(
  metal: 'XAU' | 'XAG' | 'XPT',  // gold | silver | platinum
  currency: 'USD' | 'EGP' = 'USD'
): Promise<{ pricePerGram: number; pricePerOunce: number; pricePerKilo: number; change24h: number } | null> {
  if (!GOLDAPI_KEY) {
    // Return demo data for development without API key
    const metalKey = metal === 'XAU' ? 'gold' : metal === 'XAG' ? 'silver' : 'platinum';
    const demo = DEMO_PRICES[metalKey];
    const pricePerOunce = demo.usd_per_oz;
    return {
      pricePerOunce,
      pricePerGram: pricePerOunce / TROY_OZ_TO_GRAM,
      pricePerKilo: pricePerOunce * TROY_OZ_TO_KILO / 1000,
      change24h: (Math.random() - 0.5) * 2, // random ±1% for demo
    };
  }

  try {
    const response = await axios.get(`${GOLDAPI_BASE}/${metal}/${currency}`, {
      headers: {
        'x-access-token': GOLDAPI_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 8000,
    });

    const data = response.data;
    const pricePerOunce: number = data.price ?? data.ask ?? 0;

    return {
      pricePerOunce,
      pricePerGram: pricePerOunce / TROY_OZ_TO_GRAM,
      pricePerKilo: pricePerOunce * TROY_OZ_TO_KILO / 1000,
      change24h: data.ch ?? data.price_change_24h ?? 0,
    };
  } catch (error) {
    console.error(`[Metals API] Failed to fetch ${metal}/${currency}:`, error);
    return null;
  }
}

/**
 * Fetch current USD/EGP rate from ExchangeRate-API
 */
export async function fetchUSDtoEGP(): Promise<number> {
  const key = process.env.EXCHANGERATE_API_KEY;
  if (!key) return 48.5; // fallback demo rate

  try {
    const res = await axios.get(
      `https://v6.exchangerate-api.com/v6/${key}/latest/USD`,
      { timeout: 5000 }
    );
    return res.data?.conversion_rates?.EGP ?? 48.5;
  } catch {
    return 48.5;
  }
}

/**
 * Fetch ALL metals in both USD and EGP, return ready-for-DB array
 */
export async function fetchAllMetalPrices(): Promise<MetalPrice[]> {
  const usdToEgp = await fetchUSDtoEGP();
  
  const metals: Array<{ symbol: 'XAU' | 'XAG' | 'XPT'; key: 'gold' | 'silver' | 'platinum' }> = [
    { symbol: 'XAU', key: 'gold' },
    { symbol: 'XAG', key: 'silver' },
    { symbol: 'XPT', key: 'platinum' },
  ];

  const results: MetalPrice[] = [];

  for (const { symbol, key } of metals) {
    const usdPrices = await fetchMetalFromAPI(symbol, 'USD');
    if (!usdPrices) continue;

    // USD record
    results.push({
      metal: key,
      currency: 'USD',
      pricePerGram: round(usdPrices.pricePerGram),
      pricePerOunce: round(usdPrices.pricePerOunce),
      pricePerKilo: round(usdPrices.pricePerKilo),
      change24h: round(usdPrices.change24h, 4),
      change7d: 0,
      source: 'goldapi',
    });

    // EGP record (converted)
    results.push({
      metal: key,
      currency: 'EGP',
      pricePerGram: round(usdPrices.pricePerGram * usdToEgp),
      pricePerOunce: round(usdPrices.pricePerOunce * usdToEgp),
      pricePerKilo: round(usdPrices.pricePerKilo * usdToEgp),
      change24h: round(usdPrices.change24h, 4),
      change7d: 0,
      source: 'goldapi+fx',
    });
  }

  return results;
}

// Helper: round to N decimal places
function round(n: number, decimals: number = 2): number {
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
