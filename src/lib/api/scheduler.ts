// src/lib/api/scheduler.ts
// Cron job that refreshes prices on a schedule and saves to DB
// Run via: import this file in your server startup or API route

import { fetchAllMetalPrices } from './metals';
import { fetchCryptoPrices } from './crypto';
import { fetchForexRates } from './forex';
import prisma from '../db/prisma';
import { cacheSet, cacheDel, CacheKeys } from '../cache/redis';

/**
 * Refresh all prices: fetch from APIs → save to DB → invalidate cache
 */
export async function refreshAllPrices(): Promise<{
  metals: number;
  crypto: number;
  forex: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let metalsSaved = 0;
  let cryptoSaved = 0;
  let forexSaved = 0;

  console.log('[Scheduler] Starting price refresh at', new Date().toISOString());

  // ── Metals ───────────────────────────────────────────────────────────────
  try {
    const metals = await fetchAllMetalPrices();
    for (const m of metals) {
      await prisma.metalPrice.create({ data: m });
    }
    metalsSaved = metals.length;

    // Update cache
    const egpMetals = metals.filter(m => m.currency === 'EGP');
    const usdMetals = metals.filter(m => m.currency === 'USD');
    await cacheSet(CacheKeys.metals('EGP'), egpMetals, 300);
    await cacheSet(CacheKeys.metals('USD'), usdMetals, 300);
    console.log(`[Scheduler] Saved ${metalsSaved} metal prices`);
  } catch (err) {
    const msg = `Metals refresh failed: ${(err as Error).message}`;
    errors.push(msg);
    console.error('[Scheduler]', msg);
  }

  // ── Crypto ───────────────────────────────────────────────────────────────
  try {
    const cryptos = await fetchCryptoPrices();
    for (const c of cryptos) {
      await prisma.cryptoPrice.create({ data: c });
    }
    cryptoSaved = cryptos.length;
    await cacheSet(CacheKeys.crypto(), cryptos, 300);
    console.log(`[Scheduler] Saved ${cryptoSaved} crypto prices`);
  } catch (err) {
    const msg = `Crypto refresh failed: ${(err as Error).message}`;
    errors.push(msg);
    console.error('[Scheduler]', msg);
  }

  // ── Forex ────────────────────────────────────────────────────────────────
  try {
    const forexRates = await fetchForexRates();
    for (const r of forexRates) {
      await prisma.forexRate.create({ data: r });
    }
    forexSaved = forexRates.length;
    await cacheSet(CacheKeys.forex(), forexRates, 300);
    console.log(`[Scheduler] Saved ${forexSaved} forex rates`);
  } catch (err) {
    const msg = `Forex refresh failed: ${(err as Error).message}`;
    errors.push(msg);
    console.error('[Scheduler]', msg);
  }

  // Invalidate dashboard summary cache so it's rebuilt on next request
  await cacheDel(CacheKeys.dashboard());

  return { metals: metalsSaved, crypto: cryptoSaved, forex: forexSaved, errors };
}

/**
 * Get the latest saved prices from the database (most recent record per asset).
 */
export async function getLatestPricesFromDB() {
  const [metals, crypto, forex] = await Promise.all([
    // Get most recent metal prices for each metal+currency combo
    prisma.$queryRaw`
      SELECT DISTINCT ON (metal, currency) *
      FROM "MetalPrice"
      ORDER BY metal, currency, "createdAt" DESC
    `,
    // Most recent crypto price per symbol
    prisma.$queryRaw`
      SELECT DISTINCT ON (symbol) *
      FROM "CryptoPrice"
      ORDER BY symbol, "createdAt" DESC
    `,
    // Most recent forex rate per pair
    prisma.$queryRaw`
      SELECT DISTINCT ON (pair) *
      FROM "ForexRate"
      ORDER BY pair, "createdAt" DESC
    `,
  ]);

  return { metals, crypto, forex };
}

/**
 * Prune old records — keep only last 90 days of history.
 * Call this daily to prevent unbounded DB growth.
 */
export async function pruneOldPrices(): Promise<void> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  const [metals, crypto, forex] = await Promise.all([
    prisma.metalPrice.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    prisma.cryptoPrice.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    prisma.forexRate.deleteMany({ where: { createdAt: { lt: cutoff } } }),
  ]);

  console.log(`[Scheduler] Pruned: ${metals.count} metals, ${crypto.count} crypto, ${forex.count} forex records`);
}
