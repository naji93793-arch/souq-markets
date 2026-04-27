'use client';
// src/components/cards/HeroTicker.tsx
// Top-of-page live ticker showing key prices at a glance

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import { PriceChange } from '@/components/ui/PriceChange';
import { RefreshCw } from 'lucide-react';

interface TickerItem {
  label: string;
  labelAr: string;
  value: string;
  change: number;
  color: string;
}

export function HeroTicker() {
  const { currency, locale, setLastRefresh } = useAppStore();
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (forceRefresh = false) => {
    forceRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [metalsRes, cryptoRes, forexRes] = await Promise.all([
        fetch(`/api/prices?currency=${currency}${forceRefresh ? '&refresh=1' : ''}`).then(r => r.json()),
        fetch('/api/crypto').then(r => r.json()),
        fetch('/api/forex').then(r => r.json()),
      ]);

      const result: TickerItem[] = [];
      const sym = currency === 'EGP' ? 'EGP' : '$';

      // Gold price
      const gold = metalsRes.data?.find((m: { metal: string }) => m.metal === 'gold');
      if (gold) {
        result.push({
          label: 'Gold / gram',
          labelAr: 'ذهب / جرام',
          value: `${sym} ${gold.pricePerGram.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: gold.change24h,
          color: '#F59E0B',
        });
      }

      // Silver price
      const silver = metalsRes.data?.find((m: { metal: string }) => m.metal === 'silver');
      if (silver) {
        result.push({
          label: 'Silver / gram',
          labelAr: 'فضة / جرام',
          value: `${sym} ${silver.pricePerGram.toFixed(2)}`,
          change: silver.change24h,
          color: '#94A3B8',
        });
      }

      // Bitcoin
      const btc = cryptoRes.data?.find((c: { symbol: string }) => c.symbol === 'BTC');
      if (btc) {
        const btcPrice = currency === 'EGP' ? btc.priceEGP : btc.priceUSD;
        result.push({
          label: 'Bitcoin',
          labelAr: 'بيتكوين',
          value: `${sym} ${btcPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
          change: btc.change24h,
          color: '#F97316',
        });
      }

      // Ethereum
      const eth = cryptoRes.data?.find((c: { symbol: string }) => c.symbol === 'ETH');
      if (eth) {
        const ethPrice = currency === 'EGP' ? eth.priceEGP : eth.priceUSD;
        result.push({
          label: 'Ethereum',
          labelAr: 'إيثيريوم',
          value: `${sym} ${ethPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
          change: eth.change24h,
          color: '#8B5CF6',
        });
      }

      // USD/EGP
      const usdegp = forexRes.data?.find((r: { pair: string }) => r.pair === 'USD/EGP');
      if (usdegp) {
        result.push({
          label: 'USD / EGP',
          labelAr: 'دولار / جنيه',
          value: usdegp.rate.toFixed(2),
          change: usdegp.change24h,
          color: '#10B981',
        });
      }

      setItems(result);
      setLastRefresh(Date.now());
    } catch (err) {
      console.error('[HeroTicker] load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currency, setLastRefresh]);

  // Initial load + auto-refresh every 5 minutes
  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="mb-10 space-y-4">
      {/* Hero headline */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {locale === 'ar' ? (
            <>أسعار <span className="text-amber-400">الذهب</span> والأسواق</>
          ) : (
            <>Live <span className="text-amber-400">Market</span> Prices</>
          )}
        </h1>
        <p className="mt-3 text-gray-400">
          {locale === 'ar'
            ? 'الذهب، الفضة، العملات المشفرة وأسعار الصرف في مصر'
            : 'Gold, Silver, Crypto & FX rates for Egypt — updated every 5 minutes'}
        </p>
      </div>

      {/* Ticker cards grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {loading
          ? [...Array(5)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
            ))
          : items.map(item => (
              <div
                key={item.label}
                className="group relative overflow-hidden rounded-xl border border-white/8 bg-white/4 px-4 py-3 transition-all hover:border-white/15 hover:bg-white/7"
              >
                {/* Accent bar */}
                <div
                  className="absolute inset-x-0 top-0 h-0.5 opacity-60 transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: item.color }}
                />
                <div className="text-xs text-gray-500">
                  {locale === 'ar' ? item.labelAr : item.label}
                </div>
                <div className="mt-1 font-mono text-base font-bold text-white sm:text-lg">
                  {item.value}
                </div>
                <div className="mt-1">
                  <PriceChange value={item.change} size="sm" />
                </div>
              </div>
            ))}

        {/* Refresh button */}
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex flex-col items-center justify-center rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-gray-500 transition-all hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-400 disabled:opacity-50"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          <span className="mt-1 text-xs">
            {locale === 'ar' ? 'تحديث' : 'Refresh'}
          </span>
        </button>
      </div>
    </div>
  );
}
