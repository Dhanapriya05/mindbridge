import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Trash2, 
  ShieldAlert, 
  X, 
  HeartHandshake, 
  Sparkles, 
  Flame
} from 'lucide-react';

const ICEBREAKERS = [
  'Placement season is really draining me lately...',
  'Having trouble adjusting to the hostel environment.',
  'Struggling with mid-semester exam burnout.',
  'Just need a calm space to vent without judgment.'
];

export const ChatDrawer = ({ 
  isOpen, 
  onClose, 
  roomId, 
  user, 
  socketHook, 
  topic = 'General Peer Support' 
}) => {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [partnerAlias, setPartnerAlias] = useState('Waiting for peer...');
  const [isPurged, setIsPurged] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !roomId || !socketHook) return;

    setIsPurged(false);

    // Join ephemeral room on socket
    socketHook.emitPeerJoinRoom({
      roomId,
      alias: user?.alias,
      avatarSeed: user?.avatarSeed,
      userHash: user?.anonymousHashId
    });

    // Listen for incoming messages
    const unsubMsg = socketHook.onEvent('peer_message_received', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Listen for room status
    const unsubStatus = socketHook.onEvent('peer_status', (status) => {
      if (status.participantCount >= 2) {
        setPartnerAlias('Connected Peer');
      } else {
        setPartnerAlias('Waiting for peer to join...');
      }
    });

    // Listen for panic purge
    const unsubPurge = socketHook.onEvent('room_purged', () => {
      setIsPurged(true);
      setMessages([]);
      setTimeout(() => {
        onClose();
      }, 1500);
    });

    return () => {
      if (unsubMsg) unsubMsg();
      if (unsubStatus) unsubStatus();
      if (unsubPurge) unsubPurge();
    };
  }, [isOpen, roomId, user, socketHook, onClose]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim() || !socketHook) return;

    socketHook.emitPeerMessage({
      roomId,
      message: text.trim(),
      senderAlias: user?.alias || 'Anonymous Peer',
      avatarSeed: user?.avatarSeed
    });

    setInputVal('');
  };

  const handlePanicPurge = () => {
    if (confirm('Activate Panic Purge? All messages in memory will be erased immediately.')) {
      socketHook.emitPanicPurge(roomId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slideLeft transition-colors duration-300">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-calm-cyan flex items-center justify-center shadow-md">
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">1:1 Anonymous Peer Room</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-brand-600 dark:text-brand-300 font-semibold">{partnerAlias}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Panic Purge Button */}
          <button
            onClick={handlePanicPurge}
            title="Emergency Panic Purge — destroys memory instantly"
            className="px-2.5 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/70 hover:bg-rose-200 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-600/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center space-x-1 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Ephemeral Memory Notice */}
      <div className="bg-slate-100 dark:bg-slate-900/60 px-4 py-2 border-b border-slate-200 dark:border-slate-800/80 flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
        <span>Messages exist purely in RAM and are vaporized upon closing.</span>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isPurged ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-rose-600 dark:text-rose-400">
            <Flame className="w-12 h-12 animate-bounce" />
            <h4 className="text-lg font-bold">Panic Purge Complete</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All active socket buffers and message history have been wiped from memory.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center space-y-4 text-center p-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Safe, Judgment-Free Space</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Connect with a peer who understands the Indian campus experience. Break the ice below:
              </p>
            </div>

            {/* Icebreaker Prompts */}
            <div className="space-y-2 pt-2">
              {ICEBREAKERS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
                >
                  💬 "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderAlias === user?.alias;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 mb-1 px-1">
                  {isMe ? 'You' : msg.senderAlias} • {msg.timestamp}
                </span>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-brand-600 to-teal-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      {!isPurged && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Send an anonymous message..."
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-brand-500 focus:outline-none rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-calm-cyan text-white dark:text-slate-950 font-bold hover:scale-105 transition-all disabled:opacity-40 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
