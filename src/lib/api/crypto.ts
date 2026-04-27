// src/lib/api/crypto.ts
// Fetches cryptocurrency prices from CoinGecko (free public API)
// No API key required for basic endpoints

import axios from 'axios';
import type { CryptoPrice } from '@/types';
import { fetchUSDtoEGP } from './metals';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// The coins we track (CoinGecko IDs)
export const TRACKED_COINS = [
  'bitcoin',
  'ethereum',
  'binancecoin',
  'tether',
  'solana',
  'ripple',
  'cardano',
  'dogecoin',
  'tron',
  'avalanche-2',
] as const;

export type CoinId = (typeof TRACKED_COINS)[number];

/**
 * Fetch prices for all tracked coins in USD.
 * CoinGecko free tier: 10-30 calls/min.
 */
export async function fetchCryptoPrices(): Promise<CryptoPrice[]> {
  const usdToEgp = await fetchUSDtoEGP();
  
  try {
    const ids = TRACKED_COINS.join(',');
    const response = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids,
        order: 'market_cap_desc',
        per_page: 20,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h,7d',
      },
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        ...(process.env.COINGECKO_API_KEY
          ? { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }
          : {}),
      },
    });

    return response.data.map((coin: CoinGeckoCoin): CryptoPrice => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      priceUSD: coin.current_price,
      priceEGP: round(coin.current_price * usdToEgp),
      change24h: round(coin.price_change_percentage_24h ?? 0, 4),
      change7d: round(coin.price_change_percentage_7d_in_currency ?? 0, 4),
      marketCapUSD: coin.market_cap ?? 0,
      volume24hUSD: coin.total_volume ?? 0,
      imageUrl: coin.image,
      source: 'coingecko',
    }));
  } catch (error) {
    console.error('[Crypto API] CoinGecko fetch failed:', error);
    // Return demo data so the dashboard still renders
    return getDemoCryptoPrices(usdToEgp);
  }
}

/**
 * Fetch price history for a single coin.
 * range: '1' | '7' | '30' | '90' | '365' (days)
 */
export async function fetchCryptoHistory(
  coinId: string,
  days: number = 30
): Promise<{ date: string; price: number }[]> {
  try {
    const response = await axios.get(
      `${COINGECKO_BASE}/coins/${coinId}/market_chart`,
      {
        params: { vs_currency: 'usd', days, interval: days <= 1 ? 'hourly' : 'daily' },
        timeout: 10000,
      }
    );

    return response.data.prices.map(([ts, price]: [number, number]) => ({
      date: new Date(ts).toISOString(),
      price: round(price),
    }));
  } catch (error) {
    console.error(`[Crypto API] History fetch failed for ${coinId}:`, error);
    return generateDemoHistory(30, 50000, 0.05);
  }
}

// ─── Internal types ───────────────────────────────────────────────────────────
interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
}

// ─── Demo fallback ────────────────────────────────────────────────────────────
function getDemoCryptoPrices(usdToEgp: number): CryptoPrice[] {
  const demoCoins = [
    { symbol: 'BTC', name: 'Bitcoin',  priceUSD: 67500, change24h: 1.2, change7d: -3.1, mcap: 1.33e12, vol: 28e9, img: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
    { symbol: 'ETH', name: 'Ethereum', priceUSD: 3600,  change24h: 0.8, change7d: -1.5, mcap: 4.3e11,  vol: 15e9, img: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    { symbol: 'BNB', name: 'BNB',      priceUSD: 590,   change24h: -0.3, change7d: 2.1, mcap: 8.5e10, vol: 1.5e9, img: '' },
    { symbol: 'SOL', name: 'Solana',   priceUSD: 165,   change24h: 2.1, change7d: 5.4, mcap: 7.2e10, vol: 3.1e9, img: '' },
    { symbol: 'XRP', name: 'XRP',      priceUSD: 0.53,  change24h: -1.1, change7d: -0.8, mcap: 2.9e10, vol: 1.2e9, img: '' },
  ];

  return demoCoins.map(c => ({
    symbol: c.symbol,
    name: c.name,
    priceUSD: c.priceUSD,
    priceEGP: round(c.priceUSD * usdToEgp),
    change24h: c.change24h,
    change7d: c.change7d,
    marketCapUSD: c.mcap,
    volume24hUSD: c.vol,
    imageUrl: c.img,
  }));
}

function generateDemoHistory(
  days: number,
  basePrice: number,
  volatility: number
): { date: string; price: number }[] {
  const points: { date: string; price: number }[] = [];
  let price = basePrice;
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    price = price * (1 + (Math.random() - 0.5) * volatility);
    points.push({ date: d.toISOString(), price: round(price) });
  }
  return points;
}

function round(n: number, decimals: number = 2): number {
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
