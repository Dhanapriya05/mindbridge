import React, { useEffect, useMemo, useState } from 'react';
import { Bot, MessageSquareText, Send, Sparkles, X } from 'lucide-react';

const starterMessages = [
  'I feel overwhelmed and need a quick reset.',
  'I am anxious about exams and my future.',
  'I want a calmer, kinder place to talk.'
];

const buildBotReply = (text = '') => {
  const normalized = text.toLowerCase();

  if (!normalized.trim()) {
    return 'I am here with you. Tell me what feels heavy right now.';
  }

  if (normalized.includes('panic') || normalized.includes('overwhelmed') || normalized.includes('stress')) {
    return 'That sounds really intense. Try a slow 4-4-6 breathing cycle for a minute: inhale 4, hold 4, exhale 6. If the feeling becomes unsafe, please contact emergency support or Tele-MANAS at 14416.';
  }

  if (normalized.includes('exam') || normalized.includes('study') || normalized.includes('college') || normalized.includes('assignment')) {
    return 'Academic pressure can feel huge. Try narrowing it to one small next step: one page, one chapter, or one task. Progress is still progress.';
  }

  if (normalized.includes('lonely') || normalized.includes('isolated') || normalized.includes('alone')) {
    return 'You are not alone in feeling that way. A small check-in with someone safe, or to one of the peer support rooms, can make a difficult day feel lighter.';
  }

  if (normalized.includes('sad') || normalized.includes('cry') || normalized.includes('down')) {
    return 'I am really glad you told me. It is okay to pause, rest, and let your feelings be valid without fixing them immediately.';
  }

  if (normalized.includes('angry') || normalized.includes('frustrated')) {
    return 'Anger is often a signal that something is stretched or exhausted. Can you name one thing that feels most crowded right now?';
  }

  if (normalized.includes('sleep') || normalized.includes('tired') || normalized.includes('burnout')) {
    return 'Burnout often asks for gentleness, not more pressure. Try reducing the plan to just the next 10 minutes, then rest before pushing further.';
  }

  if (normalized.includes('hello') || normalized.includes('hi') || normalized.includes('hey')) {
    return 'Hi. I am MindBridge AI. I can help you slow down, reflect, and think through your next small step.';
  }

  if (normalized.includes('help') || normalized.includes('support')) {
    return 'I can help you calm down, organize your thoughts, and decide what support fits your situation. What is the hardest part right now?';
  }

  if (normalized.includes('suic') || normalized.includes('hurt') || normalized.includes('end my life')) {
    return 'I am really glad you reached out. If you feel in immediate danger or at risk of hurting yourself, call 112 or Tele-MANAS at 14416 right now. If you want, tell me what is making this feel so hard and I will stay with you while you plan the next safe step.';
  }

  return 'Thank you for sharing that. One gentle next step can be to name the feeling, the trigger, and the smallest action that would make the moment feel a little safer.';
};

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi, I am MindBridge AI. I can help you slow down, reflect, and take one gentle next step. What feels heavy right now?'
    }
  ]);

  useEffect(() => {
    const handleTopicOpen = (event) => {
      const detail = event?.detail || {};
      const topic = detail.topic || 'your selected topic';
      const description = detail.description || 'Let us take this one small step at a time.';

      setIsOpen(true);
      setMessages([
        {
          id: Date.now(),
          sender: 'bot',
          text: `I can help with ${topic}. ${description}`
        },
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: `Tell me what is feeling hardest about ${topic.toLowerCase()} today, and I will help you calm your thoughts and take the next gentle step.`
        }
      ]);
    };

    window.addEventListener('mindbridge-open-ai', handleTopicOpen);
    return () => window.removeEventListener('mindbridge-open-ai', handleTopicOpen);
  }, []);

  const suggestedPrompts = useMemo(() => starterMessages, []);

  const handleSend = (textOverride) => {
    const nextText = (textOverride ?? input).trim();
    if (!nextText) return;

    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: nextText }]);
    const reply = buildBotReply(nextText);

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: reply }]);
    }, 300);

    setInput('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-calm-cyan to-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-brand-500/25 hover:scale-[1.02] transition-all"
        >
          <Bot className="w-4 h-4" />
          AI Support
        </button>
      ) : (
        <div className="w-[360px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90">
          <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-sky-100 to-cyan-50 px-4 py-3 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-calm-cyan text-white shadow-sm">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">MindBridge AI</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-300">Gentle support companion</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              aria-label="Close AI chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto bg-slate-50/70 p-3 dark:bg-slate-950/40">
            <div className="mb-2 flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
              <Sparkles className="h-3 w-3 text-brand-500" />
              Quick support
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="rounded-full border border-sky-200 bg-white px-2.5 py-1.5 text-[10px] text-slate-700 transition hover:border-brand-400 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-brand-500 to-calm-cyan text-white'
                        : 'bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-brand-500 to-calm-cyan text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
