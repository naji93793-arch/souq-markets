'use client';
// src/components/cards/ForexSection.tsx

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { PriceChange } from '@/components/ui/PriceChange';
import type { ForexRate } from '@/types';

export function ForexSection() {
  const { locale } = useAppStore();
  const [rates, setRates] = useState<ForexRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forex')
      .then(r => r.json())
      .then(json => { if (json.success) setRates(json.data); })
      .finally(() => setLoading(false));
  }, []);

  const FLAG_MAP: Record<string, string> = {
    USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧',
    EGP: '🇪🇬', SAR: '🇸🇦', AED: '🇦🇪', KWD: '🇰🇼',
  };

  return (
    <section id="forex" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">
          {locale === 'ar' ? 'أسعار الصرف' : 'Exchange Rates'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {locale === 'ar' ? 'أسعار العملات الأجنبية مقابل الجنيه المصري' : 'Foreign currencies vs Egyptian Pound'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [...Array(8)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
            ))
          : rates.map(rate => (
              <ForexCard key={rate.pair} rate={rate} flagMap={FLAG_MAP} locale={locale} />
            ))}
      </div>
    </section>
  );
}

function ForexCard({
  rate,
  flagMap,
  locale,
}: {
  rate: ForexRate;
  flagMap: Record<string, string>;
  locale: string;
}) {
  const flag = flagMap[rate.base] ?? '🏳';
  const isEGPQuote = rate.quote === 'EGP';

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-4 transition-all hover:border-white/15 hover:bg-white/6">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">{flag}</span>
        <div>
          <span className="text-sm font-semibold text-white">{rate.base}</span>
          <span className="mx-1 text-gray-600">/</span>
          <span className="text-sm text-gray-400">{rate.quote}</span>
        </div>
        <div className="ms-auto">
          <PriceChange value={rate.change24h} size="sm" showIcon={false} />
        </div>
      </div>
      <div className="font-mono text-xl font-bold text-white">
        {rate.rate.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', {
          minimumFractionDigits: isEGPQuote ? 2 : 4,
          maximumFractionDigits: isEGPQuote ? 2 : 4,
        })}
      </div>
      <div className="mt-1 text-xs text-gray-600">
        1 {rate.base} = {rate.rate.toFixed(isEGPQuote ? 2 : 4)} {rate.quote}
      </div>
    </div>
  );
}
