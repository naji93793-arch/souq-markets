'use client';
// src/components/layout/MarketTicker.tsx
// Scrolling ticker bar showing live price changes

import { useEffect, useState } from 'react';
import { PriceChange } from '@/components/ui/PriceChange';
import { useAppStore } from '@/store';

interface TickerEntry {
  symbol: string;
  price: string;
  change: number;
}

export function MarketTicker() {
  const { currency } = useAppStore();
  const [entries, setEntries] = useState<TickerEntry[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [metalsRes, cryptoRes] = await Promise.all([
          fetch(`/api/prices?currency=${currency}`).then(r => r.json()),
          fetch('/api/crypto').then(r => r.json()),
        ]);

        const items: TickerEntry[] = [];
        const sym = currency === 'EGP' ? '£' : '$';

        (metalsRes.data ?? []).forEach((m: any) => {
          items.push({
            symbol: m.metal === 'gold' ? '🥇 XAU' : m.metal === 'silver' ? '🥈 XAG' : '💠 XPT',
            price: `${sym}${m.pricePerGram.toFixed(2)}/g`,
            change: m.change24h,
          });
        });

        (cryptoRes.data ?? []).slice(0, 6).forEach((c: any) => {
          const p = currency === 'EGP' ? c.priceEGP : c.priceUSD;
          items.push({
            symbol: c.symbol,
            price: `${sym}${p >= 1000 ? p.toLocaleString('en-US', { maximumFractionDigits: 0 }) : p.toFixed(2)}`,
            change: c.change24h,
          });
        });

        setEntries(items);
      } catch {
        // silent fail — ticker is decorative
      }
    }
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currency]);

  if (entries.length === 0) return null;

  // Duplicate for seamless loop
  const doubled = [...entries, ...entries];

  return (
    <div className="overflow-hidden border-b border-white/5 bg-white/2 py-2">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{
          animation: 'ticker 40s linear infinite',
          width: 'max-content',
        }}
      >
        {doubled.map((entry, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-xs">
            <span className="font-medium text-gray-300">{entry.symbol}</span>
            <span className="font-mono text-white">{entry.price}</span>
            <PriceChange value={entry.change} size="sm" showIcon={false} />
            <span className="text-white/10">|</span>
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
