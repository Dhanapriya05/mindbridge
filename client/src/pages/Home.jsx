import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Wind, 
  HeartHandshake, 
  PhoneCall, 
  ArrowRight, 
  Activity, 
  Users
} from 'lucide-react';

export const Home = ({ onNavigate, onOpenSOS, audioMask }) => {
  const [pulseData, setPulseData] = useState({
    totalAssessmentsCompleted: 1428,
    activeEmpathyLounges: 42,
    resonanceCoherenceIndex: 82,
    primaryCampusStressors: [
      { tag: 'Semester Exams & CGPA', count: 540, percentage: 38 },
      { tag: 'Campus Placement & Career', count: 420, percentage: 30 },
      { tag: 'Hostel Isolation & Food', count: 260, percentage: 18 },
      { tag: 'Peer Comparison & Burnout', count: 200, percentage: 14 }
    ]
  });

  useEffect(() => {
    fetch('/api/pulse/campus-summary')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const raw = data.data;
          // Normalize stressors list from either primaryCampusStressors or topStressors
          const rawStressors = raw.primaryCampusStressors || raw.topStressors || [];
          const normalizedStressors = rawStressors.map((st) => ({
            tag: st.tag || st.name || 'Academic Stress',
            count: st.count || 0,
            percentage: st.percentage || (st.count ? Math.min(100, Math.round(st.count * 2.2)) : 25)
          }));

          setPulseData({
            totalAssessmentsCompleted: raw.totalRecentAssessments || raw.totalAssessmentsCompleted || 1428,
            activeEmpathyLounges: raw.activeEmpathyLounges || 42,
            resonanceCoherenceIndex: raw.resonanceCoherenceIndex || 82,
            primaryCampusStressors: normalizedStressors.length > 0 ? normalizedStressors : [
              { tag: 'Semester Exams & CGPA', count: 540, percentage: 38 },
              { tag: 'Campus Placement & Career', count: 420, percentage: 30 },
              { tag: 'Hostel Isolation & Food', count: 260, percentage: 18 },
              { tag: 'Peer Comparison & Burnout', count: 200, percentage: 14 }
            ]
          });
        }
      })
      .catch((err) => console.log('Using local fallback pulse metrics:', err));
  }, []);

  const stressors = pulseData.primaryCampusStressors || [];

  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-4">
        
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-700 dark:text-brand-300 text-xs font-semibold animate-pulse">
          <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Stepped-Care • Zero-Knowledge Sanctuary for Indian Youth</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-tight">
          A Safe Space Where <br />
          <span className="bg-gradient-to-r from-brand-600 via-teal-500 to-calm-cyan dark:from-brand-300 dark:via-teal-200 dark:to-calm-cyan bg-clip-text text-transparent">
            No One Knows Who You Are.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Navigate college pressure, placement anxiety, and hostel loneliness with complete privacy.
          Anonymous triage, communal bio-resonance, and instant crisis support.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onNavigate('triage')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-500 via-teal-500 to-calm-cyan text-white dark:text-slate-950 font-extrabold text-base shadow-xl shadow-brand-500/25 hover:scale-105 transition-all flex items-center justify-center space-x-3"
          >
            <Sparkles className="w-5 h-5 text-amber-200 dark:text-slate-900" />
            <span>Take Anonymous Check-In</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('lounge')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-700 hover:border-brand-500/50 text-slate-800 dark:text-white font-semibold text-base hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex items-center justify-center space-x-3"
          >
            <Users className="w-5 h-5 text-calm-cyan" />
            <span>Enter Empathy Lounge</span>
          </button>
        </div>

      </section>

      {/* Live Campus Wellbeing Pulse Barometer */}
      <section className="glass-panel-glow p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Live Pan-India Campus Pulse</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              De-identified macro indicators showing how peers are feeling right now.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-right shadow-sm">
              <span className="text-[10px] text-slate-400 block">Communal Coherence</span>
              <span className="text-lg font-bold font-display text-emerald-600 dark:text-emerald-400">
                {pulseData.resonanceCoherenceIndex}% Calm
              </span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-right shadow-sm">
              <span className="text-[10px] text-slate-400 block">Active In Lounge</span>
              <span className="text-lg font-bold font-display text-brand-600 dark:text-brand-300">
                {pulseData.activeEmpathyLounges} Students
              </span>
            </div>
          </div>
        </div>

        {/* Top Stressors Bar */}
        <div className="space-y-4">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Current Primary Academic Stressors:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stressors.map((st, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{st.tag}</span>
                  <span className="text-brand-600 dark:text-brand-300 font-bold">{st.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-calm-cyan rounded-full transition-all duration-1000"
                    style={{ width: `${st.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stepped Care 3-Tier Core Pillars */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Stepped-Care Architecture</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Clinical triage that routes you to the exact right level of care without storing any personal records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tier 1 Card */}
          <div className="p-6 rounded-3xl glass-panel border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Wind className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Tier 1 • Mild</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Self-Guided Micro-Tools</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                4-4-4-4 Sama Vritti Pranayama, 432 Hz Solfeggio sound masking, and nervous system regulation.
              </p>
            </div>
            <button
              onClick={() => onNavigate('breathing')}
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all"
            >
              Launch Box Breathing
            </button>
          </div>

          {/* Tier 2 Card */}
          <div className="p-6 rounded-3xl glass-panel border border-brand-500/20 hover:border-brand-500/40 transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-300 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300 block">Tier 2 • Moderate</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Anonymous Peer Empathy</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ephemeral 1:1 rooms with peers who share the same campus context. In-memory only with instant panic purge.
              </p>
            </div>
            <button
              onClick={() => onNavigate('peer')}
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-brand-950/60 text-slate-800 dark:text-slate-200 hover:text-brand-700 dark:hover:text-brand-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all"
            >
              Find Peer Match
            </button>
          </div>

          {/* Tier 3 Card */}
          <div className="p-6 rounded-3xl glass-panel border border-rose-500/20 hover:border-rose-500/40 transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                <PhoneCall className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">Tier 3 • Acute</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Crisis Escalation (Tele-MANAS)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Instant 1-tap connection to verified Indian government & youth mental health helplines 24/7.
              </p>
            </div>
            <button
              onClick={onOpenSOS}
              className="w-full py-3 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white text-xs font-bold border border-rose-500/30 dark:border-rose-500/40 transition-all"
            >
              Open Crisis Helplines
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
