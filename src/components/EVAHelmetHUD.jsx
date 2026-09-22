import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Compass, Heart, Wind, ShieldAlert, Navigation, 
  ChevronRight, ChevronLeft, Play, Pause, Radio, Eye, CheckCircle2, AlertTriangle, Mountain
} from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { marsAudio } from '../utils/audioSynthesizer';
import { marsDistance, calculateSlope } from '../utils/marsUtils';

export default function EVAHelmetHUD() {
  const { 
    isEVASimulating, 
    setEVASimulating, 
    waypoints, 
    evaCurrentWaypointIndex, 
    setEVACurrentWaypointIndex,
    weather,
    currentSol
  } = useMapStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [lidarEnabled, setLidarEnabled] = useState(true);
  const [commsLog, setCommsLog] = useState([
    { id: 1, sender: 'CAPCOM (Houston)', text: 'Marswalk Explorer, EVA telemetry is green. Proceed with planned traverse.' },
  ]);

  const canvasRef = useRef(null);

  // Active waypoint and destination waypoint
  const currentWP = (waypoints && waypoints[evaCurrentWaypointIndex]) || { name: 'Landing Point', lat: 18.4447, lon: 77.4508, elevation: -2570 };
  const nextWP = (waypoints && waypoints[evaCurrentWaypointIndex + 1]) || null;

  // Calculate distance & slope to next waypoint
  let distToNextKm = 0;
  let slopeDeg = 0;
  if (nextWP) {
    distToNextKm = marsDistance(currentWP.lat, currentWP.lon, nextWP.lat, nextWP.lon);
    slopeDeg = calculateSlope(currentWP.elevation, nextWP.elevation, distToNextKm * 1000);
  }

  // Astronaut Heart Rate (BPM dynamic with slope)
  const baseHeartRate = 72;
  const currentBPM = Math.round(baseHeartRate + Math.abs(slopeDeg) * 3.5 + (isPlaying ? 15 : 0));

  // Compass Heading calculation
  const headingDeg = nextWP 
    ? Math.round(((Math.atan2(nextWP.lon - currentWP.lon, nextWP.lat - currentWP.lat) * 180 / Math.PI) + 360) % 360)
    : 45;

  // Auto-play traverse timer
  useEffect(() => {
    let timer = null;
    if (isPlaying && waypoints && waypoints.length > 1) {
      timer = setInterval(() => {
        setEVACurrentWaypointIndex((prev) => {
          if (prev < waypoints.length - 1) {
            const nextIdx = prev + 1;
            marsAudio.playQuindarTone(true);
            setCommsLog(c => [
              { id: Date.now(), sender: 'ASTRONAUT 1', text: `Arrived at Waypoint ${nextIdx + 1}: ${waypoints[nextIdx].name}. Slope gradient was ${Math.abs(slopeDeg).toFixed(1)}°.` },
              ...c.slice(0, 4)
            ]);
            return nextIdx;
          } else {
            setIsPlaying(false);
            marsAudio.playQuindarTone(false);
            setCommsLog(c => [
              { id: Date.now(), sender: 'CAPCOM', text: 'Traverse complete. Prepare for habitat airlock ingress.' },
              ...c.slice(0, 4)
            ]);
            return prev;
          }
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, waypoints, slopeDeg, setEVACurrentWaypointIndex]);

  // Animated ECG Oscilloscope on HTML Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      ctx.moveTo(0, mid);
      for (let x = 0; x < width; x++) {
        const offset = (x + step) % 100;
        let y = mid;
        if (offset > 45 && offset < 50) y -= 12; // P wave
        else if (offset >= 50 && offset < 53) y += 6; // Q
        else if (offset >= 53 && offset < 58) y -= 24; // R spike
        else if (offset >= 58 && offset < 62) y += 10; // S
        else if (offset >= 68 && offset < 76) y -= 8; // T wave
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      step = (step + (currentBPM / 40)) % 1000;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentBPM]);

  // Escape key to exit HUD
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEVASimulating(false);
        marsAudio.playQuindarTone(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setEVASimulating]);

  if (!isEVASimulating) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none select-none flex flex-col justify-between font-mono">
      {/* Helmet Visor Curved Edge & Tint Overlay */}
      <div className="absolute inset-0 border-[12px] md:border-[20px] border-black/70 rounded-[28px] md:rounded-[44px] pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.85)] z-10" />
      
      {/* Visor Glass Flare & Reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-500/5 to-amber-500/10 pointer-events-none z-10" />

      {/* LiDAR Wireframe Scan Effect */}
      {lidarEnabled && (
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.06)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-10 animate-pulse" />
      )}

      {/* TOP HUD: Compass, Horizon & Prominent Back Button */}
      <div className="relative z-30 pt-4 px-6 md:px-12 flex items-center justify-between pointer-events-auto">
        {/* Left: EVA Mission Clock */}
        <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-400 text-xs shadow-lg">
          <div className="text-[10px] text-space-400 uppercase">SOL {currentSol} • EVA TIME</div>
          <div className="font-bold text-sm tracking-wider">03:42:19 MTC</div>
        </div>

        {/* Center: 360° Compass Tape */}
        <div className="w-72 md:w-80 bg-black/80 backdrop-blur-md p-2 rounded-xl border border-cyan-500/50 flex flex-col items-center shadow-xl">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
            <Compass className="w-4 h-4 text-cyan-300 animate-spin-slow" />
            <span>BEARING: {headingDeg}° {headingDeg > 315 || headingDeg <= 45 ? 'NORTH' : headingDeg > 45 && headingDeg <= 135 ? 'EAST' : headingDeg > 135 && headingDeg <= 225 ? 'SOUTH' : 'WEST'}</span>
          </div>
          <div className="w-full h-4 relative flex items-center justify-between px-4 text-[9px] text-space-400 border-t border-cyan-500/30 pt-1">
            <span>{((headingDeg - 30 + 360) % 360)}°</span>
            <span className="text-cyan-400 font-bold">▲</span>
            <span>{((headingDeg + 30) % 360)}°</span>
          </div>
        </div>

        {/* Right: PROMINENT BACK TO MAP BUTTON */}
        <button
          onClick={() => {
            setEVASimulating(false);
            marsAudio.playQuindarTone(false);
          }}
          className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-2xl border-2 border-white/60 transition-all pointer-events-auto cursor-pointer"
          title="Exit Marswalk Simulator and return to Map view"
        >
          <X className="w-4 h-4" />
          <span>← BACK TO MAP (ESC)</span>
        </button>
      </div>

      {/* CENTER HUD: Reticle & Artificial Horizon */}
      <div className="relative z-20 flex items-center justify-center my-auto pointer-events-none">
        <div className="relative w-48 h-48 border border-cyan-500/20 rounded-full flex items-center justify-center">
          {/* Pitch lines */}
          <div className="w-24 h-px bg-cyan-400/40" />
          <div className="absolute w-px h-12 bg-cyan-400/40" />
          <div className="absolute w-2 h-2 rounded-full border border-cyan-400" />
          
          {/* Target Waypoint Indicator */}
          {nextWP && (
            <div className="absolute top-4 text-[10px] text-cyan-300 font-bold bg-black/60 px-2 py-0.5 rounded border border-cyan-400/40">
              TARGET: {nextWP.name} ({distToNextKm.toFixed(2)} km)
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM HUD: Telemetry, Traverse Navigation & Radio Transcripts */}
      <div className="relative z-20 pb-10 px-16 flex flex-col md:flex-row items-end justify-between gap-4 pointer-events-auto">
        {/* Left: Astronaut Biometrics & Suit Life Support */}
        <div className="w-80 bg-black/75 backdrop-blur-md p-3.5 rounded-xl border border-green-500/40 text-xs shadow-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-green-400 font-bold border-b border-green-500/30 pb-1">
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>BIOMETRICS • NOMINAL</span>
            </span>
            <span className="font-mono text-sm">{currentBPM} BPM</span>
          </div>

          {/* ECG Canvas */}
          <div className="w-full h-8 bg-black/40 rounded border border-green-900/60 overflow-hidden">
            <canvas ref={canvasRef} width="280" height="32" className="w-full h-full" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-space-900/60 p-1.5 rounded border border-space-800">
              <span className="text-space-400 block">SUIT PRESSURE</span>
              <span className="text-white font-bold">29.6 kPa (4.3 psi)</span>
            </div>
            <div className="bg-space-900/60 p-1.5 rounded border border-space-800">
              <span className="text-space-400 block">O₂ RESERVE</span>
              <span className="text-cyan-400 font-bold">84% (5.8 hrs)</span>
            </div>
            <div className="bg-space-900/60 p-1.5 rounded border border-space-800">
              <span className="text-space-400 block">SUIT THERMAL</span>
              <span className="text-yellow-400 font-bold">+21.2°C (OK)</span>
            </div>
            <div className="bg-space-900/60 p-1.5 rounded border border-space-800">
              <span className="text-space-400 block">MARS AMBIENT</span>
              <span className="text-blue-300 font-bold">-64°C / 642 Pa</span>
            </div>
          </div>
        </div>

        {/* Center: Traverse Step Controller */}
        <div className="flex-1 max-w-md bg-black/75 backdrop-blur-md p-3.5 rounded-xl border border-cyan-500/40 text-xs shadow-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-cyan-500/30 pb-1">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>TRAVERSE: WP {evaCurrentWaypointIndex + 1} OF {waypoints.length || 1}</span>
            </span>
            <span className="text-white text-[11px] truncate max-w-[160px]">{currentWP.name}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-space-300">
            <span>Elev: {currentWP.elevation} m</span>
            <span className={`font-bold ${Math.abs(slopeDeg) > 15 ? 'text-red-400' : Math.abs(slopeDeg) > 5 ? 'text-yellow-400' : 'text-green-400'}`}>
              Slope: {Math.abs(slopeDeg).toFixed(1)}° ({Math.abs(slopeDeg) > 15 ? 'STEEP' : 'SAFE'})
            </span>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <button
              onClick={() => {
                if (evaCurrentWaypointIndex > 0) {
                  setEVACurrentWaypointIndex(evaCurrentWaypointIndex - 1);
                  marsAudio.playQuindarTone(false);
                }
              }}
              disabled={evaCurrentWaypointIndex === 0}
              className="px-3 py-1.5 bg-space-800 hover:bg-space-700 disabled:opacity-30 rounded text-white flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 py-1.5 bg-mars-600 hover:bg-mars-500 text-white font-bold rounded flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'PAUSE WALK' : 'AUTO-MARSWALK'}</span>
            </button>

            <button
              onClick={() => {
                if (evaCurrentWaypointIndex < (waypoints.length - 1)) {
                  setEVACurrentWaypointIndex(evaCurrentWaypointIndex + 1);
                  marsAudio.playQuindarTone(true);
                }
              }}
              disabled={evaCurrentWaypointIndex >= (waypoints.length - 1)}
              className="px-3 py-1.5 bg-space-800 hover:bg-space-700 disabled:opacity-30 rounded text-white flex items-center gap-1 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Houston Radio Transcript & LiDAR Toggle */}
        <div className="w-80 bg-black/75 backdrop-blur-md p-3.5 rounded-xl border border-amber-500/40 text-xs shadow-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-amber-400 font-bold border-b border-amber-500/30 pb-1">
            <span className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>VOICE COMMS (HOUSTON)</span>
            </span>
            <button
              onClick={() => setLidarEnabled(!lidarEnabled)}
              className={`text-[10px] px-1.5 py-0.5 rounded border ${lidarEnabled ? 'bg-green-500/20 text-green-300 border-green-500/40' : 'bg-space-800 text-space-400 border-space-700'}`}
            >
              LiDAR: {lidarEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
            {commsLog.map((log) => (
              <div key={log.id} className="text-[10px] text-space-300 leading-snug">
                <span className="text-amber-400 font-bold">{log.sender}: </span>
                {log.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
