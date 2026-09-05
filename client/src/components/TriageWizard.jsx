import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  HeartHandshake, 
  Wind, 
  PhoneCall, 
  CheckCircle2, 
  RotateCcw 
} from 'lucide-react';

const STRESSOR_OPTIONS = [
  { id: 'exams_cgpa', label: 'Semester Exams & CGPA', icon: '📚' },
  { id: 'campus_placement', label: 'Campus Placement & Career', icon: '💼' },
  { id: 'hostel_homesickness', label: 'Hostel Loneliness & Food', icon: '🏠' },
  { id: 'sleep_disruption', label: 'Insomnia & Night Rumination', icon: '🌙' },
  { id: 'financial_worry', label: 'College Fees & Financials', icon: '💸' },
  { id: 'relationship_strain', label: 'Friendship & Relationship Stress', icon: '💔' },
  { id: 'social_anxiety', label: 'Social Anxiety in Lectures/Labs', icon: '👥' },
  { id: 'existential_burnout', label: 'Exhaustion & Brain Fog', icon: '⚡' }
];

export const TriageWizard = ({ user, onNavigate, onOpenSOS }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Form State
  const [gadScore, setGadScore] = useState(0); // 0-6
  const [phqScore, setPhqScore] = useState(0); // 0-6
  const [academicScore, setAcademicScore] = useState(0); // 0-4
  const [selectedStressors, setSelectedStressors] = useState([]);
  const [journalNotes, setJournalNotes] = useState('');

  // Subscale questions
  const [answers, setAnswers] = useState({
    anxiety1: 0,
    anxiety2: 0,
    mood1: 0,
    mood2: 0,
    academic1: 0,
    academic2: 0
  });

  const handleAnswerChange = (key, val) => {
    const updated = { ...answers, [key]: Number(val) };
    setAnswers(updated);
    setGadScore(updated.anxiety1 + updated.anxiety2);
    setPhqScore(updated.mood1 + updated.mood2);
    setAcademicScore(updated.academic1 + updated.academic2);
  };

  const toggleStressor = (id) => {
    setSelectedStressors((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const submitTriage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/triage/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonymousId: user?.anonymousHashId,
          score: gadScore + phqScore + academicScore,
          anxietyScore: gadScore,
          depressionScore: phqScore,
          selectedTags: selectedStressors,
          journalNotes
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        setStep(4); // Show Results Step
      }
    } catch (err) {
      console.error('Triage error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setResult(null);
    setAnswers({
      anxiety1: 0,
      anxiety2: 0,
      mood1: 0,
      mood2: 0,
      academic1: 0,
      academic2: 0
    });
    setGadScore(0);
    setPhqScore(0);
    setAcademicScore(0);
    setSelectedStressors([]);
    setJournalNotes('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Privacy Guarantee Header */}
      <div className="flex items-center justify-between p-4 mb-6 rounded-2xl glass-panel border border-brand-500/20">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span className="text-xs text-slate-700 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white font-bold">Zero-Knowledge Triage:</strong> Evaluated with zero PII. No scores are linked to your identity.
          </span>
        </div>
        <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
          Step {step} of 4
        </span>
      </div>

      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        
        {/* Step 1: Clinical Mood & Anxiety Pulse (PHQ-4) */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">How have you felt over the past few days?</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Standardized collegiate screening (PHQ-4). Select the option that best reflects your recent state.
              </p>
            </div>

            <div className="space-y-5">
              {/* Anxiety Q1 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  1. Feeling nervous, anxious, or on edge?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Not at all (0)', 'Several days (1)', 'Over half the days (2)', 'Nearly every day (3)'].map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerChange('anxiety1', idx)}
                      className={`p-2.5 rounded-xl text-xs font-medium transition-all ${
                        answers.anxiety1 === idx
                          ? 'bg-brand-500 text-white dark:text-slate-950 font-bold shadow-md shadow-brand-500/30'
                          : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/80'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Anxiety Q2 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  2. Not being able to stop or control worrying?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Not at all (0)', 'Several days (1)', 'Over half the days (2)', 'Nearly every day (3)'].map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerChange('anxiety2', idx)}
                      className={`p-2.5 rounded-xl text-xs font-medium transition-all ${
                        answers.anxiety2 === idx
                          ? 'bg-brand-500 text-white dark:text-slate-950 font-bold shadow-md shadow-brand-500/30'
                          : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/80'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Q1 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  3. Little interest or pleasure in doing things you usually enjoy?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Not at all (0)', 'Several days (1)', 'Over half the days (2)', 'Nearly every day (3)'].map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerChange('mood1', idx)}
                      className={`p-2.5 rounded-xl text-xs font-medium transition-all ${
                        answers.mood1 === idx
                          ? 'bg-brand-500 text-white dark:text-slate-950 font-bold shadow-md shadow-brand-500/30'
                          : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/80'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Q2 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  4. Feeling down, depressed, or hopeless?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Not at all (0)', 'Several days (1)', 'Over half the days (2)', 'Nearly every day (3)'].map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerChange('mood2', idx)}
                      className={`p-2.5 rounded-xl text-xs font-medium transition-all ${
                        answers.mood2 === idx
                          ? 'bg-brand-500 text-white dark:text-slate-950 font-bold shadow-md shadow-brand-500/30'
                          : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/80'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-calm-cyan text-white dark:text-slate-950 font-bold shadow-lg shadow-brand-500/20 hover:scale-105 transition-all"
              >
                <span>Continue to Campus Factors</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Academic & Youth Stressors */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">What is weighing on your mind most?</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Select any stressors currently affecting your daily focus or peace of mind.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STRESSOR_OPTIONS.map((opt) => {
                const isSelected = selectedStressors.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleStressor(opt.id)}
                    className={`flex items-center space-x-3 p-4 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-brand-500/20 border-brand-500 dark:border-brand-400 text-brand-900 dark:text-white shadow-md font-semibold'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Academic Deadline / Exam Pressure Severity:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Manageable (0)', 'Significant (2)', 'Overwhelming (4)'].map((lvl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerChange('academic1', idx * 2)}
                    className={`p-2.5 rounded-xl text-xs font-medium transition-all ${
                      answers.academic1 === idx * 2
                        ? 'bg-brand-500 text-white dark:text-slate-950 font-bold shadow-md shadow-brand-500/30'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-calm-cyan text-white dark:text-slate-950 font-bold shadow-lg shadow-brand-500/20 hover:scale-105 transition-all"
              >
                <span>Optional Reflection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Voluntary Thought Journal */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Anything you'd like to share anonymously?</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Completely optional. You can vent freely — this text is processed in memory and never saved to a database.
              </p>
            </div>

            <textarea
              value={journalNotes}
              onChange={(e) => setJournalNotes(e.target.value)}
              placeholder="e.g., I'm feeling disconnected from everyone in my hostel wing, and placement season is keeping me awake at night..."
              rows={4}
              className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm resize-none"
            />

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                disabled={loading}
                onClick={submitTriage}
                className="flex items-center space-x-2 px-7 py-3 rounded-xl bg-gradient-to-r from-brand-500 via-teal-500 to-calm-cyan text-white dark:text-slate-950 font-bold shadow-lg shadow-brand-500/25 hover:scale-105 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-200 dark:text-slate-900" />
                <span>{loading ? 'Evaluating...' : 'Generate Care Pathway'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Stepped-Care Triage Result */}
        {step === 4 && result && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center pb-2">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-3">
                <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Triage Evaluation Complete</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
                {result.tierTitle}
              </h2>
            </div>

            {/* Stepped Care Tier Badge Card */}
            <div className={`p-6 rounded-3xl border ${
              result.tierNumber === 3 || result.tier === 'Tier-3-Crisis'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/40 text-rose-900 dark:text-rose-200'
                : result.tierNumber === 2 || result.tier === 'Tier-2-Moderate'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
            }`}>
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm">
                  {result.tierNumber === 3 || result.tier === 'Tier-3-Crisis' ? (
                    <AlertTriangle className="w-8 h-8 text-rose-500 dark:text-rose-400 animate-bounce" />
                  ) : result.tierNumber === 2 || result.tier === 'Tier-2-Moderate' ? (
                    <HeartHandshake className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                  ) : (
                    <Wind className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {result.tierNumber === 3 || result.tier === 'Tier-3-Crisis'
                      ? 'High Distress / Crisis Alert'
                      : result.tierNumber === 2 || result.tier === 'Tier-2-Moderate'
                      ? 'Moderate Distress Detected'
                      : 'Mild Stress / Preventative Wellness'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {result.tierNumber === 3 || result.tier === 'Tier-3-Crisis'
                      ? 'You seem to be navigating intense pressure or acute pain. You do not have to walk through this alone. Immediate, confidential national support is available 24/7.'
                      : result.tierNumber === 2 || result.tier === 'Tier-2-Moderate'
                      ? 'We detect moderate anxiety or campus fatigue. Connecting with an empathetic peer or co-regulating in the Empathy Lounge will significantly lighten your mental load.'
                      : 'Your distress markers are mild. Engaging in self-directed box breathing, acoustic frequency masking, and restorative grounding is recommended.'}
                  </p>
                </div>
              </div>

              {/* Recommended Action Checklist */}
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-600 dark:text-slate-300">
                  Recommended Immediate Pathway:
                </span>
                {result.recommendations?.map((rec, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Action Hub */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {result.tierNumber === 3 || result.tier === 'Tier-3-Crisis' ? (
                <>
                  <button
                    onClick={onOpenSOS}
                    className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 text-white font-bold flex items-center justify-center space-x-3 shadow-lg shadow-rose-900/40 transition-all hover:scale-105"
                  >
                    <PhoneCall className="w-5 h-5" />
                    <span>Call Tele-MANAS (14416)</span>
                  </button>
                  <button
                    onClick={() => onNavigate('breathing')}
                    className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold flex items-center justify-center space-x-3 transition-all"
                  >
                    <Wind className="w-5 h-5 text-brand-500" />
                    <span>De-escalate with Box Breathing</span>
                  </button>
                </>
              ) : result.tierNumber === 2 || result.tier === 'Tier-2-Moderate' ? (
                <>
                  <button
                    onClick={() => onNavigate('peer')}
                    className="p-4 rounded-2xl bg-gradient-to-r from-brand-500 to-calm-cyan text-white dark:text-slate-950 font-bold flex items-center justify-center space-x-3 shadow-lg shadow-brand-500/20 transition-all hover:scale-105"
                  >
                    <HeartHandshake className="w-5 h-5" />
                    <span>Match with Anonymous Peer</span>
                  </button>
                  <button
                    onClick={() => onNavigate('lounge')}
                    className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold flex items-center justify-center space-x-3 transition-all"
                  >
                    <Sparkles className="w-5 h-5 text-calm-cyan" />
                    <span>Enter Empathy Lounge</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('breathing')}
                    className="p-4 rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-500 text-white dark:text-slate-950 font-bold flex items-center justify-center space-x-3 shadow-lg shadow-brand-500/20 transition-all hover:scale-105"
                  >
                    <Wind className="w-5 h-5" />
                    <span>Start 4-4-4-4 Pranayama Box Breathing</span>
                  </button>
                  <button
                    onClick={() => onNavigate('lounge')}
                    className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold flex items-center justify-center space-x-3 transition-all"
                  >
                    <Sparkles className="w-5 h-5 text-calm-cyan" />
                    <span>Tune Resonance Canvas</span>
                  </button>
                </>
              )}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={resetWizard}
                className="inline-flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Self-Check</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
