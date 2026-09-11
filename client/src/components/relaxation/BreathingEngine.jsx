import React, { useEffect, useState } from 'react';

const PATTERNS = {
  box: [{ label: 'Inhale', seconds: 4 }, { label: 'Hold', seconds: 4 }, { label: 'Exhale', seconds: 4 }, { label: 'Rest', seconds: 4 }],
  relaxing: [{ label: 'Inhale', seconds: 4 }, { label: 'Hold', seconds: 7 }, { label: 'Exhale', seconds: 8 }],
  sigh: [{ label: 'Inhale', seconds: 2 }, { label: 'Inhale again', seconds: 1 }, { label: 'Long exhale', seconds: 6 }]
};

export const BreathingEngine = () => {
  const [pattern, setPattern] = useState('box');
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(PATTERNS.box[0].seconds);
  const phases = PATTERNS[pattern];
  const phase = phases[phaseIndex];

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value > 1) return value - 1;
        setPhaseIndex((index) => (index + 1) % phases.length);
        return phases[(phaseIndex + 1) % phases.length].seconds;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, pattern, phaseIndex, phases]);

  const selectPattern = (next) => {
    setPattern(next);
    setPhaseIndex(0);
    setRemaining(PATTERNS[next][0].seconds);
    setRunning(false);
  };

  return <section className="glass-panel-glow rounded-3xl p-6 text-center">
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      {Object.keys(PATTERNS).map((key) => <button key={key} onClick={() => selectPattern(key)} className={`px-3 py-2 rounded-xl text-xs font-semibold border ${pattern === key ? 'bg-brand-500/20 border-brand-400 text-brand-600 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700'}`}>
        {key === 'box' ? 'Box 4-4-4-4' : key === 'relaxing' ? '4-7-8 Relax' : 'Physiological Sigh'}
      </button>)}
    </div>
    <div className={`mx-auto mb-6 w-48 h-48 rounded-full border-4 border-calm-cyan/50 flex flex-col items-center justify-center transition-transform duration-1000 ${running && phase.label.toLowerCase().includes('inhale') ? 'scale-110' : 'scale-95'}`}>
      <span className="text-xs uppercase tracking-widest text-slate-500">{running ? phase.label : 'Ready'}</span>
      <strong className="text-5xl font-display">{running ? remaining : phase.seconds}</strong>
    </div>
    <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">Follow the ring gently. Pause whenever your body asks.</p>
    <button onClick={() => setRunning((value) => !value)} className="px-6 py-3 rounded-xl bg-brand-500 text-white font-bold">{running ? 'Pause' : 'Begin'}</button>
  </section>;
};