import React from 'react';
import { Compass, ThermometerSun, Wind, Droplets, Activity } from 'lucide-react';
import { playUiClick } from '../utils/audioSynthesizer';

export default function Mars3DViewer() {

  return (
    <div className="w-full h-full relative bg-[#050608] overflow-hidden flex flex-col">
      {/* NASA GLTF Embed Iframe (Realistic 3D Mars) */}
      <iframe 
        src="https://solarsystem.nasa.gov/gltf_embed/2372/" 
        width="100%" 
        height="100%" 
        frameBorder="0" 
        className="absolute inset-0 z-0 pointer-events-auto"
        allow="camera; fullscreen; xr-spatial-tracking"
        title="NASA 3D Mars Model"
      />
      
      {/* Top Telemetry Deck (HUD) */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none z-10 gap-2">
        <div className="flex flex-col gap-2">
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0C10]/90 border border-cyber-cyan/30 shadow-neon-cyan backdrop-blur-xl shrink-0">
            <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-cyber-cyan">
              NASA 3D MODEL ACTIVE
            </span>
            <span className="text-[10px] font-mono text-space-400 border-l border-white/10 pl-2">
              REAL-TIME RENDER
            </span>
          </div>
          
          <div className="pointer-events-auto flex flex-col gap-1.5 bg-[#0B0C10]/80 p-2.5 rounded-xl border border-white/[0.08] backdrop-blur-xl w-[220px]">
            <span className="text-[9px] font-mono text-space-400 uppercase tracking-widest border-b border-white/10 pb-1 mb-1">Planetary Stats</span>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-space-300 font-mono flex items-center gap-1.5"><Compass className="w-3 h-3 text-mars-400"/>Radius</span>
              <span className="text-xs text-white font-mono font-bold">3,389.5 km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-space-300 font-mono flex items-center gap-1.5"><Activity className="w-3 h-3 text-purple-400"/>Gravity</span>
              <span className="text-xs text-white font-mono font-bold">3.721 m/s²</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-space-300 font-mono flex items-center gap-1.5"><ThermometerSun className="w-3 h-3 text-amber-400"/>Avg Temp</span>
              <span className="text-xs text-white font-mono font-bold">-63 °C</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-space-300 font-mono flex items-center gap-1.5"><Droplets className="w-3 h-3 text-cyan-400"/>Atmosphere</span>
              <span className="text-xs text-white font-mono font-bold">95% CO₂</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-space-300 font-mono flex items-center gap-1.5"><Wind className="w-3 h-3 text-rose-400"/>Length of Day</span>
              <span className="text-xs text-white font-mono font-bold">24h 37m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Disclaimer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-[#0B0C10]/80 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md pointer-events-none whitespace-nowrap">
        <span className="text-[10px] font-mono text-space-400">Interactive 3D Model courtesy of NASA Solar System Exploration</span>
      </div>

      {/* Tactical HUD Corner Marks */}
      <div className="absolute top-12 left-4 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan/40 pointer-events-none" />
      <div className="absolute top-12 right-4 w-4 h-4 border-t-2 border-r-2 border-cyber-cyan/40 pointer-events-none" />
      <div className="absolute bottom-16 left-4 w-4 h-4 border-b-2 border-l-2 border-cyber-cyan/40 pointer-events-none" />
      <div className="absolute bottom-16 right-4 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan/40 pointer-events-none" />
    </div>
  );
}
