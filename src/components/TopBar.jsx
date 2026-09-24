import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, Box, Columns, Clock, Globe2, Volume2, VolumeX, Play, 
  FlaskConical, Radio, Orbit, Sliders, X, ShieldAlert, FileText, 
  Radar, Camera, ChevronLeft, ChevronRight 
} from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { marsDateFromEarthDate } from '../utils/marsUtils';
import { getSolarLongitude, getSolFromDate } from '../data/weatherSimulation';

export default function TopBar() {
  const { 
    viewMode, 
    setViewMode, 
    isAudioActive, 
    toggleAudio,
    setAudioRackOpen,
    isEVASimulating,
    setEVASimulating, 
    isScienceLabOpen,
    setScienceLabOpen,
    isSkyEphemerisOpen,
    setSkyEphemerisOpen,
    isFlightPlanOpen,
    setFlightPlanOpen,
    activeContingency,
    setContingencyModalOpen,
    rightSidebarOpen,
    setRightSidebarOpen,
    isImageryModalOpen,
    setImageryModalOpen,
  } = useMapStore();
  const [time, setTime] = useState(new Date());
  const opsHubRef = useRef(null);

  const scrollOpsHub = (direction) => {
    if (opsHubRef.current) {
      opsHubRef.current.scrollBy({
        left: direction === 'left' ? -180 : 180,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const md = marsDateFromEarthDate(time);
  const sol = getSolFromDate(time);
  const ls = getSolarLongitude(sol);
  const earthUTC = time.toISOString().substring(11, 19) + ' UTC';

  // Realistic Earth-Mars light-speed comms delay calculation (~14 mins average)
  const commsMinutes = 14;
  const commsSeconds = Math.floor((time.getSeconds() * 0.7 + 22) % 60);

  const viewModes = [
    { id: '2d', icon: Map, label: '2D Map' },
    { id: '3d', icon: Box, label: '3D Globe' },
    { id: 'split', icon: Columns, label: 'Split' },
  ];

  return (
    <header 
      onWheel={(e) => {
        if (e.deltaY !== 0 && e.deltaX === 0) {
          e.currentTarget.scrollLeft += e.deltaY;
        }
      }}
      className="mt-4 mx-4 h-14 w-[calc(100%-2rem)] rounded-2xl border border-white/[0.06] flex items-center justify-between px-3.5 z-50 shrink-0 bg-[#0B0C10]/70 backdrop-blur-3xl relative shadow-hud-glass overflow-x-auto overflow-y-hidden custom-scrollbar-x gap-3 transition-all hover:bg-[#0B0C10]/80"
    >
      {/* Subtle top edge laser line */}
      <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-mars-500/40 to-transparent pointer-events-none" />

      {/* Left: Brand Identity & Audio Control */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-mars-400 to-mars-500 flex items-center justify-center shadow-neon-mars border border-white/15 shrink-0">
            <Globe2 className="text-white w-4.5 h-4.5 animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-display text-transparent bg-clip-text bg-gradient-to-r from-white via-mars-200 to-mars-400 font-bold text-[15px] tracking-[0.15em]">
                MARSWALK
              </span>
              <span className="font-mono text-cyber-cyan/80 text-[10px] tracking-[0.2em] font-semibold">
                OS-26
              </span>
            </div>
            <span className="text-[9px] text-space-300 font-mono tracking-[0.12em] hidden sm:inline">
              NASA Planetary Mission Control
            </span>
          </div>
        </div>

        {/* Tactical Ambient Audio Pill */}
        <div className="flex items-center bg-space-900/70 rounded-xl border border-white/[0.06] p-0.5 shadow-bento shrink-0">
          <button
            onClick={toggleAudio}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              isAudioActive
                ? 'bg-cyber-cyan/10 text-cyber-cyan shadow-neon-cyan border border-cyber-cyan/25'
                : 'text-space-300 hover:text-white hover:bg-space-800/50 border border-transparent'
            }`}
            title="Toggle Ambient Martian Audio (Wind, Life Support & Geiger)"
          >
            {isAudioActive ? (
              <div className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-cyber-cyan shrink-0" />
                <div className="flex items-end gap-[2px] h-3 px-0.5">
                  <span className="w-[2px] bg-cyber-cyan rounded-full eq-bar-1" />
                  <span className="w-[2px] bg-cyber-cyan rounded-full eq-bar-2" />
                  <span className="w-[2px] bg-cyber-cyan rounded-full eq-bar-3" />
                  <span className="w-[2px] bg-cyber-cyan rounded-full eq-bar-4" />
                </div>
              </div>
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="hidden xl:inline text-[11px] font-semibold">{isAudioActive ? 'AUDIO ON' : 'AUDIO'}</span>
          </button>
          
          <button
            onClick={() => setAudioRackOpen(true)}
            className="p-1 hover:text-cyan-300 text-space-400 border-l border-white/[0.08] transition-colors rounded-r"
            title="Open Audio Synthesizer Rack"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Mission Control Flight Deck Telemetry Capsule */}
      <div className="hidden lg:flex items-center gap-3.5 text-xs font-mono bg-space-900/80 px-4 py-1.5 rounded-2xl border border-white/[0.06] shadow-hud-glass backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-1.5 text-mars-400 font-semibold">
          <Clock className="w-3.5 h-3.5 text-mars-400" />
          <span>{md.formatted}</span>
        </div>
        <div className="text-white font-bold text-sm tracking-wider font-mono">
          {md.timeFormatted}
        </div>
        <div className="text-space-300 border-l border-white/[0.06] pl-3 text-[11px]">
          {earthUTC}
        </div>
        <div className="text-space-300 border-l border-white/[0.06] pl-3 text-[11px] flex items-center gap-1">
          <span className="text-cyber-amber font-medium">Ls</span> {ls.toFixed(1)}°
        </div>
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-space-300 border-l border-white/[0.06] pl-3" title="One-way light time speed from Mars to NASA Houston DSN">
          <Radio className="w-3 h-3 text-cyber-amber animate-pulse" />
          <span>DSN: {commsMinutes}m {commsSeconds}s</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-white/[0.06] pl-3">
          <span className="status-dot active" />
          <span className="text-cyber-cyan text-[10px] font-bold tracking-widest uppercase glow-text-cyan">NOMINAL</span>
        </div>
      </div>

      {/* Right: Operations Suite & Viewport Switcher */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Operations Hub (Lab, Sky, Contingency, Brief, Imagery, HUD) with Horizontal Scroll Bar */}
        <div className="flex items-center bg-space-900/60 p-0.5 rounded-xl border border-white/[0.06] shadow-bento">
          <button
            onClick={() => scrollOpsHub('left')}
            className="w-5 h-7 flex items-center justify-center text-space-400 hover:text-white hover:bg-space-800/60 rounded-l transition-colors shrink-0"
            title="Scroll Operations Left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div 
            ref={opsHubRef}
            onWheel={(e) => {
              if (e.deltaY !== 0 && e.deltaX === 0) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
            className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden custom-scrollbar-x py-0.5 px-1 max-w-[280px] sm:max-w-[360px] md:max-w-[480px] lg:max-w-[620px] xl:max-w-none whitespace-nowrap scroll-smooth"
          >
            {/* Science Lab */}
            <button
              onClick={() => setScienceLabOpen(!isScienceLabOpen)}
              className={`px-2.5 py-1.5 border rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm shrink-0 whitespace-nowrap ${
                isScienceLabOpen
                  ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-space-900/80 hover:bg-space-850 border-white/[0.08] hover:border-purple-500/40 text-space-200'
              }`}
              title="In-Situ Science Laboratory & SuperCam Spectrometer"
            >
              {isScienceLabOpen ? <X className="w-3.5 h-3.5" /> : <FlaskConical className="w-3.5 h-3.5 text-purple-400" />}
              <span>Science Lab</span>
            </button>

            {/* Martian Sky & Moons */}
            <button
              onClick={() => setSkyEphemerisOpen(!isSkyEphemerisOpen)}
              className={`px-2.5 py-1.5 border rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm shrink-0 whitespace-nowrap ${
                isSkyEphemerisOpen
                  ? 'bg-amber-600 text-white border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-space-900/80 hover:bg-space-850 border-white/[0.08] hover:border-amber-500/40 text-space-200'
              }`}
              title="Martian Sky & Moons (Phobos/Deimos Orbital Ephemeris)"
            >
              {isSkyEphemerisOpen ? <X className="w-3.5 h-3.5" /> : <Orbit className="w-3.5 h-3.5 text-amber-400" />}
              <span>Sky & Moons</span>
            </button>

            {/* What-If Contingency Simulator */}
            <button
              onClick={() => setContingencyModalOpen(true)}
              className={`px-2.5 py-1.5 border rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm shrink-0 whitespace-nowrap ${
                activeContingency
                  ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.6)] animate-pulse'
                  : 'bg-space-900/80 hover:bg-space-850 border-white/[0.08] hover:border-rose-500/40 text-space-200'
              }`}
              title="NASA What-If Contingency & Anomaly Simulator"
            >
              <ShieldAlert className={`w-3.5 h-3.5 ${activeContingency ? 'text-white' : 'text-rose-400'}`} />
              <span>{activeContingency ? 'ALERT ACTIVE' : 'Contingency'}</span>
            </button>

            {/* Flight Plan Brief */}
            <button
              onClick={() => setFlightPlanOpen(!isFlightPlanOpen)}
              className={`px-2.5 py-1.5 border rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm shrink-0 whitespace-nowrap ${
                isFlightPlanOpen
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-space-900/80 hover:bg-space-850 border-white/[0.08] hover:border-cyan-500/40 text-space-200'
              }`}
              title="Official NASA EVA Flight Plan & Checklist"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Flight Brief</span>
            </button>

            {/* NASA HiRISE & Rover Raw Imagery Explorer */}
            <button
              onClick={() => setImageryModalOpen(!isImageryModalOpen)}
              className={`px-2.5 py-1.5 border rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm shrink-0 whitespace-nowrap ${
                isImageryModalOpen
                  ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                  : 'bg-space-900/80 hover:bg-space-850 border-white/[0.08] hover:border-rose-500/40 text-space-200'
              }`}
              title="NASA HiRISE & Rover Raw Imagery Explorer (PDS / Mastcam-Z)"
            >
              <Camera className="w-3.5 h-3.5 text-rose-400" />
              <span>Imagery</span>
            </button>

            {/* HUD Telemetry Feed Toggle */}
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className={`px-2.5 py-1.5 border rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm shrink-0 whitespace-nowrap ${
                rightSidebarOpen
                  ? 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/40 shadow-neon-cyan'
                  : 'bg-space-900/80 hover:bg-space-850 border-white/[0.08] hover:border-cyber-cyan/40 text-space-200'
              }`}
              title="Toggle Right HUD Telemetry & Radar Panel"
            >
              <Radar className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>HUD Feed</span>
            </button>
          </div>

          <button
            onClick={() => scrollOpsHub('right')}
            className="w-5 h-7 flex items-center justify-center text-space-400 hover:text-white hover:bg-space-800/60 rounded-r transition-colors shrink-0"
            title="Scroll Operations Right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Marswalk First-Person Helmet HUD Simulation (Primary CTA) */}
        <button
          onClick={() => setEVASimulating(!isEVASimulating)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-[0.12em] flex items-center gap-1.5 transition-all shadow-lg relative overflow-hidden shrink-0 whitespace-nowrap ${
            isEVASimulating
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-neon-mars ring-2 ring-rose-400/50 animate-pulse'
              : 'bg-gradient-to-r from-mars-400 to-mars-500 hover:brightness-110 text-white shadow-neon-mars border border-white/15'
          }`}
          title={isEVASimulating ? "Exit Marswalk Helmet HUD" : "Launch First-Person Astronaut Helmet EVA HUD"}
        >
          {isEVASimulating ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Exit HUD</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span className="tracking-[0.15em]">EVA HUD</span>
            </>
          )}
        </button>

        {/* Viewport Segmented Switcher (2D / 3D / Split) */}
        <div className="flex items-center bg-space-900/90 rounded-lg p-0.5 border border-white/[0.08] shadow-inner shrink-0 whitespace-nowrap">
          {viewModes.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all text-xs font-mono font-medium shrink-0 ${
                viewMode === id
                  ? 'bg-gradient-to-r from-mars-500/25 to-mars-600/20 text-mars-300 border border-mars-500/40 shadow-[0_0_8px_rgba(244,112,80,0.25)]'
                  : 'text-space-400 hover:text-white hover:bg-space-800/40 border border-transparent'
              }`}
              title={label}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
