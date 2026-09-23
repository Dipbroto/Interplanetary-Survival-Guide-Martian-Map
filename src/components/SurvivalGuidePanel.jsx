import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Wind, Battery, Droplets, Activity, AlertTriangle, 
  Flame, Radio, Heart, Compass, CheckCircle2, ChevronRight, Zap,
  Thermometer, Gauge, Sparkles, RefreshCw
} from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { marsAudio } from '../utils/audioSynthesizer';

// Circular Progress Component with Glowing SVGs
const CircularProgress = ({ value, max = 100, size = 68, strokeWidth = 5, color = '#00FFCC', glow = 'rgba(0,255,204,0.4)', label, unit = '%', sublabel }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center group">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xs font-bold text-white tracking-tight">
            {Math.round(value)}
            <span className="text-[9px] text-space-400 font-normal">{unit}</span>
          </span>
        </div>
      </div>
      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-space-300 mt-1.5 text-center">
        {label}
      </span>
      {sublabel && (
        <span className="text-[9px] font-mono text-space-400 text-center">
          {sublabel}
        </span>
      )}
    </div>
  );
};

// Mini Sparkline SVG Generator
const Sparkline = ({ data, color = '#00FFCC', height = 24, width = 80 }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export default function SurvivalGuidePanel() {
  const { setEVASimulating, setContingencyModalOpen, activeContingency } = useMapStore();
  const [pulseData, setPulseData] = useState([68, 70, 72, 69, 74, 76, 73, 71, 75, 72]);
  const [o2FluxData, setO2FluxData] = useState([0.38, 0.40, 0.41, 0.39, 0.42, 0.40, 0.38, 0.39]);
  const [activeProtocol, setActiveProtocol] = useState(0);

  // Live heart rate micro-oscillation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseData(prev => [...prev.slice(1), Math.floor(70 + Math.random() * 8)]);
      setO2FluxData(prev => [...prev.slice(1), +(0.38 + Math.random() * 0.05).toFixed(2)]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const protocols = [
    {
      id: 'dust-storm',
      code: 'PROT-01',
      title: 'Convective Dust Storm Lockdown',
      level: 'CRITICAL',
      color: '#FF4C29',
      steps: [
        'Halt rover navigation immediately; engage magnetic storm anchors.',
        'Seal suit visors and switch life-support recycling to High-Efficiency Sub-micron Mode.',
        'Orient solar panels vertically to reduce static abrasive dust accumulation.',
        'Broadcast beacon ping on 401.5 MHz UHF to orbiters MRO / TGO.'
      ]
    },
    {
      id: 'subsurface-ice',
      code: 'PROT-02',
      title: 'In-Situ Glacial Ice Extraction',
      level: 'RESOURCE',
      color: '#00FFCC',
      steps: [
        'Deploy Ground-Penetrating Radar (GPR) to verify ice purity at 1.2m depth.',
        'Activate sublimation drill heating element (350 W).',
        'Direct condensation coil vapor into EVA Secondary Hydration Flask #2.',
        'Sample run: 4.8 L/hr water yield at 99.4% purity.'
      ]
    },
    {
      id: 'radiation-spe',
      code: 'PROT-03',
      title: 'Solar Particle Event (SPE) Shelter',
      level: 'HAZARD',
      color: '#F5A623',
      steps: [
        'Identify nearest lava tube entrance or excavate 80cm regolith berm.',
        'Stack hydrogen-rich water bladder garments around suit torso.',
        'Monitor active dosimeter readout; maintain cumulative dose under 25 mSv.',
        'Await NASA DSN all-clear transmission via Houston ground control.'
      ]
    },
    {
      id: 'depressurization',
      code: 'PROT-04',
      title: 'EVA Suit Puncture Seal Drill',
      level: 'EMERGENCY',
      color: '#f43f5e',
      steps: [
        'Locate puncture acoustic hiss using glove pressure sensors.',
        'Apply instant adhesive aerosol seal patch (epoxy cure time: 8s).',
        'Engage emergency O2 secondary canister (10 min high-pressure reserve).',
        'Direct retreat to airlock module with 1.8 km/h max heart rate pacing.'
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Protocol Status Banner */}
      <div className="bento-card p-3.5 relative overflow-hidden border border-white/[0.06] bg-space-900/90 shadow-hud-glass">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-cyan/[0.04] rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan shadow-neon-cyan">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm tracking-wider text-white">
                SURVIVAL PROTOCOLS
              </h3>
              <p className="text-[10px] font-mono text-space-300">
                NASA EVA Life Support & Directives
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-widest uppercase bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
            SYSTEMS NOMINAL
          </span>
        </div>

        {/* Circular Progress Telemetry Matrix (Bento Row) */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.05]">
          <CircularProgress
            value={94}
            size={64}
            strokeWidth={4.5}
            color="#00FFCC"
            glow="rgba(0,255,204,0.4)"
            label="Oxygen (O₂)"
            sublabel="18.2h rem"
          />
          <CircularProgress
            value={82}
            size={64}
            strokeWidth={4.5}
            color="#F5A623"
            glow="rgba(245,166,35,0.4)"
            label="Suit Battery"
            sublabel="2,460 Wh"
          />
          <CircularProgress
            value={76}
            size={64}
            strokeWidth={4.5}
            color="#E27B58"
            glow="rgba(226,123,88,0.4)"
            label="Hydration"
            sublabel="3.0 L res"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/[0.05]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-space-950/60 border border-white/[0.04]">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyber-cyan" />
              <div>
                <div className="text-[10px] font-sans font-bold text-space-200">SUIT PRESSURE</div>
                <div className="text-xs font-mono font-bold text-white">5.2 <span className="text-[9px] text-space-400">psi</span></div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-emerald-400">STABLE</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-space-950/60 border border-white/[0.04]">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-mars-400" />
              <div>
                <div className="text-[10px] font-sans font-bold text-space-200">CORE TEMP</div>
                <div className="text-xs font-mono font-bold text-white">36.8 <span className="text-[9px] text-space-400">°C</span></div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-emerald-400">NORMAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sparkline Biometric Telemetry Card */}
      <div className="bento-card p-3.5 border border-white/[0.06] bg-space-900/85">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-sans font-bold tracking-wider text-space-200 uppercase">
            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Biometric Sparklines</span>
          </div>
          <span className="text-[10px] font-mono text-space-400">REAL-TIME</span>
        </div>

        <div className="space-y-2">
          {/* Heart Rate Sparkline */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-space-950/50 border border-white/[0.03]">
            <div>
              <div className="text-[10px] font-sans text-space-300">Astronaut Pulse</div>
              <div className="text-sm font-mono font-bold text-rose-400">{pulseData[pulseData.length - 1]} <span className="text-[9px] text-space-400">bpm</span></div>
            </div>
            <Sparkline data={pulseData} color="#f43f5e" width={90} height={22} />
          </div>

          {/* O2 Consumption Sparkline */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-space-950/50 border border-white/[0.03]">
            <div>
              <div className="text-[10px] font-sans text-space-300">O₂ Consumption Rate</div>
              <div className="text-sm font-mono font-bold text-cyber-cyan">{o2FluxData[o2FluxData.length - 1]} <span className="text-[9px] text-space-400">L/min</span></div>
            </div>
            <Sparkline data={o2FluxData} color="#00FFCC" width={90} height={22} />
          </div>
        </div>
      </div>

      {/* Emergency Protocols Checklist Bento */}
      <div className="bento-card p-3.5 border border-white/[0.06] bg-space-900/90">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-sans font-bold tracking-wider text-space-200 uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-cyber-amber" />
            <span>Emergency Action Directives</span>
          </h4>
          <span className="text-[10px] font-mono text-cyber-amber font-semibold">NASA SOP</span>
        </div>

        {/* Protocol Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {protocols.map((proto, idx) => (
            <button
              key={proto.id}
              onClick={() => {
                setActiveProtocol(idx);
                marsAudio.playUiClick?.();
              }}
              className={`p-2 rounded-lg text-left transition-all text-xs font-mono border ${
                activeProtocol === idx
                  ? 'bg-space-800/90 text-white border-mars-400/50 shadow-neon-mars'
                  : 'bg-space-950/50 text-space-400 hover:text-white border-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold" style={{ color: proto.color }}>{proto.code}</span>
                <span className="text-[8px] uppercase tracking-wider text-space-400">{proto.level}</span>
              </div>
              <div className="text-[11px] font-sans font-bold truncate mt-0.5 text-white">{proto.title}</div>
            </button>
          ))}
        </div>

        {/* Selected Protocol Steps */}
        <div className="p-3 rounded-xl bg-space-950/80 border border-white/[0.05] space-y-2">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-1.5">
            <span className="text-xs font-sans font-bold text-white">
              {protocols[activeProtocol].title}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: `${protocols[activeProtocol].color}20`, color: protocols[activeProtocol].color }}>
              {protocols[activeProtocol].level}
            </span>
          </div>

          <div className="space-y-1.5">
            {protocols[activeProtocol].steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <span className="w-4 h-4 rounded-full bg-space-850 flex items-center justify-center text-[10px] font-mono font-bold text-space-300 shrink-0 mt-0.5 border border-white/10">
                  {idx + 1}
                </span>
                <span className="text-space-200 text-[11px] leading-tight font-sans">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-white/[0.05]">
          <button
            onClick={() => setContingencyModalOpen(true)}
            className="w-full py-2 px-3 rounded-lg text-xs font-display font-bold uppercase tracking-wider bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulate Anomaly</span>
          </button>

          <button
            onClick={() => setEVASimulating(true)}
            className="w-full py-2 px-3 rounded-lg text-xs font-display font-bold uppercase tracking-wider bg-gradient-to-r from-mars-400 to-mars-500 hover:brightness-110 text-white shadow-neon-mars flex items-center justify-center gap-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Launch Helmet HUD</span>
          </button>
        </div>
      </div>
    </div>
  );
}
