import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Heart
} from 'lucide-react';
import { ResonanceCanvas } from '../components/ResonanceCanvas';

const SOUND_MODES = [
  { id: '432hz', label: '432 Hz Solfeggio', desc: 'Theta binaural frequency for calming hyper-arousal', icon: '🎵' },
  { id: 'brown', label: 'Deep Brown Noise', desc: 'Waterfall acoustic mask to quiet racing thoughts', icon: '🌊' },
  { id: 'pink', label: 'Balanced Pink Noise', desc: 'Equal octave power for cognitive ease and study focus', icon: '🌸' },
  { id: 'monsoon', label: 'Monsoon Rain Ambient', desc: 'Synthesized petrichor & raindrop texture', icon: '🌧️' }
];

export const EmpathyLounge = ({ user, socketHook, audioMask }) => {
  const [pulseSent, setPulseSent] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#2dd4bf');

  // Notify socket of lounge join
  useEffect(() => {
    if (socketHook?.emitLoungeJoin && user) {
      socketHook.emitLoungeJoin({
        alias: user.alias,
        avatarSeed: user.avatarSeed
      });
    }
  }, [socketHook, user]);

  const handleSendCommunalPulse = () => {
    if (socketHook?.emitResonancePulse) {
      socketHook.emitResonancePulse({
        phase: 'calm',
        intensity: 1.5,
        color: selectedColor
      });
      setPulseSent(true);
      setTimeout(() => setPulseSent(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-brand-500/20">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-2 border border-brand-500/20">
            <Sparkles className="w-4 h-4 text-calm-cyan" />
            <span>Non-Demanding Co-Presence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
            Communal Empathy Lounge
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            A quiet sanctuary to rest alongside peers across Indian campuses. No talking required. Breathe, tune, and feel the shared calmness.
          </p>
        </div>

        {/* Live Presence Count */}
        <div className="flex items-center space-x-3 bg-white/90 dark:bg-slate-900/90 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
          <span className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Students In Resonance</span>
            <span className="text-xl font-black font-display text-emerald-600 dark:text-emerald-400">
              {socketHook?.loungeCount || 38} Connected
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Resonance Canvas Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bioluminescent Canvas (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-[420px] sm:h-[480px]">
            <ResonanceCanvas
              socketHook={socketHook}
              moodColor={selectedColor}
              activeCount={socketHook?.loungeCount || 38}
            />
          </div>

          {/* Canvas Actions */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Particle Aura:</span>
              <div className="flex items-center space-x-1.5">
                {[
                  { color: '#2dd4bf', label: 'Teal' },
                  { color: '#38bdf8', label: 'Cyan' },
                  { color: '#818cf8', label: 'Indigo' },
                  { color: '#34d399', label: 'Emerald' },
                  { color: '#fb7185', label: 'Rose' }
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setSelectedColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    className={`w-6 h-6 rounded-full transition-all ${
                      selectedColor === c.color ? 'ring-2 ring-slate-800 dark:ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleSendCommunalPulse}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-calm-cyan text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 hover:scale-105 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{pulseSent ? 'Pulse Sent! ✨' : 'Send Calm Wave to Room'}</span>
            </button>
          </div>
        </div>

        {/* Ambient Web Audio Mask Tuning Console */}
        <div className="space-y-4">
          <div className="glass-panel-glow p-6 rounded-3xl border border-brand-500/20 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-calm-cyan" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Acoustic Mask Engine</h3>
              </div>
              <button
                onClick={() => audioMask.toggle()}
                className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                  audioMask.isPlaying
                    ? 'bg-calm-cyan/20 border-calm-cyan/40 text-calm-cyan font-semibold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {audioMask.isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Sound Mode Options */}
            <div className="space-y-2.5">
              {SOUND_MODES.map((mode) => {
                const isActive = audioMask.isPlaying && audioMask.mode === mode.id;
                return (
                  <div
                    key={mode.id}
                    onClick={() => audioMask.setMode(mode.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                      isActive
                        ? 'bg-brand-500/20 border-brand-500 dark:border-brand-400 shadow-md font-semibold'
                        : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-brand-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl">{mode.icon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{mode.label}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{mode.desc}</p>
                        </div>
                      </div>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 dark:bg-brand-400 animate-ping shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Volume Slider */}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Sound Mask Volume</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.round(audioMask.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioMask.volume}
                onChange={(e) => audioMask.setVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-brand-400"
              />
            </div>
          </div>

          {/* Communal Vibe Card */}
          <div className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-300 font-semibold">
              <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>Campus Co-Regulation Note</span>
            </div>
            <p className="leading-relaxed">
              When students breathe together or focus in a quiet collective environment, parasympathetic tone increases naturally across the network.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
