'use client';
// src/components/cards/CryptoSection.tsx

import { useState, useEffect } from 'react';
import { useAppStore, useT } from '@/store';
import { PriceChange } from '@/components/ui/PriceChange';
import { formatLargeNumber } from '@/lib/utils/auth';
import type { CryptoPrice } from '@/types';
import Image from 'next/image';

export function CryptoSection() {
  const { currency, locale } = useAppStore();
  const t = useT();
  const [coins, setCoins] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/crypto')
      .then(r => r.json())
      .then(json => { if (json.success) setCoins(json.data); })
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (priceUSD: number, priceEGP: number) => {
    const val = currency === 'EGP' ? priceEGP : priceUSD;
    const sym = currency === 'EGP' ? 'EGP' : '$';
    if (val >= 1000) return `${sym} ${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (val >= 1) return `${sym} ${val.toFixed(2)}`;
    return `${sym} ${val.toFixed(6)}`;
  };

  return (
    <section id="crypto" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">
          {locale === 'ar' ? 'العملات المشفرة' : 'Crypto Prices'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {locale === 'ar' ? 'أسعار العملات المشفرة مقارنةً بالجنيه والدولار' : 'Top cryptocurrencies vs USD & EGP'}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
        {loading ? (
          <div className="space-y-px p-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
                  {locale === 'ar' ? 'العملة' : 'Asset'}
                </th>
                <th className="px-4 py-4 text-end text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('priceUSD')}
                </th>
                <th className="px-4 py-4 text-end text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('change24h')}
                </th>
                <th className="hidden px-4 py-4 text-end text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell">
                  {t('change7d')}
                </th>
                <th className="hidden px-6 py-4 text-end text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell">
                  {t('marketCap')}
                </th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin, i) => (
                <tr
                  key={coin.symbol}
                  className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/4"
                >
                  {/* Rank + Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-xs text-gray-600">{i + 1}</span>
                      {coin.imageUrl ? (
                        <img
                          src={coin.imageUrl}
                          alt={coin.name}
                          className="h-7 w-7 rounded-full"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400">
                          {coin.symbol[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-white">{coin.symbol}</div>
                        <div className="text-xs text-gray-500">{coin.name}</div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-4 text-end">
                    <span className="font-mono text-sm font-medium text-white">
                      {formatPrice(coin.priceUSD, coin.priceEGP)}
                    </span>
                    {currency === 'USD' && coin.priceEGP > 0 && (
                      <div className="text-xs text-gray-500">
                        EGP {coin.priceEGP.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                    )}
                  </td>

                  {/* 24h change */}
                  <td className="px-4 py-4 text-end">
                    <PriceChange value={coin.change24h} size="sm" />
                  </td>

                  {/* 7d change */}
                  <td className="hidden px-4 py-4 text-end sm:table-cell">
                    <PriceChange value={coin.change7d} size="sm" />
                  </td>

                  {/* Market cap */}
                  <td className="hidden px-6 py-4 text-end lg:table-cell">
                    <span className="text-sm text-gray-400">{formatLargeNumber(coin.marketCapUSD)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
