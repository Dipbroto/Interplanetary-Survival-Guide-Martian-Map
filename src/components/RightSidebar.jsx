import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar, Radio, Activity, Wind, Thermometer, Gauge, Sun, 
  ChevronRight, ChevronLeft, AlertCircle, Eye, Satellite, 
  Crosshair, ShieldAlert, Zap, Compass, RefreshCw
} from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { marsAudio } from '../utils/audioSynthesizer';
import MissionControlChat from './MissionControlChat';

// Mini Atmospheric Area Graph (SVG)
const AreaGraph = ({ data, color = '#00FFCC', height = 36, unit = '', label = '' }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 160;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="flex flex-col">
      <svg width={width} height={height} className="overflow-visible w-full">
        <defs>
          <linearGradient id={`grad-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon fill={`url(#grad-${label.replace(/\s+/g, '')})`} points={areaPoints} />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
};

export default function RightSidebar() {
  const { 
    rightSidebarOpen = true, 
    setRightSidebarOpen,
    weather,
    activeContingency 
  } = useMapStore();

  const isOpen = rightSidebarOpen !== undefined ? rightSidebarOpen : true;
  const [selectedBlip, setSelectedBlip] = useState(null);
  const [radarAzimuth, setRadarAzimuth] = useState(0);

  // Atmospheric diurnal curves (24 hourly Sol samples)
  const pressureCurve = [618, 616, 614, 612, 610, 608, 606, 608, 611, 614, 617, 620, 622, 621, 619, 618];
  const tempCurve = [-72, -75, -78, -76, -70, -58, -42, -28, -18, -14, -16, -24, -36, -50, -62, -70];

  // Radar contacts on Martian surface around mission zone
  const radarContacts = [
    { id: 'perseverance', name: 'Perseverance (M-02)', dist: 14.2, angle: 38, type: 'rover', color: '#00FFCC', icon: '🚜' },
    { id: 'ice_pocket', name: 'Subsurface Glacial Ice', dist: 8.7, angle: 142, type: 'resource', color: '#38bdf8', icon: '❄️' },
    { id: 'storm_front', name: 'Dust Squall Front Alpha', dist: 28.5, angle: 220, type: 'hazard', color: '#FF4C29', icon: '🌪️' },
    { id: 'curiosity', name: 'Curiosity (M-01)', dist: 42.1, angle: 310, type: 'rover', color: '#F5A623', icon: '🔬' }
  ];

  // Rotating sweep azimuth
  useEffect(() => {
    const timer = setInterval(() => {
      setRadarAzimuth(prev => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 320 : 0, opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={`relative z-20 flex flex-col max-h-[calc(100vh-10rem)] rounded-2xl bg-black/20 backdrop-blur-md shrink-0 overflow-hidden shadow-hud-glass select-none transition-all hover:bg-black/30 ${
        isOpen ? 'border border-cyber-cyan/30' : 'border-none'
      }`}
    >
      <div className="w-[320px] h-full flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="shrink-0 h-11 border-b border-cyber-cyan/20 bg-transparent px-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan shadow-neon-cyan">
              <Radar className="w-3.5 h-3.5" />
            </div>
            <span className="font-display font-bold text-xs tracking-wider text-white">
              HUD TELEMETRY FEED
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
              <span className="text-cyber-cyan font-bold">LIVE</span>
            </div>
            <button
              onClick={() => {
                if (setRightSidebarOpen) setRightSidebarOpen(false);
                marsAudio.playUiClick?.();
              }}
              className="p-1 text-space-400 hover:text-white hover:bg-space-800 rounded transition-colors"
              title="Collapse HUD Feed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Area (Vertical Scrollable) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3.5 custom-scrollbar-y">
          
          {/* MARTIAN RADAR SCANNER (Bento Box) */}
          <div className="p-3 relative border border-cyber-cyan/20 bg-transparent shadow-[0_0_15px_rgba(0,255,204,0.1)] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-sans font-bold tracking-wider text-cyber-cyan uppercase flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
                <span>Surface Proximity Radar</span>
              </span>
              <span className="text-[9px] font-mono text-cyber-cyan/70">RANGE: 50 KM</span>
            </div>

            {/* Radar Scope */}
            <div className="relative w-full aspect-square max-w-[240px] mx-auto rounded-full bg-[#00FFCC]/5 border border-cyber-cyan/30 shadow-[0_0_30px_rgba(0,255,204,0.2)] overflow-hidden">
              {/* Concentric Range Rings */}
              <div className="absolute inset-4 rounded-full border border-cyber-cyan/15 pointer-events-none" />
              <div className="absolute inset-10 rounded-full border border-cyber-cyan/20 pointer-events-none" />
              <div className="absolute inset-16 rounded-full border border-cyber-cyan/25 pointer-events-none" />

              {/* Crosshair Lines */}
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-cyber-cyan/20 pointer-events-none" />
              <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-cyber-cyan/20 pointer-events-none" />

              {/* Cardinal Labels */}
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-cyber-cyan/60 pointer-events-none">000°</span>
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-mono font-bold text-cyber-cyan/60 pointer-events-none">090°</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-cyber-cyan/60 pointer-events-none">180°</span>
              <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] font-mono font-bold text-cyber-cyan/60 pointer-events-none">270°</span>

              {/* Rotating Sweep Beam */}
              <div 
                className="absolute inset-0 pointer-events-none origin-center"
                style={{ transform: `rotate(${radarAzimuth}deg)` }}
              >
                <div 
                  className="w-1/2 h-1/2 origin-bottom-right"
                  style={{
                    background: 'conic-gradient(from 180deg at 100% 100%, rgba(0,255,204,0.4) 0deg, rgba(0,255,204,0) 60deg)'
                  }}
                />
              </div>

              {/* Center Radar Center Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyber-cyan border border-white shadow-neon-cyan z-20" />

              {/* Radar Target Blips */}
              {radarContacts.map(contact => {
                const rad = (contact.angle - 90) * (Math.PI / 180);
                const normalizedDist = (contact.dist / 50) * 44; // Percentage from center (max 44% to stay in circle)
                const left = 50 + Math.cos(rad) * normalizedDist;
                const top = 50 + Math.sin(rad) * normalizedDist;

                return (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setSelectedBlip(contact);
                      marsAudio.playUiClick?.();
                    }}
                    style={{ left: `${left}%`, top: `${top}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-30 cursor-pointer"
                    title={`${contact.name} (${contact.dist} km)`}
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full animate-ping absolute -inset-0.5 opacity-75"
                      style={{ backgroundColor: contact.color }}
                    />
                    <div 
                      className="w-2.5 h-2.5 rounded-full border border-white relative z-10 transition-transform group-hover:scale-150"
                      style={{ backgroundColor: contact.color, boxShadow: `0 0 8px ${contact.color}` }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Selected Blip Telemetry Card */}
            {selectedBlip ? (
              <div className="mt-2.5 p-2 rounded-lg bg-space-950/80 border border-cyber-cyan/30 text-xs font-mono">
                <div className="flex items-center justify-between text-white font-bold mb-0.5">
                  <span className="flex items-center gap-1">
                    <span>{selectedBlip.icon}</span>
                    <span>{selectedBlip.name}</span>
                  </span>
                  <span className="text-[10px] text-cyber-cyan">{selectedBlip.dist} km</span>
                </div>
                <div className="flex justify-between text-[10px] text-space-400">
                  <span>Bearing: {selectedBlip.angle.toString().padStart(3, '0')}°</span>
                  <span className="uppercase">{selectedBlip.type}</span>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-center text-[10px] font-mono text-space-400">
                Click any contact blip on radar for range & azimuth
              </div>
            )}
          </div>

          {/* ATMOSPHERIC TELEMETRY GRAPHS (Bento Box) */}
          <div className="p-3 border border-white/[0.06] bg-transparent rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-sans font-bold tracking-wider text-space-200 uppercase flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-mars-400" />
                <span>Atmospheric Sensors (MEDA)</span>
              </span>
              <span className="text-[9px] font-mono text-cyber-amber">DIURNAL CYCLE</span>
            </div>

            {/* Surface Pressure Area Graph */}
            <div className="p-2.5 rounded-xl bg-space-950/40 border border-white/[0.04] mb-2 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-sans font-semibold text-space-300">Atmospheric Pressure</span>
                <span className="text-xs font-mono font-bold text-cyber-cyan">612.4 <span className="text-[9px] text-space-400 font-normal">Pa</span></span>
              </div>
              <AreaGraph data={pressureCurve} color="#00FFCC" height={32} label="Pressure" />
              <div className="flex justify-between text-[9px] font-mono text-space-400 mt-1">
                <span>00:00 (Sol Min: 606 Pa)</span>
                <span>12:00 (Peak: 622 Pa)</span>
              </div>
            </div>

            {/* Ambient Temperature Graph */}
            <div className="p-2.5 rounded-xl bg-space-950/40 border border-white/[0.04] backdrop-blur-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-sans font-semibold text-space-300">Surface Temperature</span>
                <span className="text-xs font-mono font-bold text-mars-400">-28.5 <span className="text-[9px] text-space-400 font-normal">°C</span></span>
              </div>
              <AreaGraph data={tempCurve} color="#FF4C29" height={32} label="Temperature" />
              <div className="flex justify-between text-[9px] font-mono text-space-400 mt-1">
                <span>Night: -78°C</span>
                <span>Diurnal High: -14°C</span>
              </div>
            </div>
          </div>

          {/* DUST & RADIATION METRICS (Bento Row) */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 border border-white/[0.05] bg-transparent rounded-xl">
              <div className="flex items-center gap-1.5 text-mars-400 mb-1">
                <Wind className="w-3.5 h-3.5" />
                <span className="text-[10px] font-sans font-bold text-space-200">DUST TAU (τ)</span>
              </div>
              <div className="text-sm font-mono font-bold text-white">
                {weather?.dustOpacity ? weather.dustOpacity.toFixed(2) : '0.42'}
              </div>
              <span className="text-[9px] font-mono text-cyber-cyan">Nominal Clearness</span>
            </div>

            <div className="p-2.5 border border-white/[0.05] bg-transparent rounded-xl">
              <div className="flex items-center gap-1.5 text-cyber-amber mb-1">
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[10px] font-sans font-bold text-space-200">SOLAR FLUX</span>
              </div>
              <div className="text-sm font-mono font-bold text-white">
                590 <span className="text-[9px] text-space-400 font-normal">W/m²</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400">88% PV Capacity</span>
            </div>
          </div>

          {/* LIVE TELEMETRY LOG STREAM (Ticker) */}
          <div className="p-2.5 border border-white/[0.05] bg-transparent font-mono text-[10px] rounded-xl">
            <div className="text-[9px] font-bold text-space-400 mb-1.5 flex items-center justify-between uppercase tracking-wider">
              <span>Telemetry Teleprinter</span>
              <span className="text-cyber-cyan">COMM DSN: OK</span>
            </div>
            <div className="space-y-1 text-space-300">
              <div className="truncate"><span className="text-cyber-cyan">[MEDA.MET]</span> Wind 5.4 m/s 138° SE</div>
              <div className="truncate"><span className="text-emerald-400">[RAD.MSL]</span> 0.058 mSv/h background</div>
              <div className="truncate"><span className="text-cyber-amber">[MOXIE.O2]</span> 6.1 g/hr generation</div>
              <div className="truncate"><span className="text-space-400">[ORB.MRO]</span> Pass at 280 km alt nominal</div>
            </div>
          </div>

          <MissionControlChat />
        </div>
      </div>
    </motion.div>
  );
}
