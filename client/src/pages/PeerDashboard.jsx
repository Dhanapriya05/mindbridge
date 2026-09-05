import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  MessageSquare, 
  CheckCircle2 
} from 'lucide-react';
import { ChatDrawer } from '../components/ChatDrawer';

const PEER_TOPICS = [
  {
    id: 'placement',
    title: 'Placement & Job Hunt Anxiety',
    desc: 'Resume shortlisting stress, coding interview burnout, or peer comparison.',
    icon: '💼',
    color: 'from-blue-500/20 to-indigo-500/20'
  },
  {
    id: 'exams',
    title: 'Exams, Backlogs & CGPA Pressure',
    desc: 'Late-night study fatigue, syllabus panic, and academic performance dread.',
    icon: '📚',
    color: 'from-brand-500/20 to-teal-500/20'
  },
  {
    id: 'hostel',
    title: 'Hostel Loneliness & Adjustment',
    desc: 'Homesickness, food blues, roommate friction, or feeling like an outsider.',
    icon: '🏠',
    color: 'from-amber-500/20 to-orange-500/20'
  },
  {
    id: 'general',
    title: 'Open Listening & Emotional Venting',
    desc: 'No specific topic. Just need a fellow student to talk through a heavy day.',
    icon: '☕',
    color: 'from-purple-500/20 to-pink-500/20'
  }
];

export const PeerDashboard = ({ user, socketHook }) => {
  const [selectedTopic, setSelectedTopic] = useState('placement');
  const [isMatching, setIsMatching] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState(null);

  const startMatching = async (topicId) => {
    const topic = topicId || selectedTopic;
    setIsMatching(true);

    try {
      const response = await fetch('/api/peer/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userHash: user?.anonymousHashId,
          alias: user?.alias,
          avatarSeed: user?.avatarSeed,
          topic: PEER_TOPICS.find((t) => t.id === topic)?.title || 'General Peer Support'
        })
      });

      const data = await response.json();
      if (data.success && data.data) {
        setActiveRoomId(data.data.roomId);
        // Short delay for smooth transition
        setTimeout(() => {
          setIsMatching(false);
          setIsChatOpen(true);
        }, 1200);
      }
    } catch (err) {
      console.error('Peer match error:', err);
      setIsMatching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-700 dark:text-brand-300 text-xs font-semibold">
          <Users className="w-4 h-4" />
          <span>Anonymous 1:1 Peer Empathy Circle</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white">
          Talk to a Peer Who Gets It
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Select what is on your mind. You will be matched anonymously with another Indian college student navigating similar challenges.
        </p>
      </div>

      {/* Privacy Guarantee Card */}
      <div className="glass-panel p-4 rounded-2xl border border-brand-500/20 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
          <span>
            <strong className="text-slate-900 dark:text-white">Zero Memory Guarantee:</strong> Peer chats are streamed strictly in volatile RAM. No logs, no recording. Instant Panic Purge button always active.
          </span>
        </div>
      </div>

      {/* Topic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PEER_TOPICS.map((topic) => {
          const isSelected = selectedTopic === topic.id;
          return (
            <div
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`p-6 rounded-3xl cursor-pointer border transition-all relative overflow-hidden flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'glass-panel-glow border-brand-500 dark:border-brand-400/60 shadow-xl'
                  : 'glass-panel border-slate-200 dark:border-slate-800 hover:border-brand-500/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{topic.icon}</span>
                {isSelected && (
                  <span className="px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-700 dark:text-brand-300 text-[10px] font-bold border border-brand-500/30 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Selected</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{topic.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{topic.desc}</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startMatching(topic.id);
                }}
                disabled={isMatching}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-brand-500 to-calm-cyan text-white dark:text-slate-950 shadow-md shadow-brand-500/20 hover:scale-[1.02]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isMatching && isSelected ? 'Connecting with Peer...' : 'Match on this Topic'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Match in Progress Radar Overlay */}
      {isMatching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-glow p-8 rounded-3xl text-center max-w-sm w-full space-y-6 border border-brand-500/30">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border border-brand-500/30 animate-ping absolute" />
              <div className="w-20 h-20 rounded-full border border-calm-cyan/50 animate-pulse absolute" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-calm-cyan flex items-center justify-center shadow-lg text-slate-950">
                <Users className="w-7 h-7" />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white font-display">Finding Peer Match...</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Searching for an active student peer in the anonymous queue.
              </p>
            </div>

            <button
              onClick={() => setIsMatching(false)}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
            >
              Cancel Match
            </button>
          </div>
        </div>
      )}

      {/* Ephemeral 1:1 Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        roomId={activeRoomId}
        user={user}
        socketHook={socketHook}
        topic={PEER_TOPICS.find((t) => t.id === selectedTopic)?.title}
      />

    </div>
  );
};
