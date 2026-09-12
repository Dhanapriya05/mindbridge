import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  MessageSquare,
  CheckCircle2,
  Heart,
  Sparkles
} from 'lucide-react';
import { ChatDrawer } from '../components/ChatDrawer';

const PEER_TOPICS = [
  {
    id: 'placement',
    title: 'Career stress',
    desc: 'Job pressure, interviews, resume stress, and fear about the future.',
    icon: '💼'
  },
  {
    id: 'exams',
    title: 'Exam pressure',
    desc: 'Backlogs, CGPA fear, late-night study stress, and feeling behind.',
    icon: '📚'
  },
  {
    id: 'hostel',
    title: 'Homesickness',
    desc: 'Missing home, hostel life, roommates, and feeling alone in a new place.',
    icon: '🏠'
  },
  {
    id: 'general',
    title: 'Open chat',
    desc: 'No topic in mind. Just want someone kind to listen and help you feel lighter.',
    icon: '☕'
  }
];

const HEALING_QUOTES = [
  'You are not behind. You are becoming.',
  'One hard day does not mean your whole future is broken.',
  'You are allowed to rest before you are fully ready.',
  'Small steps still move you forward.',
  'A kind word can be the first light in a heavy day.'
];

export const PeerDashboard = ({ user, socketHook }) => {
  const [selectedTopic, setSelectedTopic] = useState('placement');
  const [isMatching, setIsMatching] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState(null);

  const openTopicAIChat = (topicId) => {
    const topic = PEER_TOPICS.find((t) => t.id === topicId) || PEER_TOPICS[0];
    const guidanceMessage = `We can talk about ${topic.title}. You do not need to explain everything perfectly. Tell me what feels heaviest right now, and I will help you find one small, kind next step.`;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mindbridge-ai-chat', {
          detail: {
            topic: topic.title,
            message: guidanceMessage
          }
        })
      );
    }
  };

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
          topic: PEER_TOPICS.find((t) => t.id === topic)?.title || 'Open chat'
        })
      });

      const data = await response.json();
      if (data.success && data.data) {
        const selected = PEER_TOPICS.find((t) => t.id === topic) || PEER_TOPICS[0];
        setActiveRoomId(data.data.roomId);

        window.dispatchEvent(new CustomEvent('mindbridge-open-ai', {
          detail: {
            topic: selected.title,
            description: selected.desc
          }
        }));

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
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-700 text-xs font-semibold">
          <Users className="w-4 h-4" />
          <span>Private peer support</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900">
          Talk to someone who understands.
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Pick what feels heavy. You will be matched anonymously with a student who is ready to listen and speak with care.
        </p>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-brand-500/20 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-slate-700">
          <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
          <span>
            <strong className="text-slate-900">Private and temporary:</strong> messages stay in live memory only and disappear when the chat ends.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PEER_TOPICS.map((topic) => {
          const isSelected = selectedTopic === topic.id;
          return (
            <div
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`p-6 rounded-3xl cursor-pointer border transition-all relative overflow-hidden flex flex-col justify-between space-y-4 ${
                isSelected ? 'glass-panel-glow border-brand-500 shadow-xl' : 'glass-panel border-slate-200 hover:border-brand-500/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{topic.icon}</span>
                {isSelected && (
                  <span className="px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-700 text-[10px] font-bold border border-brand-500/30 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Selected</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{topic.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{topic.desc}</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openTopicAIChat(topic.id);
                  startMatching(topic.id);
                }}
                disabled={isMatching}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                  isSelected ? 'bg-gradient-to-r from-brand-500 to-calm-cyan text-white shadow-md shadow-brand-500/20 hover:scale-[1.02]' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isMatching && isSelected ? 'Connecting...' : 'Match now'}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 to-sky-50">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-5 h-5 text-rose-500" />
          <h3 className="text-xl font-bold text-sky-950">Gentle words for today</h3>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {HEALING_QUOTES.map((quote) => (
            <div key={quote} className="rounded-2xl bg-white/80 border border-slate-200 p-3 text-sm text-slate-700 shadow-sm">
              “{quote}”
            </div>
          ))}
        </div>
      </div>

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
              <h4 className="text-lg font-bold text-slate-900 font-display">Finding a peer...</h4>
              <p className="text-xs text-slate-600 mt-1">We are looking for someone kind and available to listen.</p>
            </div>

            <button onClick={() => setIsMatching(false)} className="text-xs text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl bg-slate-100">
              Cancel
            </button>
          </div>
        </div>
      )}

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
