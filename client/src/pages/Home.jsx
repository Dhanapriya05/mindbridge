import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Wind, 
  HeartHandshake, 
  PhoneCall, 
  ArrowRight, 
  Activity, 
  Users,
  Moon,
  Sparkle
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
    <div className="space-y-14 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-4">
        
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-calm-cyan/10 border border-calm-cyan/25 text-calm-cyan text-xs font-semibold animate-pulse">
          <ShieldCheck className="w-4 h-4" />
          <span>A private place to feel a little lighter</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-sky-950 leading-tight">
          Welcome back, <br />
          <span className="bg-gradient-to-r from-calm-cyan via-white to-space-pink bg-clip-text text-transparent">
            little stargazer.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Take a small break, breathe slowly, and find your next calm step. You can use this space without sharing your name.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onNavigate('triage')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-400 text-white font-extrabold text-base shadow-xl shadow-sky-500/25 hover:-translate-y-0.5 hover:scale-[1.02] transition-all flex items-center justify-center space-x-3"
          >
            <Sparkles className="w-5 h-5 text-amber-200 dark:text-slate-900" />
            <span>Check in</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('lounge')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel border border-sky-200 hover:border-sky-400 text-sky-900 font-semibold text-base hover:bg-white transition-all flex items-center justify-center space-x-3"
          >
            <Users className="w-5 h-5 text-calm-cyan" />
            <span>Talk together</span>
          </button>
        </div>

      </section>

      <section className="glass-panel-glow rounded-[2rem] p-6 sm:p-10 overflow-hidden relative">
        <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-space-violet/20 blur-3xl" />
        <div className="grid lg:grid-cols-[1fr_auto] items-center gap-10 relative">
          <div className="max-w-xl">
            <p className="space-eyebrow mb-3">Your quiet journey</p>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-sky-950">Start with one soft breath.</h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
              Follow a glowing moon through four easy steps. No pressure. You can pause whenever you like.
            </p>
            <button
              onClick={() => onNavigate('breathing')}
              className="mt-6 inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-space-violet to-space-pink text-white font-bold shadow-lg shadow-space-violet/30 hover:-translate-y-0.5 transition-transform"
            >
              <Wind className="w-5 h-5" />
              <span>Start breathing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center animate-float">
            <div className="absolute inset-0 rounded-full bg-space-pink/20 blur-2xl" />
            <div className="absolute inset-5 rounded-full border border-calm-cyan/30" />
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center bg-[radial-gradient(circle_at_35%_30%,#fff8f3_0_5%,#ed8bc2_28%,#24194f_75%)] shadow-[0_0_60px_rgba(237,139,194,0.45)]">
              <Moon className="w-14 h-14 text-white/90 fill-white/20" />
            </div>
            <Sparkle className="absolute top-2 right-7 w-5 h-5 text-calm-cyan" />
            <Sparkle className="absolute bottom-7 left-2 w-4 h-4 text-space-pink" />
          </div>
        </div>
      </section>

      {/* Live Campus Wellbeing Pulse Barometer */}
      <section className="glass-panel-glow p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <h2 className="text-xl font-bold font-display text-sky-950">How people are feeling</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              A broad, anonymous look at what students are carrying today.
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
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Common heavy thoughts:
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
          <h2 className="text-3xl font-bold font-display text-sky-950">Choose your next step</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Pick what feels right today. You can change your mind at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tier 1 Card */}
          <div className="p-6 rounded-3xl glass-panel border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Wind className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Start here</span>
              <h3 className="text-xl font-bold text-sky-950">Calm by yourself</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Try breathing, gentle sounds, and small tools to help your body slow down.
              </p>
            </div>
            <button
              onClick={() => onNavigate('breathing')}
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all"
            >
              Try breathing
            </button>
          </div>

          {/* Tier 2 Card */}
          <div className="p-6 rounded-3xl glass-panel border border-brand-500/20 hover:border-brand-500/40 transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-300 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-calm-cyan block">With someone</span>
              <h3 className="text-xl font-bold text-sky-950">Talk to a peer</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Meet someone who understands. Your room is private and messages fade away.
              </p>
            </div>
            <button
              onClick={() => onNavigate('peer')}
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-brand-950/60 text-slate-800 dark:text-slate-200 hover:text-brand-700 dark:hover:text-brand-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all"
            >
              Find a peer
            </button>
          </div>

          {/* Tier 3 Card */}
          <div className="p-6 rounded-3xl glass-panel border border-rose-500/20 hover:border-rose-500/40 transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                <PhoneCall className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">Need help now</span>
              <h3 className="text-xl font-bold text-sky-950">Call for help</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Get quick help from trusted Indian support lines, any time.
              </p>
            </div>
            <button
              onClick={onOpenSOS}
              className="w-full py-3 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white text-xs font-bold border border-rose-500/30 dark:border-rose-500/40 transition-all"
            >
              Get help now
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
