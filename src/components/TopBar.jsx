import React, { useRef } from 'react';
import { 
  Menu, Hexagon, Maximize, Minimize, Settings, ShieldAlert,
  Play, X, Radar, Map as MapIcon, Image as ImageIcon, Sparkles
} from 'lucide-react';
import useMapStore from '../store/useMapStore';

export default function TopBar() {
  const { 
    viewMode, 
    setViewMode,
    isEVASimulating,
    setEVASimulating,
    activeContingency,
    setContingencyModalOpen,
    rightSidebarOpen,
    setRightSidebarOpen
  } = useMapStore();

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
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const viewModes = [
    { id: '2d', icon: Hexagon, label: '2D MAP' },
    { id: '3d', icon: Hexagon, label: '3D GLOBE' },
    { id: 'split', icon: Menu, label: 'SPLIT' }
  ];

  return (
    <header className="relative z-50 pointer-events-none w-full">
      <div className="mt-4 mx-4 h-14 w-[calc(100%-2rem)] rounded-2xl border border-white/[0.06] flex items-center justify-between px-3.5 z-50 shrink-0 bg-[#0B0C10]/70 backdrop-blur-3xl relative shadow-hud-glass gap-3 transition-all hover:bg-[#0B0C10]/80 pointer-events-auto">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('section-map')}>
            <img src="/mars-logo.svg" alt="NASA" className="h-6 w-auto drop-shadow-[0_0_8px_rgba(244,112,80,0.8)]" />
            <div className="flex flex-col hidden sm:flex">
              <h1 className="text-white font-display font-bold text-[13px] leading-tight tracking-[0.15em] uppercase">MarsWalk</h1>
              <span className="text-mars-400 font-mono text-[9px] tracking-widest">Explorer</span>
            </div>
          </div>
        </div>

        {/* Center: Main Navigation (Scrolls to Sections) */}
        <div className="flex-1 flex justify-center items-center gap-2 overflow-x-auto custom-scrollbar-x px-2">
          <button
            onClick={() => scrollToSection('section-map')}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all bg-space-900/80 hover:bg-space-800 text-space-200 hover:text-white border border-white/5 hover:border-mars-500/40"
          >
            <MapIcon className="w-3.5 h-3.5 text-mars-400" />
            <span className="hidden md:inline">Telemetry & Map</span>
          </button>
          
          <button
            onClick={() => scrollToSection('section-imagery')}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all bg-space-900/80 hover:bg-space-800 text-space-200 hover:text-white border border-white/5 hover:border-purple-500/40"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Science & Imagery</span>
          </button>

          <button
            onClick={() => scrollToSection('section-sky')}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all bg-space-900/80 hover:bg-space-800 text-space-200 hover:text-white border border-white/5 hover:border-amber-500/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Deep Space & Sky</span>
          </button>
        </div>

        {/* Right: Quick Tools & Toggles */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Contingency Simulator */}
          <button
            onClick={() => setContingencyModalOpen(true)}
            className={`px-2.5 py-1.5 border rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm ${
              activeContingency
                ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-space-900/80 hover:bg-space-850 border-white/[0.08] hover:border-rose-500/40 text-space-200'
            }`}
            title="NASA What-If Contingency Simulator"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${activeContingency ? 'text-white' : 'text-rose-400'}`} />
            <span className="hidden xl:inline">{activeContingency ? 'ALERT ACTIVE' : 'Contingency'}</span>
          </button>

          {/* HUD Telemetry Feed Toggle */}
          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className={`px-2.5 py-1.5 border rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm ${
              rightSidebarOpen
                ? 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/40 shadow-neon-cyan'
                : 'bg-space-900/80 hover:bg-space-850 border-white/[0.08] hover:border-cyber-cyan/40 text-space-200'
            }`}
            title="Toggle Right HUD Telemetry"
          >
            <Radar className="w-3.5 h-3.5 text-cyber-cyan" />
            <span className="hidden lg:inline">HUD Feed</span>
          </button>

          {/* EVA HUD */}
          <button
            onClick={() => setEVASimulating(!isEVASimulating)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-lg border ${
              isEVASimulating
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-neon-mars border-rose-400/50 animate-pulse'
                : 'bg-gradient-to-r from-mars-400 to-mars-500 hover:brightness-110 text-white shadow-neon-mars border-white/15'
            }`}
          >
            {isEVASimulating ? <X className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span className="hidden sm:inline">EVA HUD</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-space-900/80 hover:bg-space-800 text-space-400 hover:text-white transition-colors border border-white/5"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
