import React, { useState, useEffect } from 'react';
import { Map, Box, Columns, Clock, Globe2 } from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { marsDateFromEarthDate } from '../utils/marsUtils';
import { getSolarLongitude, getSolFromDate } from '../data/weatherSimulation';

export default function TopBar() {
  const { viewMode, setViewMode } = useMapStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const md = marsDateFromEarthDate(time);
  const sol = getSolFromDate(time);
  const ls = getSolarLongitude(sol);
  const earthUTC = time.toISOString().substring(11, 19) + ' UTC';

  const viewModes = [
    { id: '2d', icon: Map, label: '2D Map' },
    { id: '3d', icon: Box, label: '3D Globe' },
    { id: 'split', icon: Columns, label: 'Split' },
  ];

  return (
    <header className="h-12 w-full glass-panel-solid border-b border-mars-500/30 flex items-center justify-between px-4 z-50 shrink-0 bg-space-950/90 backdrop-blur-xl">
      {/* Left: Logo */}
      <div className="flex items-center gap-2.5">
        <Globe2 className="text-mars-400 w-5 h-5" />
        <h1 className="font-display text-mars-400 font-bold text-base tracking-widest">
          MARSWALK
        </h1>
        <span className="font-display text-mars-300/60 font-normal text-xs tracking-[0.3em] hidden sm:block">
          EXPLORER
        </span>
      </div>

      {/* Center: Mission Clock */}
      <div className="flex items-center gap-4 text-xs font-mono bg-space-900/60 px-4 py-1.5 rounded-full border border-space-700">
        <div className="flex items-center gap-1.5 text-mars-400">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-semibold">{md.formatted}</span>
        </div>
        <div className="text-primary font-bold text-sm">
          {md.timeFormatted}
        </div>
        <div className="text-space-400 border-l border-space-700 pl-3">
          {earthUTC}
        </div>
        <div className="text-space-400 border-l border-space-700 pl-3">
          Ls {ls.toFixed(1)}°
        </div>
        <div className="flex items-center gap-1.5 border-l border-space-700 pl-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          <span className="text-green-500 text-[10px] font-semibold tracking-[0.15em]">NOMINAL</span>
        </div>
      </div>

      {/* Right: View Modes */}
      <div className="flex items-center gap-0.5 bg-space-900/60 rounded-lg p-0.5 border border-space-700">
        {viewModes.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setViewMode(id)}
            className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all text-xs font-medium ${
              viewMode === id
                ? 'bg-mars-500/20 text-mars-400 shadow-sm'
                : 'text-space-400 hover:text-primary hover:bg-space-800'
            }`}
            title={label}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
