import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Orbit, Eye, Play, Sparkles, Compass, AlertCircle } from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { marsAudio } from '../utils/audioSynthesizer';

export default function MartianSkyEphemeris() {
  const { isSkyEphemerisOpen, setSkyEphemerisOpen, currentSol } = useMapStore();
  const [timeStep, setTimeStep] = useState(0);
  const [isEclipseSimulating, setIsEclipseSimulating] = useState(false);
  const [eclipseProgress, setEclipseProgress] = useState(0); // 0 to 100

  // Animate Phobos & Deimos orbital rotation in the sky dome
  useEffect(() => {
    let anim;
    if (isSkyEphemerisOpen) {
      anim = setInterval(() => {
        setTimeStep((prev) => (prev + 1) % 360);
      }, 100);
    }
    return () => clearInterval(anim);
  }, [isSkyEphemerisOpen]);

  // Phobos Solar Transit (Eclipse) animation
  useEffect(() => {
    let timer;
    if (isEclipseSimulating) {
      setEclipseProgress(0);
      marsAudio.playQuindarTone(true);
      timer = setInterval(() => {
        setEclipseProgress((prev) => {
          if (prev >= 100) {
            setIsEclipseSimulating(false);
            marsAudio.playQuindarTone(false);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isEclipseSimulating]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSkyEphemerisOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSkyEphemerisOpen]);

  if (!isSkyEphemerisOpen) return null;

  // Orbital positions on celestial dome
  // Phobos moves very quickly (7.65 hr period)
  const phobosAngle = (timeStep * 3.5) % 360;
  const phobosX = 140 + Math.cos((phobosAngle * Math.PI) / 180) * 85;
  const phobosY = 140 + Math.sin((phobosAngle * Math.PI) / 180) * 85;

  // Deimos moves slowly (30.3 hr period)
  const deimosAngle = (timeStep * 0.8 + 60) % 360;
  const deimosX = 140 + Math.cos((deimosAngle * Math.PI) / 180) * 115;
  const deimosY = 140 + Math.sin((deimosAngle * Math.PI) / 180) * 115;

  // Sun position
  const sunX = 140;
  const sunY = 70;

  // Earth (visible as bright blue morning/evening star)
  const earthX = 65;
  const earthY = 110;

  // Eclipse silhouette position (X from 60 to 220, Y ~ 70)
  const transitX = 60 + (eclipseProgress / 100) * 160;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) setSkyEphemerisOpen(false);
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono text-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel-solid w-full max-w-4xl rounded-2xl border-2 border-amber-500/60 p-6 bg-space-950 shadow-2xl flex flex-col gap-5 text-primary relative z-10"
      >
        {/* Header with prominent Back button */}
        <div className="flex items-center justify-between pb-3 border-b border-space-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Orbit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white tracking-wider flex items-center gap-2">
                MARTIAN CELESTIAL EPHEMERIS
                <span className="text-[10px] font-normal text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  Phobos & Deimos Moons
                </span>
              </h2>
              <p className="text-[11px] text-space-400">
                Sol {currentSol} • Local Sky Dome & Solar Transit Simulator (JPL Horizons Model)
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setSkyEphemerisOpen(false)}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg transition-all hover:scale-105 active:scale-95 border border-white/40 cursor-pointer"
            title="Close Ephemeris (ESC)"
          >
            <X className="w-4 h-4" />
            <span>← BACK TO MAP (ESC)</span>
          </button>
        </div>

        {/* Content Body: Sky Dome + Solar Eclipse Simulator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: Interactive Sky Dome View */}
          <div className="bg-space-900/60 p-4 rounded-xl border border-space-800 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-space-400 text-[10px] uppercase mb-2">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Observer Sky Dome (Zenith View)</span>
              </span>
              <span className="text-amber-400">Real-Time Orbital Motion</span>
            </div>

            <div className="relative w-[280px] h-[280px] rounded-full bg-space-950 border-2 border-space-700 shadow-inner flex items-center justify-center overflow-hidden">
              {/* Star dots */}
              <div className="absolute w-1 h-1 bg-white rounded-full top-12 left-16 opacity-60" />
              <div className="absolute w-1 h-1 bg-white rounded-full top-20 right-14 opacity-75" />
              <div className="absolute w-1 h-1 bg-white rounded-full bottom-16 left-28 opacity-50" />
              <div className="absolute w-1 h-1 bg-white rounded-full bottom-24 right-20 opacity-80" />

              {/* Cardinal directions */}
              <span className="absolute top-2 text-[10px] font-bold text-space-500">NORTH</span>
              <span className="absolute bottom-2 text-[10px] font-bold text-space-500">SOUTH</span>
              <span className="absolute left-2 text-[10px] font-bold text-space-500">WEST (Rise)</span>
              <span className="absolute right-2 text-[10px] font-bold text-space-500">EAST (Set)</span>

              {/* Altitude Rings */}
              <div className="absolute w-44 h-44 rounded-full border border-space-800/80 border-dashed" />
              <div className="absolute w-20 h-20 rounded-full border border-space-800/60 border-dashed" />

              {/* The Sun */}
              <div 
                className="absolute w-6 h-6 rounded-full bg-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.9)] flex items-center justify-center"
                style={{ left: sunX - 12, top: sunY - 12 }}
              >
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>

              {/* Phobos (Fast, Inner Moon) */}
              <div 
                className="absolute flex items-center gap-1 group cursor-pointer transition-all duration-100"
                style={{ left: phobosX - 8, top: phobosY - 8 }}
              >
                <div className="w-4 h-3 rounded-full bg-neutral-400 border border-neutral-300 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                <span className="text-[9px] bg-space-900/90 text-amber-300 px-1 rounded border border-amber-500/40 pointer-events-none whitespace-nowrap">
                  Phobos (7.6h)
                </span>
              </div>

              {/* Deimos (Slow, Outer Moon) */}
              <div 
                className="absolute flex items-center gap-1 group cursor-pointer transition-all duration-100"
                style={{ left: deimosX - 6, top: deimosY - 6 }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-500 border border-neutral-400" />
                <span className="text-[9px] bg-space-900/90 text-cyan-300 px-1 rounded border border-cyan-500/40 pointer-events-none whitespace-nowrap">
                  Deimos (30.3h)
                </span>
              </div>

              {/* Earth (Luminous Morning Star) */}
              <div 
                className="absolute flex items-center gap-1"
                style={{ left: earthX, top: earthY }}
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8] animate-pulse" />
                <span className="text-[9px] text-cyan-400 font-bold">Earth 🌍</span>
              </div>
            </div>

            <p className="text-[10px] text-space-400 text-center mt-3 max-w-xs">
              Due to tidal orbital decay, <strong>Phobos orbits faster than Mars rotates</strong>, rising in the West and setting in the East twice each Martian Sol!
            </p>
          </div>

          {/* Right: Phobos Solar Transit (Eclipse) Simulator */}
          <div className="bg-space-900/60 p-4 rounded-xl border border-space-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-space-300 font-bold flex items-center gap-1.5 text-xs">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Phobos Solar Eclipse Simulation</span>
              </span>
              <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                Mastcam-Z Event
              </span>
            </div>

            <p className="text-[11px] text-space-400 leading-relaxed">
              Perseverance and Curiosity frequently record Phobos transiting the Sun. Unlike Earth eclipses, Phobos is too small to cover the entire disk, creating a rapid "ring-of-fire" transit lasting only ~35 seconds.
            </p>

            {/* Transit Animation Box */}
            <div className="w-full h-36 bg-black rounded-xl border border-space-800 relative flex items-center justify-center overflow-hidden">
              {/* Solar disk */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-white shadow-[0_0_40px_rgba(245,158,11,0.6)] flex items-center justify-center relative">
                {/* Sunspots */}
                <div className="absolute top-6 left-8 w-1 h-1 rounded-full bg-amber-900" />
                <div className="absolute bottom-8 right-6 w-1.5 h-1 rounded-full bg-amber-900" />
              </div>

              {/* Transiting Phobos Silhouette */}
              <motion.div
                className="absolute w-12 h-9 bg-black rounded-[45%_55%_60%_40%] shadow-lg border border-black"
                style={{
                  left: transitX,
                  top: 50,
                  display: isEclipseSimulating || eclipseProgress > 0 ? 'block' : 'none'
                }}
              />

              {isEclipseSimulating && (
                <div className="absolute bottom-2 right-3 text-[10px] text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-amber-500/40">
                  Solar Irradiance: {Math.max(340, Math.round(590 - Math.sin((eclipseProgress / 100) * Math.PI) * 240))} W/m²
                </div>
              )}
            </div>

            {/* Simulator Action Button */}
            <button
              onClick={() => setIsEclipseSimulating(true)}
              disabled={isEclipseSimulating}
              className="w-full py-2 bg-gradient-to-r from-amber-600 to-mars-600 hover:from-amber-500 hover:to-mars-500 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isEclipseSimulating ? 'Simulating Transit...' : 'Simulate Phobos Solar Transit'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
              <div className="bg-space-950/60 p-2 rounded border border-space-800">
                <span className="text-space-400 block">PHOBOS ORBITAL PERIOD</span>
                <span className="text-white font-bold">7h 39m (2.3 transits/sol)</span>
              </div>
              <div className="bg-space-950/60 p-2 rounded border border-space-800">
                <span className="text-space-400 block">DEIMOS ORBITAL PERIOD</span>
                <span className="text-white font-bold">30h 18m (0.8 transits/sol)</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
