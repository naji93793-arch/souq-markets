// src/types/index.ts
// Central type definitions for the market dashboard

// ─── Metal Prices ─────────────────────────────────────────────────────────────
export interface MetalPrice {
  id?: number;
  metal: 'gold' | 'silver' | 'platinum';
  currency: 'EGP' | 'USD';
  pricePerGram: number;
  pricePerOunce: number;
  pricePerKilo: number;
  change24h: number;
  change7d: number;
  source?: string;
  createdAt?: Date | string;
}

export interface MetalPriceDisplay extends MetalPrice {
  label: string;        // human-readable name (Arabic/English)
  labelAr: string;
  icon: string;         // emoji or icon code
  color: string;        // tailwind color class
}

// ─── Crypto ───────────────────────────────────────────────────────────────────
export interface CryptoPrice {
  id?: number;
  symbol: string;
  name: string;
  priceUSD: number;
  priceEGP: number;
  change24h: number;
  change7d: number;
  marketCapUSD: number;
  volume24hUSD: number;
  imageUrl?: string;
  createdAt?: Date | string;
}

// ─── Forex ────────────────────────────────────────────────────────────────────
export interface ForexRate {
  id?: number;
  pair: string;
  base: string;
  quote: string;
  rate: number;
  change24h: number;
  createdAt?: Date | string;
}

// ─── Chart data ───────────────────────────────────────────────────────────────
export interface PriceHistoryPoint {
  date: string;       // ISO date string
  price: number;
  volume?: number;
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y';

export interface ChartDataset {
  label: string;
  data: PriceHistoryPoint[];
  color: string;
}

// ─── Dashboard summary ───────────────────────────────────────────────────────
export interface DashboardSummary {
  metals: MetalPrice[];
  crypto: CryptoPrice[];
  forex: ForexRate[];
  lastUpdated: string;
}

// ─── API responses ───────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  timestamp?: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'superadmin' | 'editor';
}

export interface PriceOverride {
  assetType: 'metal' | 'crypto' | 'forex';
  assetId: string;
  field: string;
  value: number;
  note?: string;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
export interface PriceAlert {
  email: string;
  assetType: 'metal' | 'crypto' | 'forex';
  assetId: string;
  condition: 'above' | 'below';
  targetPrice: number;
}

// ─── i18n ─────────────────────────────────────────────────────────────────────
export type Locale = 'en' | 'ar';

export interface LocaleConfig {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  label: string;
}
