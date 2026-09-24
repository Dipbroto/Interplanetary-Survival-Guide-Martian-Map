import React from 'react';
import useMapStore from '../store/useMapStore';
import { Crosshair, MapPin } from 'lucide-react';
import { getElevation } from '../utils/elevationService';
import ProvenanceBadge from './ProvenanceBadge';

const formatCoord = (val, isLat) => {
  if (val === undefined || val === null || isNaN(val)) return '0.0000°';
  if (isLat) {
    const clamped = Math.max(-90, Math.min(90, val));
    const dir = clamped >= 0 ? 'N' : 'S';
    return `${Math.abs(clamped).toFixed(4)}°${dir}`;
  } else {
    // Normalize longitude to [-180, 180]
    let norm = ((val + 180) % 360);
    if (norm < 0) norm += 360;
    norm = norm - 180;
    const dir = norm >= 0 ? 'E' : 'W';
    return `${Math.abs(norm).toFixed(4)}°${dir}`;
  }
};

const CoordinateDisplay = () => {
  const cursorPosition = useMapStore(state => state.cursorPosition) || { lat: 0, lon: 0 };
  const isPlacingWaypoint = useMapStore(state => state.isPlacingWaypoint);
  const rightSidebarOpen = useMapStore(state => state.rightSidebarOpen);
  const bottomPanelOpen = useMapStore(state => state.bottomPanelOpen);
  
  // Real MOLA terrain elevation
  const elevation = getElevation(cursorPosition.lat, cursorPosition.lon);

  return (
    <div 
      style={{
        position: 'absolute',
        bottom: bottomPanelOpen ? 310 : 54,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 400,
        transition: 'bottom 0.25s ease-out'
      }}
      className="hud-bracket bg-[#0B0C10]/95 backdrop-blur-2xl rounded-2xl px-3.5 py-1.5 flex items-center gap-3 border border-white/[0.08] shadow-hud-glass pointer-events-none font-mono text-xs"
    >
      {/* Tactical Crosshair Icon */}
      <div className="relative flex items-center justify-center text-mars-400">
        {isPlacingWaypoint ? (
          <div className="relative">
            <Crosshair size={18} className="animate-spin-slow text-cyber-cyan" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
          </div>
        ) : (
          <div className="p-1.5 rounded-lg bg-mars-400/10 border border-mars-400/25">
            <Crosshair size={16} className="text-mars-400" />
          </div>
        )}
      </div>
      
      {/* Coordinate Telemetry Readout */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-2 tracking-wider">
          <span className="text-cyber-cyan font-bold">{formatCoord(cursorPosition.lat, true)}</span>
          <span className="text-space-500">/</span>
          <span className="text-cyber-cyan font-bold">{formatCoord(cursorPosition.lon, false)}</span>
        </div>
        
        <div className="w-[1px] h-4 bg-white/[0.06]" />
        
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-space-300 uppercase tracking-[0.12em] font-sans">ELEV</span>
          <span className="text-white font-bold">{elevation.toLocaleString()} m</span>
          <ProvenanceBadge type="OBSERVED" size="xs" detail="MOLA" />
        </div>
      </div>
    </div>
  );
};

export default CoordinateDisplay;
