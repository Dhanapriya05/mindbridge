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
  Sparkle,
  Quote
} from 'lucide-react';

export const Home = ({ onNavigate, onOpenSOS, audioMask }) => {
  const [pulseData, setPulseData] = useState({
    totalAssessmentsCompleted: 1428,
    activeEmpathyLounges: 42,
    resonanceCoherenceIndex: 82,
    primaryCampusStressors: [
      { tag: 'Exam pressure', count: 540, percentage: 38 },
      { tag: 'Career worry', count: 420, percentage: 30 },
      { tag: 'Homesickness', count: 260, percentage: 18 },
      { tag: 'Peer stress', count: 200, percentage: 14 }
    ]
  });

  useEffect(() => {
    fetch('/api/pulse/campus-summary')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const raw = data.data;
          const rawStressors = raw.primaryCampusStressors || raw.topStressors || [];
          const normalizedStressors = rawStressors.map((st) => ({
            tag: st.tag || st.name || 'Stress',
            count: st.count || 0,
            percentage: st.percentage || (st.count ? Math.min(100, Math.round(st.count * 2.2)) : 25)
          }));

          setPulseData({
            totalAssessmentsCompleted: raw.totalRecentAssessments || raw.totalAssessmentsCompleted || 1428,
            activeEmpathyLounges: raw.activeEmpathyLounges || 42,
            resonanceCoherenceIndex: raw.resonanceCoherenceIndex || 82,
            primaryCampusStressors: normalizedStressors.length > 0 ? normalizedStressors : [
              { tag: 'Exam pressure', count: 540, percentage: 38 },
              { tag: 'Career worry', count: 420, percentage: 30 },
              { tag: 'Homesickness', count: 260, percentage: 18 },
              { tag: 'Peer stress', count: 200, percentage: 14 }
            ]
          });
        }
      })
      .catch((err) => console.log('Using local fallback metrics:', err));
  }, []);

  const stressors = pulseData.primaryCampusStressors || [];

  const dailyQuestions = [
    'I feel tense today.',
    'I am finding it hard to rest.',
    'My mind keeps replaying worries.',
    'I need comfort and a calm voice.',
    'I feel alone in this moment.',
    'I feel tired but still under pressure.',
    'I need a small break from my thoughts.',
    'I need more support than I have right now.',
    'I want a gentle step to feel better.',
    'I want to speak to someone who listens.'
  ];

  return (
    <div className="space-y-14 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-calm-cyan/10 border border-calm-cyan/25 text-calm-cyan text-xs font-semibold animate-pulse">
          <ShieldCheck className="w-4 h-4" />
          <span>A quiet place to feel steady</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-sky-950 leading-tight">
          Take a breath.
          <span className="block bg-gradient-to-r from-calm-cyan via-sky-700 to-space-pink bg-clip-text text-transparent">
            You are not alone.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          This is a simple space for rest, reflection, and support. You can use it without sharing your name.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onNavigate('triage')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-400 text-white font-extrabold text-base shadow-xl shadow-sky-500/25 hover:-translate-y-0.5 hover:scale-[1.02] transition-all flex items-center justify-center space-x-3"
          >
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span>Check in</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('peer')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel border border-sky-200 hover:border-sky-400 text-sky-900 font-semibold text-base hover:bg-white transition-all flex items-center justify-center space-x-3"
          >
            <Users className="w-5 h-5 text-calm-cyan" />
            <span>Talk to a peer</span>
          </button>
        </div>
      </section>

      <section className="glass-panel-glow rounded-[2rem] p-6 sm:p-10 overflow-hidden relative">
        <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-space-violet/20 blur-3xl" />
        <div className="grid lg:grid-cols-[1fr_auto] items-center gap-10 relative">
          <div className="max-w-xl">
            <p className="space-eyebrow mb-3">Simple reset</p>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-sky-950">Try one gentle breath.</h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
              Follow the calm pattern. There is no need to do anything perfect. Just sit, soften your shoulders, and breathe.
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

      <section className="glass-panel-glow p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-bold font-display text-sky-950">How students are feeling</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Anonymous and simple.</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 rounded-xl bg-white/80 border border-slate-200 text-right shadow-sm">
              <span className="text-[10px] text-slate-400 block">Calm level</span>
              <span className="text-lg font-bold font-display text-emerald-600">{pulseData.resonanceCoherenceIndex}%</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/80 border border-slate-200 text-right shadow-sm">
              <span className="text-[10px] text-slate-400 block">In lounge</span>
              <span className="text-lg font-bold font-display text-brand-600">{pulseData.activeEmpathyLounges}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Common worries today
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stressors.map((st, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/80 border border-slate-200 space-y-2 shadow-sm">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{st.tag}</span>
                  <span className="text-brand-600 font-bold">{st.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-calm-cyan rounded-full transition-all duration-1000" style={{ width: `${st.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-3xl font-bold font-display text-sky-950">What do you need today?</h2>
          <p className="text-sm text-slate-500 mt-2">Pick the option that fits your mood right now.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-panel border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                <Wind className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Start here</span>
              <h3 className="text-xl font-bold text-sky-950">Calm yourself</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Try breathing, music, and small soothing tools.</p>
            </div>
            <button onClick={() => onNavigate('breathing')} className="w-full py-3 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 text-xs font-bold border border-slate-200 transition-all">
              Try breathing
            </button>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-brand-500/20 hover:border-brand-500/40 transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-600 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-calm-cyan block">With someone</span>
              <h3 className="text-xl font-bold text-sky-950">Talk to a peer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Speak with someone who understands and shares kind words.</p>
            </div>
            <button onClick={() => onNavigate('peer')} className="w-full py-3 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-brand-700 text-xs font-bold border border-slate-200 transition-all">
              Find a peer
            </button>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-rose-500/20 hover:border-rose-500/40 transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
                <PhoneCall className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">Need help now</span>
              <h3 className="text-xl font-bold text-sky-950">Get support</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Call trusted support lines or use the quick emergency help button.</p>
            </div>
            <button onClick={onOpenSOS} className="w-full py-3 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-bold border border-rose-500/30 transition-all">
              Get help now
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="glass-panel p-6 rounded-3xl border border-sky-100">
          <div className="flex items-center gap-3 mb-4">
            <Quote className="w-5 h-5 text-brand-500" />
            <h3 className="text-xl font-bold text-sky-950">10 quick check-in questions</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {dailyQuestions.map((question, index) => (
              <div key={question} className="rounded-2xl bg-white/80 border border-slate-200 p-3 text-sm text-slate-700">
                <span className="font-bold text-brand-600 mr-2">{index + 1}.</span>
                {question}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 to-sky-50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">A kind reminder</p>
          <h3 className="mt-3 text-2xl font-bold font-display text-sky-950">You do not have to carry everything alone.</h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Small steps are still steps. One deep breath, one honest sentence, one helpful voice can change the day.
          </p>
        </div>
      </section>
    </div>
  );
};