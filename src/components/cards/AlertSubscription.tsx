'use client';
// src/components/cards/AlertSubscription.tsx

import { useState } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils/cn';

export function AlertSubscription() {
  const { locale, currency } = useAppStore();
  const [email, setEmail] = useState('');
  const [asset, setAsset] = useState('gold');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const assets = [
    { id: 'gold',    label: locale === 'ar' ? 'ذهب' : 'Gold',    type: 'metal' },
    { id: 'silver',  label: locale === 'ar' ? 'فضة' : 'Silver',  type: 'metal' },
    { id: 'bitcoin', label: locale === 'ar' ? 'بيتكوين' : 'Bitcoin', type: 'crypto' },
    { id: 'USD/EGP', label: locale === 'ar' ? 'دولار/جنيه' : 'USD/EGP', type: 'forex' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !targetPrice) return;
    setLoading(true);
    setError('');

    try {
      const selectedAsset = assets.find(a => a.id === asset)!;
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          assetType: selectedAsset.type,
          assetId: asset,
          condition,
          targetPrice: parseFloat(targetPrice),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setEmail('');
        setTargetPrice('');
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(json.error ?? 'Failed to save alert');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-amber-500/15 bg-amber-950/15 p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
          <Bell size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-white">
            {locale === 'ar' ? 'تنبيهات الأسعار' : 'Price Alerts'}
          </h3>
          <p className="text-xs text-gray-500">
            {locale === 'ar' ? 'اشترك للحصول على تنبيهات عبر البريد الإلكتروني' : 'Get email notifications when prices hit your target'}
          </p>
        </div>
      </div>

      {success ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 p-4 text-emerald-400">
          <CheckCircle size={20} />
          <span className="text-sm font-medium">
            {locale === 'ar' ? 'تم حفظ التنبيه!' : 'Alert saved! We\'ll email you when the price is reached.'}
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">
              {locale === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Asset */}
            <div>
              <label className="mb-1.5 block text-xs text-gray-500">
                {locale === 'ar' ? 'الأصل' : 'Asset'}
              </label>
              <select
                value={asset}
                onChange={e => setAsset(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
              >
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="mb-1.5 block text-xs text-gray-500">
                {locale === 'ar' ? 'الشرط' : 'Condition'}
              </label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as 'above' | 'below')}
                className="w-full rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
              >
                <option value="above">{locale === 'ar' ? 'أعلى من' : 'Above'}</option>
                <option value="below">{locale === 'ar' ? 'أقل من' : 'Below'}</option>
              </select>
            </div>
          </div>

          {/* Target price */}
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">
              {locale === 'ar' ? 'السعر المستهدف' : `Target price (${currency})`}
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              placeholder="e.g. 3200"
              required
              min="0"
              step="any"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-gray-950 transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? (locale === 'ar' ? 'جارٍ الحفظ...' : 'Saving...')
              : (locale === 'ar' ? 'اشتراك' : 'Set Alert')}
          </button>
        </form>
      )}
    </section>
  );
}
