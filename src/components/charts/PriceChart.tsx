'use client';
// src/components/charts/PriceChart.tsx
// Interactive line chart for price history with time range selector

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils/cn';
import type { PriceHistoryPoint, TimeRange } from '@/types';
import { format, parseISO } from 'date-fns';

const TIME_RANGES: { label: string; labelAr: string; value: TimeRange }[] = [
  { label: '1D', labelAr: '١ي',  value: '1D' },
  { label: '1W', labelAr: '١أ',  value: '1W' },
  { label: '1M', labelAr: '١ش',  value: '1M' },
  { label: '3M', labelAr: '٣ش',  value: '3M' },
  { label: '1Y', labelAr: '١س',  value: '1Y' },
];

const ASSETS = [
  { id: 'gold',    label: 'Gold',    labelAr: 'ذهب',   type: 'metal',  color: '#F59E0B' },
  { id: 'silver',  label: 'Silver',  labelAr: 'فضة',   type: 'metal',  color: '#94A3B8' },
  { id: 'bitcoin', label: 'Bitcoin', labelAr: 'بيتكوين', type: 'crypto', color: '#F97316' },
  { id: 'ethereum',label: 'Ethereum',labelAr: 'إيثيريوم', type: 'crypto', color: '#8B5CF6' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  currency: string;
}

function CustomTooltip({ active, payload, label, currency }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const value = payload[0].value;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'EGP' ? 'EGP' : 'USD',
    minimumFractionDigits: value > 100 ? 0 : 2,
    maximumFractionDigits: value > 100 ? 0 : 2,
  }).format(value);

  return (
    <div className="rounded-lg border border-white/15 bg-gray-900/95 px-3 py-2 shadow-xl backdrop-blur">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-bold text-white">{formatted}</p>
    </div>
  );
}

export function PriceChart() {
  const { currency, locale, chartRange, setChartRange, selectedAsset, setSelectedAsset } = useAppStore();
  const [data, setData] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const currentAsset = ASSETS.find(a => a.id === selectedAsset) ?? ASSETS[0];

  // Format date labels based on range
  const formatDate = (dateStr: string): string => {
    try {
      const d = parseISO(dateStr);
      if (chartRange === '1D') return format(d, 'HH:mm');
      if (chartRange === '1W') return format(d, 'EEE');
      if (chartRange === '1M') return format(d, 'MMM d');
      return format(d, 'MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/history?asset=${currentAsset.id}&type=${currentAsset.type}&range=${chartRange}&currency=${currency}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, [currentAsset.id, currentAsset.type, chartRange, currency]);

  // Calculate price change over period
  const priceChange = data.length > 1
    ? ((data[data.length - 1].price - data[0].price) / data[0].price) * 100
    : 0;
  const isPositive = priceChange >= 0;

  const chartData = data.map(d => ({
    ...d,
    date: formatDate(d.date),
  }));

  return (
    <section id="charts" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">
          {locale === 'ar' ? 'الرسوم البيانية' : 'Price Charts'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {locale === 'ar' ? 'تتبع حركة الأسعار عبر الزمن' : 'Track price movements over time'}
        </p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
        {/* Asset selector */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {ASSETS.map(asset => (
              <button
                key={asset.id}
                onClick={() => setSelectedAsset(asset.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all',
                  selectedAsset === asset.id
                    ? 'border-transparent text-gray-950'
                    : 'border-white/10 bg-transparent text-gray-400 hover:border-white/20 hover:text-white'
                )}
                style={selectedAsset === asset.id ? { backgroundColor: asset.color } : {}}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: selectedAsset === asset.id ? '#1a1a1a' : asset.color }}
                />
                {locale === 'ar' ? asset.labelAr : asset.label}
              </button>
            ))}
          </div>

          {/* Time range selector */}
          <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
            {TIME_RANGES.map(({ label, labelAr, value }) => (
              <button
                key={value}
                onClick={() => setChartRange(value)}
                className={cn(
                  'rounded px-3 py-1.5 text-xs font-medium transition-all',
                  chartRange === value
                    ? 'bg-white/15 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                )}
              >
                {locale === 'ar' ? labelAr : label}
              </button>
            ))}
          </div>
        </div>

        {/* Current price + change summary */}
        {data.length > 0 && (
          <div className="mb-6 flex items-end gap-3">
            <span className="font-mono text-3xl font-bold text-white">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency === 'EGP' ? 'EGP' : 'USD',
                minimumFractionDigits: 0,
              }).format(data[data.length - 1].price)}
            </span>
            <span
              className={cn(
                'mb-1 rounded px-2 py-0.5 text-sm font-medium',
                isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
              )}
            >
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              <span className="ms-1 text-xs opacity-70">
                {locale === 'ar' ? 'خلال الفترة' : 'this period'}
              </span>
            </span>
          </div>
        )}

        {/* Chart */}
        <div className="h-64 w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentAsset.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={currentAsset.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => {
                    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
                    return v.toFixed(v < 10 ? 2 : 0);
                  }}
                  width={55}
                />
                <Tooltip
                  content={<CustomTooltip currency={currency} />}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={currentAsset.color}
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: currentAsset.color, stroke: '#111827', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
