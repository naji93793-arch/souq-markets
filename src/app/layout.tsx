// src/app/layout.tsx
import type { Metadata } from 'next';
import { Providers } from '@/components/layout/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Souq | أسعار الذهب والعملات',
    template: '%s | Souq Markets',
  },
  description:
    'Live gold, silver, cryptocurrency and foreign exchange prices in Egypt. Powered by real-time market data.',
  keywords: ['gold price egypt', 'سعر الذهب', 'أسعار الذهب اليوم', 'bitcoin price egp', 'usd to egp'],
  openGraph: {
    title: 'Souq Markets — Live Prices in Egypt',
    description: 'Gold, Silver, Crypto & FX rates updated in real-time',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `lang` and `dir` are updated client-side by LocaleProvider
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
