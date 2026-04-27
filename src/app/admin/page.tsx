'use client';
// src/app/admin/page.tsx
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { RefreshCw, LogIn, LogOut, Shield, Zap } from 'lucide-react';

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

  // Load stats if logged in
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

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!adminToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/4 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-gray-500">Souq Markets</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/50"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/50"
            />
            {loginError && <p className="text-xs text-red-400">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-gray-950 hover:bg-amber-400 disabled:opacity-50"
            >
              <LogIn size={16} />
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-gray-500">Souq Markets — control center</p>
            </div>
          </div>
          <button
            onClick={() => setAdminToken(null)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:text-white"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Metal records', value: stats.metalRecords },
              { label: 'Crypto records', value: stats.cryptoRecords },
              { label: 'Forex records', value: stats.forexRecords },
              {
                label: 'Last update',
                value: stats.lastUpdate
                  ? new Date(stats.lastUpdate).toLocaleTimeString()
                  : 'Never',
              },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-white/8 bg-white/4 p-4">
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="mt-1 text-xl font-bold text-white">{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <h2 className="mb-4 font-semibold text-white">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-gray-950 hover:bg-amber-400 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing all prices...' : 'Force refresh all prices'}
            </button>
          </div>

          {refreshResult && (
            <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-950/30 p-4 text-sm">
              <p className="font-medium text-emerald-400">Refresh complete</p>
              <ul className="mt-2 space-y-1 text-gray-400">
                <li>Metals saved: {refreshResult.metals}</li>
                <li>Crypto saved: {refreshResult.crypto}</li>
                <li>Forex saved: {refreshResult.forex}</li>
                {refreshResult.errors?.length > 0 && (
                  <li className="text-red-400">Errors: {refreshResult.errors.join(', ')}</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Active overrides */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <h2 className="mb-4 font-semibold text-white">Active Price Overrides</h2>
          {overrides.length === 0 ? (
            <p className="text-sm text-gray-500">No active overrides.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs text-gray-500">
                  <th className="pb-2 text-start">Asset</th>
                  <th className="pb-2 text-start">Field</th>
                  <th className="pb-2 text-end">Value</th>
                  <th className="pb-2 text-end">By</th>
                  <th className="pb-2 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {overrides.map((ov: any) => (
                  <tr key={ov.id} className="border-b border-white/5">
                    <td className="py-2 text-amber-400">{ov.assetId}</td>
                    <td className="py-2 text-gray-300">{ov.field}</td>
                    <td className="py-2 text-end font-mono text-white">{ov.value}</td>
                    <td className="py-2 text-end text-gray-500">{ov.createdBy}</td>
                    <td className="py-2 text-end">
                      <button
                        onClick={async () => {
                          await fetch('/api/admin', {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'remove_override', id: ov.id }),
                          });
                          loadStats();
                        }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Back link */}
        <a href="/" className="block text-center text-sm text-gray-500 hover:text-gray-300">
          ← Back to dashboard
        </a>
      </div>
    </div>
  );
}
