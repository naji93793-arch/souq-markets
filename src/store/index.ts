// src/store/index.ts
// Global state with Zustand: locale, currency, theme preferences

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/i18n/translations';
import type { TimeRange } from '@/types';

interface AppState {
  // Locale / language
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Currency display
  currency: 'EGP' | 'USD';
  setCurrency: (currency: 'EGP' | 'USD') => void;

  // Price chart time range
  chartRange: TimeRange;
  setChartRange: (range: TimeRange) => void;

  // Selected asset for main chart
  selectedAsset: string;
  setSelectedAsset: (asset: string) => void;

  // Last refresh timestamp
  lastRefresh: number;
  setLastRefresh: (ts: number) => void;

  // Admin session
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),

      currency: 'EGP',
      setCurrency: (currency) => set({ currency }),

      chartRange: '1M',
      setChartRange: (chartRange) => set({ chartRange }),

      selectedAsset: 'gold',
      setSelectedAsset: (selectedAsset) => set({ selectedAsset }),

      lastRefresh: 0,
      setLastRefresh: (lastRefresh) => set({ lastRefresh }),

      adminToken: null,
      setAdminToken: (adminToken) => set({ adminToken }),
    }),
    {
      name: 'market-dashboard-store',
      // Only persist user preferences, not session tokens in localStorage
      partialize: (state) => ({
        locale: state.locale,
        currency: state.currency,
        chartRange: state.chartRange,
      }),
    }
  )
);

// Convenience hook for translation
import { translations } from '@/i18n/translations';

export function useT() {
  const locale = useAppStore((s) => s.locale);
  return (key: keyof typeof translations.en): string => {
    return translations[locale][key] ?? translations.en[key] ?? key;
  };
}
