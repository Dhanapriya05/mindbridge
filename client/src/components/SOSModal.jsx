import React, { useState } from 'react';
import { 
  PhoneCall, 
  X, 
  AlertOctagon 
} from 'lucide-react';

const HELPLINES = [
  {
    name: 'Tele-MANAS (Govt. of India)',
    desc: 'National Tele Mental Health Programme. 24/7, multi-lingual, free.',
    number: '14416',
    altNumber: '1800-891-4416',
    badge: 'Govt. 24/7'
  },
  {
    name: 'KIRAN Helpline (MSJE)',
    desc: '24/7 mental health rehabilitation helpline by Ministry of Social Justice.',
    number: '1800-599-0019',
    badge: 'Toll-Free'
  },
  {
    name: 'Vandrevala Foundation',
    desc: '24/7 confidential crisis mental health counseling.',
    number: '9999666555',
    display: '+91 9999 666 555',
    badge: 'Youth Trusted'
  },
  {
    name: 'Sneha India Helpline',
    desc: 'Suicide prevention and acute emotional distress support.',
    number: '04424640050',
    display: '044-24640050',
    badge: 'Crisis Care'
  }
];

const GROUNDING_STEPS = [
  { num: '5', label: 'Things you can SEE', desc: 'Look around. Spot 5 objects: a book, a light, your hand, a window.' },
  { num: '4', label: 'Things you can TOUCH', desc: 'Feel the chair beneath you, the fabric of your shirt, the cool table.' },
  { num: '3', label: 'Things you can HEAR', desc: 'Listen closely: the hum of a fan, distant birds, your own breath.' },
  { num: '2', label: 'Things you can SMELL', desc: 'Notice any scent in the air, or imagine fresh rain on dry earth.' },
  { num: '1', label: 'Thing you can TASTE', desc: 'Take a slow sip of water or focus on a deep, slow release of breath.' }
];

export const SOSModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('helplines'); // 'helplines' | 'grounding'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-rose-500/40 rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300">
        
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-rose-900 dark:from-rose-950 dark:via-slate-900 dark:to-rose-950 p-6 border-b border-rose-500/30 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6 text-rose-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white font-display">Crisis Support & Emergency SOS</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 text-[10px] font-bold border border-rose-500/40">
                  24/7 Available
                </span>
              </div>
              <p className="text-xs text-rose-200 mt-0.5">
                You are safe here. Immediate help is free, anonymous, and available right now.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/50 p-2">
          <button
            onClick={() => setActiveTab('helplines')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'helplines'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            📞 Verified Indian Helplines
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'grounding'
                ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-300 shadow-md font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            🧘 5-4-3-2-1 Panic Grounding
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {activeTab === 'helplines' ? (
            <div className="space-y-3">
              {HELPLINES.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-rose-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{item.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-brand-700 dark:text-brand-300 font-semibold border border-slate-300 dark:border-slate-700">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{item.desc}</p>
                    {item.altNumber && (
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Toll-Free Alternate: {item.altNumber}
                      </span>
                    )}
                  </div>

                  <a
                    href={`tel:${item.number}`}
                    className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 text-white font-bold text-sm shadow-md shadow-rose-600/30 transition-all shrink-0 hover:scale-105"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call {item.display || item.number}</span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-700 dark:text-slate-300 pb-1 font-medium">
                If your heart is racing or your mind feels overwhelmed, follow these 5 steps slowly:
              </p>
              {GROUNDING_STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-start space-x-3 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-700 dark:text-brand-300 font-black font-display flex items-center justify-center shrink-0 border border-brand-500/30">
                    {step.num}
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{step.label}</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            For campus emergency services, please contact your university's Dean of Student Welfare (DSW) or campus medical center.
          </p>
        </div>

      </div>
    </div>
  );
};
