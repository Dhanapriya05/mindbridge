import React, { useState } from 'react';

const STEPS = [['See', 5], ['Feel', 4], ['Hear', 3], ['Smell', 2], ['Taste', 1]];
export const GroundingExercise = () => {
  const [step, setStep] = useState(0);
  const [entries, setEntries] = useState([]);
  const [value, setValue] = useState('');
  const [complete, setComplete] = useState(false);
  const [sense, count] = STEPS[step] || [];
  const addEntry = (event) => {
    event.preventDefault();
    if (!value.trim()) return;
    const next = [...entries, value.trim()];
    setEntries(next); setValue('');
    if (next.length >= STEPS.reduce((sum, [, amount]) => sum + amount, 0)) setComplete(true);
    else if (next.length >= STEPS.slice(0, step + 1).reduce((sum, [, amount]) => sum + amount, 0)) setStep(step + 1);
  };
  return <section className="glass-panel-glow rounded-3xl p-6">
    <h3 className="text-2xl font-display font-bold">5-4-3-2-1 Grounding</h3>
    {complete ? <div className="py-10 text-center"><p className="text-emerald-500 font-semibold">You made space for the present moment.</p><button onClick={() => { setEntries([]); setStep(0); setComplete(false); }} className="mt-4 text-sm text-brand-500">Start again</button></div> : <><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Name {count} things you can {sense.toLowerCase()}. No need to make them profound.</p><form onSubmit={addEntry} className="mt-6 flex gap-2"><input autoFocus value={value} onChange={(event) => setValue(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 px-3 py-3" placeholder={`One thing you can ${sense.toLowerCase()}`} /><button className="rounded-xl bg-brand-500 px-4 text-white font-bold" type="submit">Add</button></form><div className="mt-5 flex gap-2">{STEPS.map(([label, amount], index) => <span key={label} className={`rounded-full px-3 py-1 text-xs ${index <= step ? 'bg-brand-500/20 text-brand-600' : 'bg-slate-100 dark:bg-slate-800'}`}>{label} {amount}</span>)}</div></>}
  </section>;
};