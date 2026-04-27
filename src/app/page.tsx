// src/app/page.tsx
import { Header } from '@/components/layout/Header';
import { MarketTicker } from '@/components/layout/MarketTicker';
import { HeroTicker } from '@/components/cards/HeroTicker';
import { MetalsSection } from '@/components/cards/MetalsSection';
import { CryptoSection } from '@/components/cards/CryptoSection';
import { ForexSection } from '@/components/cards/ForexSection';
import { PriceChart } from '@/components/charts/PriceChart';
import { AlertSubscription } from '@/components/cards/AlertSubscription';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      <MarketTicker />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <HeroTicker />

        <div className="space-y-16">
          <MetalsSection />
          <PriceChart />
          <CryptoSection />
          <ForexSection />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                <h3 className="font-semibold text-white mb-3">
                  📌 ملاحظة هامة | Important Note
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  الأسعار المعروضة هي أسعار السوق العالمي محوّلة إلى الجنيه المصري بسعر الصرف الرسمي.
                  قد تختلف أسعار محلات الصاغة عن الأسعار المعروضة بسبب هامش الربح وأجر الصنعة.
                </p>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Prices shown are global spot prices converted to EGP. Local jewelry shop prices
                  may vary due to markup and workmanship fees. Not financial advice.
                </p>
              </div>
            </div>
            <AlertSubscription />
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-white/8 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3 text-sm text-gray-600">
            <div>
              <div className="text-amber-400 font-semibold mb-2">سوق Markets</div>
              <p>Live gold, silver, crypto and FX prices for Egypt. Updated every 5 minutes.</p>
            </div>
            <div>
              <div className="text-gray-400 font-semibold mb-2">Data Sources</div>
              <ul className="space-y-1">
                <li>GoldAPI.io — metals</li>
                <li>CoinGecko — crypto</li>
                <li>ExchangeRate-API — forex</li>
              </ul>
            </div>
            <div>
              <div className="text-gray-400 font-semibold mb-2">Links</div>
              <ul className="space-y-1">
                <li><a href="#metals" className="hover:text-gray-400">Gold Prices</a></li>
                <li><a href="#crypto" className="hover:text-gray-400">Crypto Prices</a></li>
                <li><a href="/admin" className="hover:text-gray-400">Admin Panel</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-gray-700">
            © {new Date().getFullYear()} Souq Markets · Not financial advice · Prices for informational purposes only
          </div>
        </div>
      </footer>
    </div>
  );
}
