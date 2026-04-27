'use client';
// src/components/layout/Providers.tsx

import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { useAppStore } from '@/store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <LocaleApplier>{children}</LocaleApplier>
    </ThemeProvider>
  );
}

// Updates <html> lang and dir attributes based on store locale
function LocaleApplier({ children }: { children: React.ReactNode }) {
  const locale = useAppStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    // Apply the correct font family
    document.body.style.fontFamily = locale === 'ar'
      ? "'IBM Plex Sans Arabic', sans-serif"
      : "'Space Grotesk', sans-serif";
  }, [locale]);

  return <>{children}</>;
}
