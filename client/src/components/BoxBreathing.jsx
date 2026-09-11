import React, { useState, useEffect } from 'react';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, Radio, Moon, Sparkles } from 'lucide-react';

const PHASES = [
  { name: 'Breathe In', duration: 4, instruction: 'Breathe in slowly...', color: '#8bd8ef', scale: 1.25, motion: 'in' },
  { name: 'Hold', duration: 3, instruction: 'Hold gently...', color: '#b39bea', scale: 1.25, motion: 'hold' },
  { name: 'Breathe Out', duration: 6, instruction: 'Breathe out softly...', color: '#ed8bc2', scale: 0.75, motion: 'out' },
  { name: 'Rest', duration: 3, instruction: 'Rest your shoulders...', color: '#9ce6cf', scale: 0.75, motion: 'rest' }
];

export const BoxBreathing = ({ audioMask, socketHook }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].duration);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [syncWithLounge, setSyncWithLounge] = useState(true);

  const phase = PHASES[currentPhaseIndex];
  const phaseProgress = ((phase.duration - secondsLeft) / phase.duration) * 100;
  const sessionTime = completedCycles * 16 + currentPhaseIndex * 4 + (4 - secondsLeft);

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
            return PHASES[nextIdx].duration;
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
    setSecondsLeft(PHASES[0].duration);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="glass-panel-glow p-8 sm:p-12 rounded-3xl text-center relative overflow-hidden">
        
        {/* Header */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-calm-cyan/10 border border-calm-cyan/20 text-calm-cyan text-xs font-semibold mb-3">
            <Wind className="w-4 h-4" />
            <span>Four calm steps</span>
          </div>
          <h2 className="text-3xl font-extrabold font-display text-sky-950">
            A little breathing break
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Follow the little moon. Breathe in, hold, breathe out, and make space for calm.
          </p>
        </div>

        {/* Breathing Orb Visualization */}
        <div className={`relative my-12 flex items-center justify-center breath-space breath-space-${phase.motion} ${isActive ? 'is-breathing' : ''}`}>
          
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

          <div className="absolute -top-8 right-1/2 translate-x-1/2 text-calm-cyan/70 animate-float">
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="breath-particles" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => <span key={index} style={{ '--particle-index': index }} />)}
          </div>

          {/* Core Breathing Moon */}
          <div
            className="w-40 h-40 sm:w-48 sm:h-48 rounded-full transition-all duration-[4000ms] ease-in-out flex flex-col items-center justify-center shadow-2xl relative z-10"
            style={{
              background: `radial-gradient(circle at 35% 30%, #ffffff 0 5%, ${phase.color} 32%, rgba(104, 168, 208, 0.92) 78%)`,
              boxShadow: `0 0 45px ${phase.color}60`,
              transform: isActive ? `scale(${phase.scale})` : 'scale(1)'
            }}
          >
            <Moon className="w-7 h-7 text-white/90 mb-1 fill-white/30 breath-character" />
            <span className="text-xs uppercase tracking-widest font-bold text-white/90">
              {isActive ? phase.name : 'Ready'}
            </span>
            <span className="text-4xl sm:text-5xl font-black font-display text-white mt-1">
              {isActive ? secondsLeft : '4:4'}
            </span>
          </div>

        </div>

        {/* Dynamic Phase Instruction Banner */}
        <div className="h-14 mb-8 flex items-center justify-center">
          <p className="text-base sm:text-lg font-semibold text-sky-900 transition-all duration-500">
            {isActive ? phase.instruction : 'Press Start when you are ready.'}
          </p>
        </div>

        <div className="max-w-md mx-auto mb-8 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{phase.name}</span>
            <span>{sessionTime}s</span>
          </div>
          <div className="h-1.5 rounded-full bg-sky-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-calm-cyan to-space-pink transition-all duration-700"
              style={{ width: `${isActive ? phaseProgress : 0}%` }}
            />
          </div>
        </div>

        {/* Controls and Audio Integrations */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleToggle}
            className={`flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all hover:scale-105 ${
              isActive
                ? 'bg-white border border-sky-200 text-rose-500 hover:bg-rose-50'
                : 'bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-400 text-white shadow-sky-500/25'
            }`}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isActive ? 'Pause' : 'Start'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-white border border-sky-200 text-sky-800 hover:text-sky-950 hover:bg-sky-50 transition-all shadow-sm"
            title="Stop and reset"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-semibold">Stop</span>
          </button>

          {/* Sound Mask Quick Toggle */}
          <button
            onClick={() => audioMask.toggle('432hz')}
            className={`flex items-center space-x-2 px-4 py-3.5 rounded-2xl border text-xs font-semibold transition-all ${
              audioMask.isPlaying
                ? 'bg-calm-cyan/20 border-calm-cyan/40 text-calm-cyan font-bold'
                : 'bg-white border-sky-200 text-slate-600 hover:text-sky-900'
            }`}
          >
            {audioMask.isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioMask.isPlaying ? 'Sound on' : 'Sound off'}</span>
          </button>
        </div>

        {/* Session Stats & Communal Resonance Status */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Breaths done</span>
            <span className="text-xl font-bold font-display text-slate-900 dark:text-white">{completedCycles}</span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Your pace</span>
            <span className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400">
              {completedCycles >= 3 ? 'Steady' : 'Settling'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Share your pace</span>
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-300">
                {syncWithLounge ? 'On' : 'Off'}
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
