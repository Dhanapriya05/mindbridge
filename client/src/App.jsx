import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { EmpathyLounge } from './pages/EmpathyLounge';
import { PeerDashboard } from './pages/PeerDashboard';
import { TriageWizard } from './components/TriageWizard';
import { BoxBreathing } from './components/BoxBreathing';
import { SOSModal } from './components/SOSModal';
import { useSocket } from './hooks/useSocket';
import { useWebAudioMask } from './hooks/useWebAudioMask';
import { ShieldCheck, Sparkles, PhoneCall } from 'lucide-react';
import { RegistrationGate } from './components/RegistrationGate';
import { RelaxationSuite } from './pages/RelaxationSuite';
import { AdminUIDManager } from './pages/AdminUIDManager';
import { GalaxyDecor } from './components/GalaxyDecor';

function MindBridgeApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  const socketHook = useSocket();
  const audioMask = useWebAudioMask();

  // Initialize or fetch anonymous zero-knowledge identity
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await fetch('/api/auth/anonymous-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entropy: window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString()
          })
        });
        const data = await res.json();
        if (data.success && data.data) {
          setUser(data.data);
        }
      } catch (err) {
        console.warn('Anonymous session init offline fallback:', err);
        setUser(null);
      }
    };

    initSession();
  }, []);

  const handleRegenerateAlias = async () => {
    try {
      const res = await fetch('/api/auth/regenerate-alias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousHashId: user?.anonymousHashId })
      });
      const data = await res.json();
      if (data.success && data.data?.alias) {
        setUser((prev) => ({ ...prev, alias: data.data.alias }));
      }
    } catch (err) {
      console.error('Alias regeneration error:', err);
    }
  };

  return (
    <div className="galaxy-app min-h-screen flex flex-col text-slate-800 font-sans transition-colors duration-300 selection:bg-sky-300/50 selection:text-sky-950">
      <GalaxyDecor />
      
      {/* Top Navigation with Theme Toggle */}
      {!user ? <RegistrationGate onRegistered={setUser} /> : <><Navbar
        user={user}
        onRegenerateAlias={handleRegenerateAlias}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onOpenSOS={() => setIsSOSOpen(true)}
        audioMask={audioMask}
      />

      {/* Main Dynamic Page Content */}
      <main className="flex-1 pb-16">
        {currentPage === 'home' && (
          <Home
            onNavigate={(page) => setCurrentPage(page)}
            onOpenSOS={() => setIsSOSOpen(true)}
            audioMask={audioMask}
          />
        )}

        {currentPage === 'triage' && (
          <TriageWizard
            user={user}
            onNavigate={(page) => setCurrentPage(page)}
            onOpenSOS={() => setIsSOSOpen(true)}
          />
        )}

        {currentPage === 'lounge' && (
          <EmpathyLounge
            user={user}
            socketHook={socketHook}
            audioMask={audioMask}
          />
        )}

        {currentPage === 'peer' && (
          <PeerDashboard
            user={user}
            socketHook={socketHook}
          />
        )}

        {currentPage === 'breathing' && (
          <BoxBreathing
            audioMask={audioMask}
            socketHook={socketHook}
          />
        )}
        {currentPage === 'relaxation' && <RelaxationSuite />}
        {currentPage === 'admin' && <AdminUIDManager />}
      </main></>}

      {/* Emergency Crisis SOS Modal */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
      />

      {/* Footer with Zero-Knowledge Transparency Note */}
      <footer className="glass-panel border-t border-white/10 py-8 px-4 text-center mt-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>No personal details saved</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
              <Sparkles className="w-4 h-4 text-calm-cyan" />
              <span>Messages fade away</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
              <PhoneCall className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>Help line: Tele-MANAS 14416</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            MindBridge is a quiet place for Indian college students. If you may hurt yourself or are in danger, call <strong>112</strong> or Tele-MANAS at <strong>14416</strong> now.
          </p>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            MindBridge © {new Date().getFullYear()} • Your quiet corner of the galaxy
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MindBridgeApp />
    </ThemeProvider>
  );
}
