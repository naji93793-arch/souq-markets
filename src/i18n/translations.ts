// src/i18n/translations.ts
// English and Arabic translations for the full dashboard

export type TranslationKey = keyof typeof en;

export const en = {
  // Nav
  appName: 'Souq Markets',
  tagline: 'Egypt\'s live gold, silver & crypto tracker',
  nav_dashboard: 'Dashboard',
  nav_metals: 'Metals',
  nav_crypto: 'Crypto',
  nav_forex: 'Forex',
  nav_charts: 'Charts',
  nav_admin: 'Admin',

  // Dashboard
  lastUpdated: 'Last updated',
  refresh: 'Refresh',
  loading: 'Loading...',
  error: 'Failed to load data',
  retry: 'Retry',

  // Metals
  gold: 'Gold',
  silver: 'Silver',
  platinum: 'Platinum',
  perGram: 'per gram',
  perOunce: 'per oz',
  perKilo: 'per kg',
  currency_EGP: 'EGP',
  currency_USD: 'USD',
  metalPrices: 'Metal Prices',
  goldPrices: 'Gold Prices in Egypt',
  silverPrices: 'Silver Prices in Egypt',

  // Crypto
  cryptoPrices: 'Crypto Prices',
  marketCap: 'Market Cap',
  volume24h: '24h Volume',
  change24h: '24h Change',
  change7d: '7d Change',
  priceUSD: 'Price (USD)',
  priceEGP: 'Price (EGP)',

  // Forex
  forexRates: 'Exchange Rates',
  foreignExchange: 'Foreign Exchange',
  rate: 'Rate',

  // Charts
  priceHistory: 'Price History',
  timeRange_1D: '1 Day',
  timeRange_1W: '1 Week',
  timeRange_1M: '1 Month',
  timeRange_3M: '3 Months',
  timeRange_1Y: '1 Year',

  // Alerts
  priceAlerts: 'Price Alerts',
  setAlert: 'Set Alert',
  alertEmail: 'Your email',
  alertWhen: 'Alert when price goes',
  above: 'Above',
  below: 'Below',
  targetPrice: 'Target price',
  subscribe: 'Subscribe',
  alertSaved: 'Alert saved!',

  // General
  showMore: 'Show more',
  showLess: 'Show less',
  search: 'Search',
  darkMode: 'Dark mode',
  lightMode: 'Light mode',
  language: 'Language',
  up: 'Up',
  down: 'Down',
  unchanged: 'Unchanged',
  powered: 'Powered by live market data',
  adminPanel: 'Admin Panel',
  login: 'Login',
  logout: 'Logout',
};

export const ar: Record<TranslationKey, string> = {
  appName: 'سوق الأسواق',
  tagline: 'تتبع أسعار الذهب والفضة والعملات المشفرة في مصر',
  nav_dashboard: 'لوحة التحكم',
  nav_metals: 'المعادن',
  nav_crypto: 'العملات المشفرة',
  nav_forex: 'العملات الأجنبية',
  nav_charts: 'الرسوم البيانية',
  nav_admin: 'الإدارة',

  lastUpdated: 'آخر تحديث',
  refresh: 'تحديث',
  loading: 'جارٍ التحميل...',
  error: 'فشل تحميل البيانات',
  retry: 'إعادة المحاولة',

  gold: 'ذهب',
  silver: 'فضة',
  platinum: 'بلاتين',
  perGram: 'لكل جرام',
  perOunce: 'لكل أوقية',
  perKilo: 'لكل كيلو',
  currency_EGP: 'جنيه',
  currency_USD: 'دولار',
  metalPrices: 'أسعار المعادن',
  goldPrices: 'أسعار الذهب في مصر',
  silverPrices: 'أسعار الفضة في مصر',

  cryptoPrices: 'أسعار العملات المشفرة',
  marketCap: 'القيمة السوقية',
  volume24h: 'حجم التداول 24 ساعة',
  change24h: 'التغيير 24 ساعة',
  change7d: 'التغيير 7 أيام',
  priceUSD: 'السعر (دولار)',
  priceEGP: 'السعر (جنيه)',

  forexRates: 'أسعار الصرف',
  foreignExchange: 'النقد الأجنبي',
  rate: 'السعر',

  priceHistory: 'سجل الأسعار',
  timeRange_1D: 'يوم واحد',
  timeRange_1W: 'أسبوع',
  timeRange_1M: 'شهر',
  timeRange_3M: '3 أشهر',
  timeRange_1Y: 'سنة',

  priceAlerts: 'تنبيهات الأسعار',
  setAlert: 'ضبط تنبيه',
  alertEmail: 'بريدك الإلكتروني',
  alertWhen: 'أنبهني عندما يصبح السعر',
  above: 'فوق',
  below: 'تحت',
  targetPrice: 'السعر المستهدف',
  subscribe: 'اشتراك',
  alertSaved: 'تم حفظ التنبيه!',

  showMore: 'عرض المزيد',
  showLess: 'عرض أقل',
  search: 'بحث',
  darkMode: 'الوضع الداكن',
  lightMode: 'الوضع الفاتح',
  language: 'اللغة',
  up: 'ارتفع',
  down: 'انخفض',
  unchanged: 'بدون تغيير',
  powered: 'مدعوم ببيانات السوق الحية',
  adminPanel: 'لوحة الإدارة',
  login: 'تسجيل الدخول',
  logout: 'تسجيل الخروج',
};

export const translations = { en, ar };
export type Locale = keyof typeof translations;
