import React, { useState, useEffect } from 'react';
import { Map, Box, Columns, Clock, Globe2, Volume2, VolumeX, Play, FlaskConical, Radio, Orbit, Sliders, X } from 'lucide-react';
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
  } = useMapStore();
  const [time, setTime] = useState(new Date());

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
    <header className="h-12 w-full glass-panel-solid border-b border-mars-500/30 flex items-center justify-between px-3 z-50 shrink-0 bg-space-950/95 backdrop-blur-xl">
      {/* Left: Logo & Audio Control */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <Globe2 className="text-mars-400 w-5 h-5 shrink-0" />
          <h1 className="font-display text-mars-400 font-bold text-base tracking-widest leading-none">
            MARSWALK
          </h1>
          <span className="font-display text-mars-300/60 font-normal text-[11px] tracking-[0.25em] hidden lg:inline">
            EXPLORER
          </span>
        </div>

        {/* Audio Toggle & Rack Trigger */}
        <div className="flex items-center bg-space-900/60 rounded-md border border-space-800 p-0.5">
          <button
            onClick={toggleAudio}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-all ${
              isAudioActive
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-space-400 hover:text-white'
            }`}
            title="Toggle Martian Ambient Audio"
          >
            {isAudioActive ? <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAudioActive ? 'AUDIO ON' : 'AUDIO OFF'}</span>
          </button>
          
          <button
            onClick={() => setAudioRackOpen(true)}
            className="p-1 hover:text-cyan-300 text-space-400 border-l border-space-800 transition-colors"
            title="Open Audio Mixer & Visualizer Console"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Mission Clock & Systems Status */}
      <div className="hidden md:flex items-center gap-3 text-xs font-mono bg-space-900/70 px-3.5 py-1.5 rounded-full border border-space-700/70">
        <div className="flex items-center gap-1.5 text-mars-400">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-semibold">{md.formatted}</span>
        </div>
        <div className="text-white font-bold text-sm">
          {md.timeFormatted}
        </div>
        <div className="text-space-400 border-l border-space-700 pl-2.5 text-[11px]">
          {earthUTC}
        </div>
        <div className="text-space-400 border-l border-space-700 pl-2.5 text-[11px]">
          Ls {ls.toFixed(1)}°
        </div>
        <div className="hidden xl:flex items-center gap-1 text-[11px] text-space-400 border-l border-space-700 pl-2.5" title="One-way light time speed from Mars to NASA Houston DSN">
          <Radio className="w-3 h-3 text-amber-400" />
          <span>DSN: {commsMinutes}m {commsSeconds}s</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-space-700 pl-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.7)]" />
          <span className="text-green-500 text-[10px] font-semibold tracking-wider">NOMINAL</span>
        </div>
      </div>

      {/* Right: Sky Ephemeris, Science Lab, Marswalk Sim & View Modes */}
      <div className="flex items-center gap-2">
        {/* Martian Sky & Moons Ephemeris Trigger */}
        <button
          onClick={() => setSkyEphemerisOpen(!isSkyEphemerisOpen)}
          className={`px-2.5 py-1.5 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            isSkyEphemerisOpen
              ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 ring-2 ring-amber-400/50'
              : 'bg-gradient-to-r from-amber-950/60 to-amber-900/60 hover:from-amber-900 hover:to-amber-800 border-amber-500/40 text-amber-200'
          }`}
          title="Toggle Martian Sky & Moons (Phobos/Deimos) Ephemeris"
        >
          {isSkyEphemerisOpen ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Close Sky</span>
            </>
          ) : (
            <>
              <Orbit className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Sky & Moons</span>
            </>
          )}
        </button>

        {/* Science Lab Modal Trigger */}
        <button
          onClick={() => setScienceLabOpen(!isScienceLabOpen)}
          className={`px-2.5 py-1.5 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            isScienceLabOpen
              ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 ring-2 ring-purple-400/50'
              : 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 border-purple-500/40 text-purple-200'
          }`}
          title="Toggle In-Situ Science Laboratory & SuperCam Spectrometer"
        >
          {isScienceLabOpen ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Close Lab</span>
            </>
          ) : (
            <>
              <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Science Lab</span>
            </>
          )}
        </button>

        {/* Marswalk Simulator Button / Exit HUD */}
        <button
          onClick={() => setEVASimulating(!isEVASimulating)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
            isEVASimulating
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 ring-2 ring-red-400 animate-pulse'
              : 'bg-gradient-to-r from-mars-600 to-amber-600 hover:from-mars-500 hover:to-amber-500 text-white shadow-mars-600/25'
          }`}
          title={isEVASimulating ? "Exit Marswalk Helmet HUD" : "Launch First-Person Astronaut Helmet EVA HUD"}
        >
          {isEVASimulating ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>← Exit HUD</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Marswalk HUD</span>
            </>
          )}
        </button>

        {/* 2D / 3D / Split Switcher */}
        <div className="flex items-center gap-0.5 bg-space-900/60 rounded-lg p-0.5 border border-space-700">
          {viewModes.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all text-xs font-medium ${
                viewMode === id
                  ? 'bg-mars-500/20 text-mars-400 shadow-sm'
                  : 'text-space-400 hover:text-white hover:bg-space-800'
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
