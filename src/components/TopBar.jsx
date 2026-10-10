import React from 'react';
import { 
  Menu, Hexagon, Maximize, Minimize, ShieldAlert,
  Play, X, Radar, Map as MapIcon, Image as ImageIcon, Sparkles,
  Volume2, VolumeX, FileText, Compass, ArrowRight, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useMapStore from '../store/useMapStore';
import { marsAudio } from '../utils/audioSynthesizer';

export default function TopBar({ isMapActive = false, activeSection = 'home' }) {
  const viewMode = useMapStore(s => s.viewMode);
  const setViewMode = useMapStore(s => s.setViewMode);
  const isEVASimulating = useMapStore(s => s.isEVASimulating);
  const setEVASimulating = useMapStore(s => s.setEVASimulating);
  const activeContingency = useMapStore(s => s.activeContingency);
  const setContingencyModalOpen = useMapStore(s => s.setContingencyModalOpen);
  const rightSidebarOpen = useMapStore(s => s.rightSidebarOpen);
  const setRightSidebarOpen = useMapStore(s => s.setRightSidebarOpen);
  const isAudioActive = useMapStore(s => s.isAudioActive);
  const toggleAudio = useMapStore(s => s.toggleAudio);
  const setFlightPlanOpen = useMapStore(s => s.setFlightPlanOpen);
  const user = useMapStore(s => s.user);
  const profile = useMapStore(s => s.profile);
  const setAuthModalOpen = useMapStore(s => s.setAuthModalOpen);
  const setProfileModalOpen = useMapStore(s => s.setProfileModalOpen);

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.error(e));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const scrollToSection = (id) => {
    marsAudio.playUiClick?.();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const viewModes = [
    { id: '2d', icon: Hexagon, label: '2D' },
    { id: '3d', icon: Hexagon, label: '3D' },
    { id: 'split', icon: Menu, label: 'SPLIT' }
  ];

  const navItems = [
    { id: 'section-home', key: 'home', label: 'Mission Overview', shortLabel: 'Overview', icon: Compass, accent: 'text-cyan-400' },
    { id: 'section-map', key: 'map', label: 'Telemetry & Map', shortLabel: 'Map', icon: MapIcon, accent: 'text-[#F16938]' },
    { id: 'section-imagery', key: 'imagery', label: 'Science & Imagery', shortLabel: 'Science', icon: ImageIcon, accent: 'text-purple-400' },
    { id: 'section-sky', key: 'sky', label: 'Deep Space & Sky', shortLabel: 'Sky', icon: Sparkles, accent: 'text-amber-400' },
  ];

  return (
    <header className="relative z-50 pointer-events-none w-full">
      <div className="mt-3.5 mx-auto max-w-[1400px] h-14 w-[calc(100%-2rem)] rounded-2xl border border-white/[0.08] flex items-center justify-between px-3.5 z-50 shrink-0 bg-[#07090E]/85 backdrop-blur-2xl relative shadow-[0_8px_32px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.06)] gap-3 transition-all hover:bg-[#07090E]/95 pointer-events-auto">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => {
              marsAudio.playQuindarTone?.(false);
              scrollToSection('section-home');
            }} 
            title="Return to Mission Overview"
          >
            <img src="/mars-logo.svg" alt="NASA" className="h-6 w-auto drop-shadow-[0_0_8px_rgba(244,112,80,0.8)] group-hover:scale-105 transition-transform" />
            <div className="flex flex-col hidden sm:flex">
              <h1 className="text-stone-100 font-display font-black text-sm leading-tight tracking-[0.18em] uppercase group-hover:text-white transition-colors">
                MarsWalk
              </h1>
              <span className="text-[#F16938] font-mono font-semibold text-[9px] tracking-[0.25em] uppercase">
                Explorer
              </span>
            </div>
          </div>
        </div>

        {/* Center: Main Section Navigation (Clean, single-line, active-highlighted) */}
        <div className="flex-1 flex justify-center items-center gap-1.5 sm:gap-2 px-1 overflow-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-[0.08em] flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                  isActive
                    ? 'bg-[#F16938]/20 text-stone-100 border-[#F16938]/60 shadow-[0_0_12px_rgba(241,105,56,0.25)] font-bold'
                    : 'bg-white/[0.02] hover:bg-[#101522]/80 text-stone-400 hover:text-white border-white/[0.05] hover:border-white/15 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F16938]' : item.accent}`} />
                <span className="hidden md:inline">{item.label}</span>
                <span className="inline md:hidden">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Contextual Tools (Map-only tools hidden when outside map) */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Universal Ambient Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`px-2.5 py-1.5 border rounded-xl text-xs font-mono font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all backdrop-blur-md cursor-pointer ${
              isAudioActive
                ? 'bg-amber-950/40 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,166,35,0.2)] font-semibold'
                : 'bg-white/[0.02] hover:bg-[#101522]/85 border-white/[0.06] hover:border-white/15 text-stone-400 hover:text-stone-200'
            }`}
            title={isAudioActive ? 'Mute Martian Soundscape' : 'Enable Ambient Martian Soundscape'}
          >
            {isAudioActive ? <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{isAudioActive ? 'Sound ON' : 'Sound'}</span>
          </button>

          {/* OUTSIDE MAP: Sleek Direct "Launch Map" CTA */}
          {!isMapActive && (
            <button
              onClick={() => {
                marsAudio.playQuindarTone?.(true);
                scrollToSection('section-map');
              }}
              className="group px-3.5 py-1.5 rounded-xl bg-[#F16938]/15 hover:bg-[#F16938]/30 border border-[#F16938]/40 hover:border-[#F16938]/80 text-stone-100 font-mono text-xs font-semibold uppercase tracking-[0.1em] flex items-center gap-1.5 shadow-[0_0_12px_rgba(241,105,56,0.18)] transition-all cursor-pointer backdrop-blur-md"
            >
              <Compass className="w-3.5 h-3.5 text-[#F16938] group-hover:rotate-45 transition-transform" />
              <span className="hidden sm:inline">Launch Map</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          )}

          {/* INSIDE MAP: Contextual Map & Flight Operations Tools */}
          <AnimatePresence>
            {isMapActive && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                {/* NASA Flight Plan Briefing */}
                <button
                  onClick={() => setFlightPlanOpen(true)}
                  className="px-2.5 py-1.5 border rounded-xl text-xs font-mono font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all bg-white/[0.02] hover:bg-[#101522]/85 border-white/[0.06] hover:border-cyan-500/40 text-stone-300 hover:text-white backdrop-blur-md cursor-pointer whitespace-nowrap"
                  title="Open NASA Astronaut Flight Plan & Briefing Package"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden xl:inline">Briefing</span>
                </button>

                {/* Contingency Simulator */}
                <button
                  onClick={() => setContingencyModalOpen(true)}
                  className={`px-2.5 py-1.5 border rounded-xl text-xs font-mono font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all backdrop-blur-md cursor-pointer whitespace-nowrap ${
                    activeContingency
                      ? 'bg-rose-950/60 text-rose-200 border-rose-500/60 shadow-[0_0_16px_rgba(244,63,94,0.4)] animate-pulse font-semibold'
                      : 'bg-white/[0.02] hover:bg-[#101522]/85 border-white/[0.06] hover:border-rose-500/40 text-stone-300 hover:text-white'
                  }`}
                  title="NASA What-If Contingency Simulator"
                >
                  <ShieldAlert className={`w-3.5 h-3.5 ${activeContingency ? 'text-rose-200' : 'text-rose-400'}`} />
                  <span className="hidden xl:inline">{activeContingency ? 'ALERT ACTIVE' : 'Contingency'}</span>
                </button>

                {/* HUD Telemetry Feed Toggle */}
                <button
                  onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                  className={`px-2.5 py-1.5 border rounded-xl text-xs font-mono font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all backdrop-blur-md cursor-pointer whitespace-nowrap ${
                    rightSidebarOpen
                      ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(0,255,204,0.2)] font-semibold'
                      : 'bg-white/[0.02] hover:bg-[#101522]/85 border-white/[0.06] hover:border-cyan-500/40 text-stone-300 hover:text-white'
                  }`}
                  title="Toggle Right HUD Telemetry"
                >
                  <Radar className="w-3.5 h-3.5 text-cyber-cyan" />
                  <span className="hidden lg:inline">HUD Feed</span>
                </button>

                {/* EVA HUD */}
                <button
                  onClick={() => setEVASimulating(!isEVASimulating)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-[0.14em] flex items-center gap-1.5 transition-all backdrop-blur-md border cursor-pointer whitespace-nowrap ${
                    isEVASimulating
                      ? 'bg-rose-950/70 hover:bg-rose-900/80 text-white shadow-[0_0_16px_rgba(244,63,94,0.4)] border-rose-500/60 animate-pulse'
                      : 'bg-[#F16938]/20 hover:bg-[#F16938]/35 text-stone-100 border-[#F16938]/50 hover:border-[#F16938]/80 shadow-[0_0_12px_rgba(241,105,56,0.18)]'
                  }`}
                >
                  {isEVASimulating ? <X className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current text-[#F16938]" />}
                  <span className="hidden sm:inline">EVA HUD</span>
                </button>

                {/* Viewport Segmented Switcher (2D / 3D / Split) */}
                <div className="hidden lg:flex items-center bg-[#0B0E17]/80 rounded-xl p-0.5 border border-white/[0.06] shrink-0 whitespace-nowrap backdrop-blur-md">
                  {viewModes.map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setViewMode(id)}
                      className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all text-[11px] font-mono uppercase tracking-wider font-semibold shrink-0 border cursor-pointer ${
                        viewMode === id
                          ? 'bg-[#F16938]/20 text-stone-100 border-[#F16938]/50 shadow-[0_0_8px_rgba(241,105,56,0.2)]'
                          : 'text-stone-400 hover:text-white hover:bg-white/[0.03] border-transparent'
                      }`}
                      title={label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Profile / Auth Button */}
          <button
            onClick={() => user ? setProfileModalOpen(true) : setAuthModalOpen(true)}
            className={`px-2.5 py-1.5 border rounded-xl text-xs font-mono font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all backdrop-blur-md cursor-pointer whitespace-nowrap ${
              user 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-white/[0.02] hover:bg-[#101522]/85 border-white/[0.06] hover:border-mars-500/40 text-stone-300 hover:text-white'
            }`}
            title={user ? 'Astronaut Profile Active' : 'Authenticate Commander'}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{profile?.username || (user ? 'Authenticated' : 'Login')}</span>
          </button>

          {/* Universal Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.02] hover:bg-[#101522]/85 text-stone-400 hover:text-white transition-colors border border-white/[0.06] hover:border-white/15 backdrop-blur-md shrink-0 cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
