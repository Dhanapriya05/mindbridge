import React, { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';

export const RegistrationGate = ({ onRegistered }) => {
  const [uid, setUid] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      const responseText = await response.text();
      let data = {};
      if (responseText) {
        try { data = JSON.parse(responseText); } catch { throw new Error('The API server returned an invalid response'); }
      }
      if (!response.ok) throw new Error(data.message || `Registration failed (${response.status})`);
      localStorage.setItem('mindbridge-token', data.token); onRegistered(data.data);
    } catch (registrationError) {
      setError(registrationError instanceof TypeError ? 'The API server is unavailable. Start the MindBridge server and try again.' : registrationError.message);
    } finally { setLoading(false); }
  };
  return <main className="flex flex-1 items-center justify-center px-4 py-16"><section className="glass-panel-glow w-full max-w-md rounded-3xl p-8"><div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-500"><ShieldCheck /></div><h1 className="text-3xl font-display font-bold">Enter your campus key</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">MindBridge access is issued by your institution. Your peer-facing identity will be a fresh anonymous alias.</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-semibold">Administrator-issued UID<div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 px-3"><KeyRound className="h-4 w-4 text-brand-500" /><input value={uid} onChange={(event) => setUid(event.target.value)} className="min-w-0 flex-1 bg-transparent py-3 outline-none" placeholder="MB-AB12CD34-2026" required /></div></label>{error && <p className="text-sm text-rose-500">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-brand-500 py-3 font-bold text-white disabled:opacity-60">{loading ? 'Verifying...' : 'Verify and enter'}</button></form></section></main>;
};