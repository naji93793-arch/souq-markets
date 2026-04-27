'use client';
// src/components/cards/MetalsSection.tsx

import { useState, useEffect } from 'react';
import { useAppStore, useT } from '@/store';
import { PriceChange } from '@/components/ui/PriceChange';
import { formatCurrency } from '@/lib/utils/auth';
import type { MetalPrice } from '@/types';
import { cn } from '@/lib/utils/cn';

const METAL_CONFIG = {
  gold: { label: 'Gold', labelAr: 'ذهب', color: 'amber', emoji: '🥇', bgClass: 'from-amber-950/40 to-amber-900/10 border-amber-500/20' },
  silver: { label: 'Silver', labelAr: 'فضة', color: 'slate', emoji: '🥈', bgClass: 'from-slate-800/60 to-slate-700/10 border-slate-500/20' },
  platinum: { label: 'Platinum', labelAr: 'بلاتين', color: 'blue', emoji: '💠', bgClass: 'from-blue-950/40 to-blue-900/10 border-blue-500/20' },
} as const;

const KARAT_MULTIPLIERS: Record<number, number> = {
  24: 1,
  22: 22 / 24,
  21: 21 / 24,
  18: 18 / 24,
  14: 14 / 24,
};

export function MetalsSection() {
  const { currency, locale } = useAppStore();
  const t = useT();
  const [metals, setMetals] = useState<MetalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'gold' | 'silver'>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/prices?currency=${currency}`);
        const json = await res.json();
        if (json.success) setMetals(json.data);
        else setError(json.error);
      } catch {
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currency]);

  const filtered = activeTab === 'all'
    ? metals
    : metals.filter(m => m.metal === activeTab);

  return (
    <section id="metals" className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {locale === 'ar' ? 'أسعار المعادن' : 'Metal Prices'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {locale === 'ar' ? `بالجنيه المصري اليوم` : `Live prices in ${currency}`}
          </p>
        </div>
        {/* Tab filter */}
        <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
          {(['all', 'gold', 'silver'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'rounded px-3 py-1.5 text-xs font-medium transition-all',
                activeTab === tab
                  ? 'bg-white/15 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              {tab === 'all'
                ? (locale === 'ar' ? 'الكل' : 'All')
                : locale === 'ar'
                ? METAL_CONFIG[tab].labelAr
                : METAL_CONFIG[tab].label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-500/20 bg-red-950/30 p-6 text-center text-red-400">
          {t('error')}
        </div>
      )}

      {/* Metal cards */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(metal => (
            <MetalCard key={metal.metal} metal={metal} currency={currency} locale={locale} />
          ))}
        </div>
      )}

      {/* Gold karat table */}
      {!loading && !error && (activeTab === 'all' || activeTab === 'gold') && (
        <GoldKaratTable
          goldPricePerGram={metals.find(m => m.metal === 'gold')?.pricePerGram ?? 0}
          currency={currency}
          locale={locale}
        />
      )}
    </section>
  );
}

// ─── Single metal card ────────────────────────────────────────────────────────
function MetalCard({
  metal,
  currency,
  locale,
}: {
  metal: MetalPrice;
  currency: 'EGP' | 'USD';
  locale: string;
}) {
  const config = METAL_CONFIG[metal.metal];
  const label = locale === 'ar' ? config.labelAr : config.label;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-transform hover:-translate-y-0.5',
        config.bgClass
      )}
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl" />

      <div className="mb-4 flex items-start justify-between">
        <div>
          <span className="text-2xl">{config.emoji}</span>
          <h3 className="mt-2 text-lg font-semibold text-white">{label}</h3>
          <p className="text-xs text-gray-500">24K / {currency}</p>
        </div>
        <PriceChange value={metal.change24h} size="sm" />
      </div>

      {/* Price rows */}
      <div className="space-y-3">
        <PriceRow
          label={locale === 'ar' ? 'لكل جرام' : 'Per gram'}
          value={formatCurrency(metal.pricePerGram, currency, locale as 'en' | 'ar')}
          primary
        />
        <PriceRow
          label={locale === 'ar' ? 'لكل أوقية' : 'Per ounce'}
          value={formatCurrency(metal.pricePerOunce, currency, locale as 'en' | 'ar')}
        />
        <PriceRow
          label={locale === 'ar' ? 'لكل كيلو' : 'Per kilo'}
          value={formatCurrency(metal.pricePerKilo, currency, locale as 'en' | 'ar')}
        />
      </div>
    </div>
  );
}

function PriceRow({
  label,
  value,
  primary = false,
}: {
  label: string;
  value: string;
  primary?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={cn('font-mono font-semibold', primary ? 'text-base text-white' : 'text-sm text-gray-300')}>
        {value}
      </span>
    </div>
  );
}

// ─── Gold karat price table ───────────────────────────────────────────────────
function GoldKaratTable({
  goldPricePerGram,
  currency,
  locale,
}: {
  goldPricePerGram: number;
  currency: string;
  locale: string;
}) {
  if (!goldPricePerGram) return null;

  const karats = [24, 22, 21, 18, 14];
  const title = locale === 'ar' ? 'أسعار الذهب حسب العيار' : 'Gold by Karat';
  const gramLabel = locale === 'ar' ? 'لكل جرام' : 'Per Gram';

  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
      <h3 className="mb-4 font-semibold text-white">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8">
              <th className="pb-3 text-start text-xs font-medium text-gray-500">
                {locale === 'ar' ? 'العيار' : 'Karat'}
              </th>
              <th className="pb-3 text-end text-xs font-medium text-gray-500">{gramLabel}</th>
              <th className="pb-3 text-end text-xs font-medium text-gray-500">
                {locale === 'ar' ? 'لكل أوقية' : 'Per Oz'}
              </th>
            </tr>
          </thead>
          <tbody>
            {karats.map(karat => {
              const mult = KARAT_MULTIPLIERS[karat];
              const priceGram = goldPricePerGram * mult;
              const priceOz = priceGram * 31.1035;
              return (
                <tr key={karat} className="border-b border-white/5 last:border-0">
                  <td className="py-3 font-medium text-amber-400">{karat}K</td>
                  <td className="py-3 text-end font-mono text-gray-200">
                    {priceGram.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3 text-end font-mono text-gray-400">
                    {priceOz.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
