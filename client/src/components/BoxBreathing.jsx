import React, { useState, useEffect } from 'react';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, Radio } from 'lucide-react';

const PHASES = [
  { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose...', color: '#38BDF8', scale: 1.25 },
  { name: 'Hold', duration: 4, instruction: 'Hold gently. Settle into the calm stillness...', color: '#818CF8', scale: 1.25 },
  { name: 'Exhale', duration: 4, instruction: 'Exhale smoothly through your mouth...', color: '#34D399', scale: 0.75 },
  { name: 'Rest', duration: 4, instruction: 'Rest empty. Soften your jaw and shoulders...', color: '#14B8A6', scale: 0.75 }
];

export const BoxBreathing = ({ audioMask, socketHook }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [syncWithLounge, setSyncWithLounge] = useState(true);

  const phase = PHASES[currentPhaseIndex];

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Move to next phase
            setCurrentPhaseIndex((prevIdx) => {
              const nextIdx = (prevIdx + 1) % PHASES.length;
              if (nextIdx === 0) {
                setCompletedCycles((c) => c + 1);
              }

              // Broadcast live pulse to Empathy Lounge if sync enabled
              if (syncWithLounge && socketHook?.emitResonancePulse) {
                socketHook.emitResonancePulse({
                  phase: PHASES[nextIdx].name.toLowerCase(),
                  intensity: nextIdx === 0 || nextIdx === 1 ? 1.2 : 0.8,
                  color: PHASES[nextIdx].color
                });
              }

              return nextIdx;
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, syncWithLounge, socketHook]);

  const handleToggle = () => {
    if (!isActive) {
      setIsActive(true);
      if (!audioMask.isPlaying) {
        audioMask.play('432hz');
      }
    } else {
      setIsActive(false);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setSecondsLeft(4);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="glass-panel-glow p-8 sm:p-12 rounded-3xl text-center relative overflow-hidden">
        
        {/* Header */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-3">
            <Wind className="w-4 h-4" />
            <span>4-4-4-4 Sama Vritti Pranayama</span>
          </div>
          <h2 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">
            Box Breathing De-escalator
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Clinically proven autonomic nervous system reset. Regulate heart-rate variability and quiet acute panic in 3 minutes.
          </p>
        </div>

        {/* Breathing Orb Visualization */}
        <div className="relative my-12 flex items-center justify-center">
          
          {/* Ambient Outer Halo */}
          <div
            className="w-64 h-64 sm:w-80 sm:h-80 rounded-full transition-all duration-[4000ms] ease-in-out blur-2xl opacity-40 absolute"
            style={{
              backgroundColor: phase.color,
              transform: isActive ? `scale(${phase.scale * 1.3})` : 'scale(1)'
            }}
          />

          {/* Concentric Ring 2 */}
          <div
            className="w-52 h-52 sm:w-64 sm:h-64 rounded-full border transition-all duration-[4000ms] ease-in-out absolute flex items-center justify-center"
            style={{
              transform: isActive ? `scale(${phase.scale * 1.1})` : 'scale(1)',
              borderColor: `${phase.color}60`
            }}
          />

          {/* Core Breathing Orb */}
          <div
            className="w-40 h-40 sm:w-48 sm:h-48 rounded-full transition-all duration-[4000ms] ease-in-out flex flex-col items-center justify-center shadow-2xl relative z-10"
            style={{
              background: `radial-gradient(circle, ${phase.color} 0%, rgba(19, 27, 46, 0.95) 75%)`,
              boxShadow: `0 0 45px ${phase.color}60`,
              transform: isActive ? `scale(${phase.scale})` : 'scale(1)'
            }}
          >
            <span className="text-xs uppercase tracking-widest font-bold text-slate-200 opacity-90">
              {isActive ? phase.name : 'Ready'}
            </span>
            <span className="text-4xl sm:text-5xl font-black font-display text-white mt-1">
              {isActive ? secondsLeft : '4:4'}
            </span>
          </div>

        </div>

        {/* Dynamic Phase Instruction Banner */}
        <div className="h-14 mb-8 flex items-center justify-center">
          <p className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 transition-all duration-500">
            {isActive ? phase.instruction : 'Press Begin to start your nervous system synchronization'}
          </p>
        </div>

        {/* Controls and Audio Integrations */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleToggle}
            className={`flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all hover:scale-105 ${
              isActive
                ? 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-rose-600 dark:text-rose-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                : 'bg-gradient-to-r from-brand-500 via-teal-500 to-calm-cyan text-white dark:text-slate-950 shadow-brand-500/25'
            }`}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isActive ? 'Pause Session' : 'Begin Breath Cycle'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
            title="Reset cycle counter"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Sound Mask Quick Toggle */}
          <button
            onClick={() => audioMask.toggle('432hz')}
            className={`flex items-center space-x-2 px-4 py-3.5 rounded-2xl border text-xs font-semibold transition-all ${
              audioMask.isPlaying
                ? 'bg-calm-cyan/20 border-calm-cyan/40 text-calm-cyan font-bold'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {audioMask.isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioMask.isPlaying ? '432 Hz Sound Active' : 'Sound Mask Off'}</span>
          </button>
        </div>

        {/* Session Stats & Communal Resonance Status */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Cycles Completed</span>
            <span className="text-xl font-bold font-display text-slate-900 dark:text-white">{completedCycles}</span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Coherence State</span>
            <span className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400">
              {completedCycles >= 3 ? 'Synchronized' : 'Calibrating'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Lounge Broadcast</span>
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-300">
                {syncWithLounge ? 'Live Synced' : 'Private'}
              </span>
            </div>
            <button
              onClick={() => setSyncWithLounge(!syncWithLounge)}
              className={`p-1.5 rounded-lg border text-xs ${
                syncWithLounge ? 'bg-brand-500/20 border-brand-500/40 text-brand-700 dark:text-brand-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
              title="Toggle broadcasting your breathing rhythm to the live communal lounge"
            >
              <Radio className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
