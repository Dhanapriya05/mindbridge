import React, { useState } from 'react';
import { 
  ShieldCheck, 
  RotateCw, 
  PhoneCall, 
  Volume2, 
  VolumeX, 
  Compass, 
  Users, 
  Sparkles, 
  Wind, 
  Menu, 
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Navbar = ({ 
  user, 
  onRegenerateAlias, 
  currentPage, 
  setCurrentPage, 
  onOpenSOS, 
  audioMask 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  const handleRotate = async () => {
    setIsRotating(true);
    await onRegenerateAlias();
    setTimeout(() => setIsRotating(false), 500);
  };

  const navItems = [
    { id: 'home', label: 'Sanctuary', icon: Compass },
    { id: 'triage', label: 'Check-In', icon: Sparkles },
    { id: 'lounge', label: 'Empathy Lounge', icon: Sparkles },
    { id: 'peer', label: 'Peer Match', icon: Users },
    { id: 'breathing', label: 'Box Breathing', icon: Wind }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Platform Name */}
          <div 
            onClick={() => setCurrentPage('home')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-teal-500 to-calm-cyan flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 via-teal-500 to-calm-cyan dark:from-brand-300 dark:via-teal-200 dark:to-calm-cyan bg-clip-text text-transparent">
                  MindBridge
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 font-semibold border border-brand-500/20">
                  Zero-Knowledge
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Youth Mental Health Sanctuary
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30 shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Dark/Light Toggle, Audio, Pseudonym, SOS */}
          <div className="hidden sm:flex items-center space-x-2.5 lg:space-x-3">
            
            {/* Theme Toggle Button (Light/Dark Mode) */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Serene Light Mode' : 'Switch to Twilight Dark Mode'}
              aria-label="Toggle Theme Mode"
              id="theme-toggle-btn"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 text-slate-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center relative overflow-hidden group"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 group-hover:-rotate-12" />
              )}
            </button>

            {/* Ambient Audio Mask Quick Toggle */}
            <button
              onClick={() => audioMask.toggle()}
              title={audioMask.isPlaying ? 'Mute 432Hz Sound Mask' : 'Activate 432Hz Sound Mask'}
              className={`p-2.5 rounded-xl border transition-all flex items-center space-x-2 text-xs font-medium ${
                audioMask.isPlaying
                  ? 'bg-calm-cyan/20 border-calm-cyan/40 text-calm-cyan animate-pulse font-semibold'
                  : 'bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {audioMask.isPlaying ? (
                <>
                  <Volume2 className="w-4 h-4 text-calm-cyan" />
                  <span className="hidden xl:inline">432Hz Playing</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden xl:inline">Sound Mask</span>
                </>
              )}
            </button>

            {/* Anonymous Alias Badge with 1-Click Rotation */}
            <div className="flex items-center space-x-2 bg-white/90 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
              <div className="text-xs">
                <span className="text-slate-400 dark:text-slate-400 text-[10px] block">Anonymous Identity</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 tracking-wide">
                  {user?.alias || 'Connecting...'}
                </span>
              </div>
              <button
                onClick={handleRotate}
                title="Rotate to new anonymous pseudonym"
                className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-brand-500' : ''}`} />
              </button>
            </div>

            {/* Emergency Crisis SOS Button */}
            <button
              onClick={onOpenSOS}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition-all hover:scale-105 active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS (14416)</span>
            </button>
          </div>

          {/* Mobile Actions (Theme Toggle & Menu Toggle) */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme Mode"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-amber-300"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              onClick={onOpenSOS}
              className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center space-x-1"
            >
              <PhoneCall className="w-3 h-3" />
              <span>SOS</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel-glow border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-5 space-y-3">
          <div className="flex items-center justify-between bg-white/90 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Your Anonymous Alias</span>
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">{user?.alias || 'Connecting...'}</p>
            </div>
            <button
              onClick={handleRotate}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <RotateCw className={`w-4 h-4 ${isRotating ? 'animate-spin text-brand-500' : ''}`} />
            </button>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    currentPage === item.id
                      ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => audioMask.toggle()}
              className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 font-medium"
            >
              {audioMask.isPlaying ? <Volume2 className="w-4 h-4 text-calm-cyan" /> : <VolumeX className="w-4 h-4" />}
              <span>{audioMask.isPlaying ? 'Sound Mask: Active (432Hz)' : 'Enable Sound Mask'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
