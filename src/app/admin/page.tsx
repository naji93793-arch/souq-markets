'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { RefreshCw, LogIn, LogOut, Shield, PlusCircle, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const { adminToken, setAdminToken } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [refreshResult, setRefreshResult] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [overrides, setOverrides] = useState<any[]>([]);

  // State for new override form
  const [newOverride, setNewOverride] = useState({
    assetType: 'metal',
    assetId: 'XAU',
    field: 'price',
    value: ''
  });

  useEffect(() => {
    if (adminToken) loadStats();
  }, [adminToken]);

  async function loadStats() {
    const res = await fetch('/api/admin', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    if (json.success) setStats(json.stats);

    const ovRes = await fetch('/api/admin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list_overrides' }),
    });
    const ovJson = await ovRes.json();
    if (ovJson.success) setOverrides(ovJson.data);
  }

  async function handleAddOverride(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'add_override', 
        ...newOverride, 
        value: parseFloat(newOverride.value) 
      }),
    });
    const json = await res.json();
    if (json.success) {
      setNewOverride({ ...newOverride, value: '' });
      loadStats();
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (json.success) {
      setAdminToken(json.token);
    } else {
      setLoginError(json.error ?? 'Login failed');
    }
    setLoginLoading(false);
  }

  async function handleRefresh() {
    setRefreshing(true);
    setRefreshResult(null);
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'refresh' }),
    });
    const json = await res.json();
    setRefreshResult(json.result);
    setRefreshing(false);
    loadStats();
  }

  if (!adminToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/4 p-8 text-right" dir="rtl">
          <div className="mb-6 flex items-center justify-end gap-3">
            <div className="text-right">
              <h1 className="font-bold text-white text-lg">لوحة التحكم</h1>
              <p className="text-xs text-gray-500">سوق باطورة — Souq Markets</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Shield size={20} />
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/50 text-right"
            />
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/50 text-right"
            />
            {loginError && <p className="text-xs text-red-400 text-center">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-gray-950 hover:bg-amber-400 disabled:opacity-50"
            >
              <LogIn size={16} />
              {loginLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-right" dir="rtl">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setAdminToken(null)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:text-white"
          >
            خروج <LogOut size={14} />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h1 className="font-bold text-white text-xl">لوحة التحكم</h1>
              <p className="text-xs text-gray-500">إدارة أسعار سوق باطورة</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Shield size={20} />
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'سجلات الذهب', value: stats.metalRecords },
              { label: 'سجلات العملات الرقمية', value: stats.cryptoRecords },
              { label: 'سجلات الفوركس', value: stats.forexRecords },
              {
                label: 'آخر تحديث',
                value: stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString('ar-EG') : 'أبداً',
              },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-white/8 bg-white/4 p-4">
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="mt-1 text-xl font-bold text-white">{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Override Form */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <h2 className="mb-4 font-semibold text-white flex items-center gap-2">
            <PlusCircle size={18} className="text-amber-500" /> إضافة تعديل يدوي للسعر
          </h2>
          <form onSubmit={handleAddOverride} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <select 
              value={newOverride.assetType}
              onChange={e => setNewOverride({...newOverride, assetType: e.target.value})}
              className="rounded-lg bg-gray-900 border border-white/10 p-2 text-sm text-white outline-none focus:border-amber-500"
            >
              <option value="metal">ذهب/معادن</option>
              <option value="forex">عملات/فوركس</option>
              <option value="crypto">عملات رقمية</option>
            </select>
            <input 
              type="text"
              placeholder="الكود (مثل XAU أو USD)"
              value={newOverride.assetId}
              onChange={e => setNewOverride({...newOverride, assetId: e.target.value.toUpperCase()})}
              className="rounded-lg bg-gray-900 border border-white/10 p-2 text-sm text-white text-right outline-none focus:border-amber-500"
            />
            <input 
              type="number"
              step="0.01"
              placeholder="السعر بالجنيه المصري"
              value={newOverride.value}
              onChange={e => setNewOverride({...newOverride, value: e.target.value})}
              className="rounded-lg bg-gray-900 border border-white/10 p-2 text-sm text-white text-right outline-none focus:border-amber-500"
            />
            <button type="submit" className="bg-amber-500 text-gray-950 font-bold py-2 rounded-lg hover:bg-amber-400 transition-colors">
              حفظ السعر
            </button>
          </form>
        </div>

        {/* Active overrides */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <h2 className="mb-4 font-semibold text-white">الأسعار المعدلة حالياً</h2>
          {overrides.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">لا توجد أسعار معدلة يدوياً حالياً.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-xs text-gray-500">
                    <th className="pb-2 text-right">الأصل</th>
                    <th className="pb-2 text-right">القيمة الحالية</th>
                    <th className="pb-2 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {overrides.map((ov: any) => (
                    <tr key={ov.id} className="border-b border-white/5">
                      <td className="py-3 text-amber-400 font-bold">{ov.assetId}</td>
                      <td className="py-3 text-white font-mono">{ov.value.toLocaleString()} ج.م</td>
                      <td className="py-3 text-left">
                        <button
                          onClick={async () => {
                            await fetch('/api/admin', {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'remove_override', id: ov.id }),
                            });
                            loadStats();
                          }}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <h2 className="mb-4 font-semibold text-white">إجراءات النظام</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'جاري تحديث كل الأسعار من المصادر...' : 'تحديث إجباري لكل الأسعار العالمية'}
          </button>
        </div>

        <a href="/" className="block text-center text-sm text-gray-500 hover:text-gray-300">
          ← العودة للرئيسية
        </a>
      </div>
    </div>
  );
}