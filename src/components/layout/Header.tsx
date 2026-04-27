'use client';
// src/components/layout/Header.tsx

import { useTheme } from 'next-themes';
import { useAppStore, useT } from '@/store';
import { Sun, Moon, Globe, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, currency, setCurrency, lastRefresh } = useAppStore();
  const t = useT();

  const navItems = [
    { key: 'nav_metals', href: '#metals' },
    { key: 'nav_crypto', href: '#crypto' },
    { key: 'nav_forex', href: '#forex' },
    { key: 'nav_charts', href: '#charts' },
  ] as const;

  const lastUpdatedText = lastRefresh
    ? new Date(lastRefresh).toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                {locale === 'ar' ? 'سوق' : 'Souq'}
              </span>
              <span className="ms-1 text-lg font-light text-amber-400">Markets</span>
            </div>
          </div>

          {/* Nav links - desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                className="rounded-md px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/8 hover:text-white"
              >
                {t(key)}
              </a>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Last updated indicator */}
            {lastUpdatedText && (
              <span className="hidden text-xs text-gray-500 sm:block">
                {t('lastUpdated')}: {lastUpdatedText}
              </span>
            )}

            {/* Currency toggle */}
            <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
              {(['EGP', 'USD'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={cn(
                    'rounded px-2.5 py-1 text-xs font-medium transition-all',
                    currency === c
                      ? 'bg-amber-500 text-gray-950'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              title={t('language')}
            >
              <Globe size={15} />
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              title={theme === 'dark' ? t('lightMode') : t('darkMode')}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
