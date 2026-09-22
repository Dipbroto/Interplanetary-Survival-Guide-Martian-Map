import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, FlaskConical, Sparkles, Activity, ShieldCheck, 
  Layers, Database, CheckCircle2, ChevronRight, Zap, AlertCircle 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import useMapStore from '../store/useMapStore';
import { marsAudio } from '../utils/audioSynthesizer';

const ROCK_TARGETS = [
  {
    id: 'jezero-clay',
    name: 'Jezero Delta Mudstone',
    location: 'Skinner Ridge (18.451°N, 77.398°E)',
    formation: 'Deltaic Sedimentary / Lacustrine',
    mineralogy: 'Smectite Clay, Fe-Mg Carbonates, Cryptocrystalline Silica',
    bpi: 92,
    bpiCategory: 'EXTREMELY HIGH',
    description: 'Fine-grained bottomset mudstones deposited in a tranquil ancient lake. Clay minerals excel at trapping and preserving fossilized organic macromolecules.',
    elements: [
      { name: 'SiO2 (Silica)', value: 48, color: '#38bdf8' },
      { name: 'FeO (Iron)', value: 19, color: '#f97316' },
      { name: 'Al2O3 (Alumina)', value: 14, color: '#a855f7' },
      { name: 'MgO (Magnesium)', value: 9, color: '#22c55e' },
      { name: 'CaO (Calcium)', value: 6, color: '#eab308' },
      { name: 'SO3 (Sulfur)', value: 4, color: '#ec4899' },
    ],
    spectrum: [
      { nm: 250, intensity: 12 }, { nm: 280, intensity: 45 }, { nm: 320, intensity: 88 },
      { nm: 380, intensity: 35 }, { nm: 430, intensity: 95 }, { nm: 510, intensity: 62 },
      { nm: 589, intensity: 98 }, { nm: 670, intensity: 40 }, { nm: 740, intensity: 22 }
    ]
  },
  {
    id: 'seitah-olivine',
    name: 'Séítah Cumulate Outcrop',
    location: 'Dourbes Floor (18.441°N, 77.442°E)',
    formation: 'Igneous Magmatic Cumulate',
    mineralogy: 'Coarse-grained Olivine, Augite Pyroxene, Chromite',
    bpi: 34,
    bpiCategory: 'MODERATE - PALEOCLIMATE',
    description: 'Ancient magma chamber cumulate rock that underwent multiple episodes of liquid water interaction, forming carbonate coatings along grain boundaries.',
    elements: [
      { name: 'SiO2 (Silica)', value: 41, color: '#38bdf8' },
      { name: 'FeO (Iron)', value: 24, color: '#f97316' },
      { name: 'MgO (Magnesium)', value: 23, color: '#22c55e' },
      { name: 'CaO (Calcium)', value: 7, color: '#eab308' },
      { name: 'Al2O3 (Alumina)', value: 3, color: '#a855f7' },
      { name: 'SO3 (Sulfur)', value: 2, color: '#ec4899' },
    ],
    spectrum: [
      { nm: 250, intensity: 20 }, { nm: 280, intensity: 30 }, { nm: 320, intensity: 65 },
      { nm: 380, intensity: 92 }, { nm: 430, intensity: 45 }, { nm: 510, intensity: 88 },
      { nm: 589, intensity: 70 }, { nm: 670, intensity: 82 }, { nm: 740, intensity: 35 }
    ]
  },
  {
    id: 'gale-hematite',
    name: 'Vera Rubin Ridge Gray Hematite',
    location: 'Mount Sharp Lower Flank (-4.72°S, 137.35°E)',
    formation: 'Aqueous Hydrothermal & Diagenetic',
    mineralogy: 'Crystalline Hematite (Fe2O3), Jarosite, Gypsum veins',
    bpi: 74,
    bpiCategory: 'HIGH - AQUEOUS RESIDUE',
    description: 'Bedrock cemented by groundwater carrying dissolved iron. The sudden redox change precipitated dense gray hematite, recording active groundwater flow.',
    elements: [
      { name: 'FeO (Iron)', value: 54, color: '#f97316' },
      { name: 'SiO2 (Silica)', value: 26, color: '#38bdf8' },
      { name: 'SO3 (Sulfur)', value: 11, color: '#ec4899' },
      { name: 'Al2O3 (Alumina)', value: 4, color: '#a855f7' },
      { name: 'CaO (Calcium)', value: 3, color: '#eab308' },
      { name: 'MgO (Magnesium)', value: 2, color: '#22c55e' },
    ],
    spectrum: [
      { nm: 250, intensity: 15 }, { nm: 280, intensity: 75 }, { nm: 320, intensity: 98 },
      { nm: 380, intensity: 84 }, { nm: 430, intensity: 60 }, { nm: 510, intensity: 42 },
      { nm: 589, intensity: 85 }, { nm: 670, intensity: 30 }, { nm: 740, intensity: 18 }
    ]
  },
  {
    id: 'olympus-basalt',
    name: 'Olympus Mons Caldera Tholeiite',
    location: 'Caldera Scarp Bench (18.52°N, -133.58°E)',
    formation: 'High-Temperature Volcanic Tholeiite',
    mineralogy: 'Titanomagnetite, Plagioclase Feldspar, Pigeonite',
    bpi: 18,
    bpiCategory: 'LOW - GEOTHERMAL CONTEXT',
    description: 'Pristine unweathered volcanic glass and crystalline basalt from the summit collapse. Key target for dating the planetary mantle cooling history.',
    elements: [
      { name: 'SiO2 (Silica)', value: 50, color: '#38bdf8' },
      { name: 'FeO (Iron)', value: 21, color: '#f97316' },
      { name: 'Al2O3 (Alumina)', value: 12, color: '#a855f7' },
      { name: 'CaO (Calcium)', value: 8, color: '#eab308' },
      { name: 'MgO (Magnesium)', value: 6, color: '#22c55e' },
      { name: 'TiO2 (Titanium)', value: 3, color: '#f43f5e' },
    ],
    spectrum: [
      { nm: 250, intensity: 40 }, { nm: 280, intensity: 60 }, { nm: 320, intensity: 70 },
      { nm: 380, intensity: 80 }, { nm: 430, intensity: 90 }, { nm: 510, intensity: 65 },
      { nm: 589, intensity: 50 }, { nm: 670, intensity: 40 }, { nm: 740, intensity: 25 }
    ]
  }
];

export default function ScienceLabModal() {
  const { isScienceLabOpen, setScienceLabOpen, collectedSamples, addSample, currentSol } = useMapStore();
  const [selectedTarget, setSelectedTarget] = useState(ROCK_TARGETS[0]);
  const [isFiringLaser, setIsFiringLaser] = useState(false);
  const [cachedSuccess, setCachedSuccess] = useState(false);

  if (!isScienceLabOpen) return null;

  const handleFireLaser = () => {
    setIsFiringLaser(true);
    marsAudio.playQuindarTone(true);
    setTimeout(() => {
      setIsFiringLaser(false);
    }, 1200);
  };

  const handleCacheSample = () => {
    const newSample = {
      id: `sample-${Date.now()}`,
      name: selectedTarget.name,
      location: selectedTarget.location,
      sol: currentSol,
      rockType: selectedTarget.formation,
      keyMinerals: selectedTarget.mineralogy,
      biosignatureScore: selectedTarget.bpi,
      status: `Cached in Tube #${collectedSamples.length + 10}`
    };
    addSample(newSample);
    setCachedSuccess(true);
    marsAudio.playQuindarTone(false);
    setTimeout(() => setCachedSuccess(false), 2500);
  };

  // Escape key to close
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setScienceLabOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setScienceLabOpen]);

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) setScienceLabOpen(false);
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel-solid w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col overflow-hidden border-2 border-mars-500/60 shadow-2xl bg-space-950 relative z-10"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-space-800 bg-space-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-mars-500/20 text-mars-400 border border-mars-500/30">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white tracking-wide flex items-center gap-2">
                IN-SITU SCIENCE LABORATORY
                <span className="text-xs font-mono font-normal text-mars-400 bg-mars-950/80 px-2 py-0.5 rounded border border-mars-500/30">
                  SuperCam & PIXL Suite
                </span>
              </h2>
              <p className="text-xs text-space-400 font-mono">
                Laser-Induced Breakdown Spectroscopy (LIBS) & Planetary Astrobiology Caching
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setScienceLabOpen(false)}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg transition-all hover:scale-105 active:scale-95 border border-white/40 cursor-pointer font-mono text-xs"
            title="Close Science Lab (ESC)"
          >
            <X className="w-4 h-4" />
            <span>← BACK TO MAP (ESC)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Rock Target Selection */}
          <div className="w-80 border-r border-space-800 p-4 flex flex-col gap-3 shrink-0 overflow-y-auto custom-scrollbar bg-space-900/30">
            <div className="text-xs font-mono text-space-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-mars-400" />
              <span>Select Geological Target</span>
            </div>

            {ROCK_TARGETS.map((target) => (
              <button
                key={target.id}
                onClick={() => setSelectedTarget(target)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  selectedTarget.id === target.id
                    ? 'bg-mars-500/15 border-mars-500/60 shadow-md shadow-mars-900/20'
                    : 'bg-space-900/40 border-space-800 hover:border-space-700 text-space-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-primary">{target.name}</span>
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                    target.bpi > 70 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    target.bpi > 30 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-space-700/40 text-space-400'
                  }`}>
                    BPI {target.bpi}%
                  </span>
                </div>
                <div className="text-[11px] text-space-400 truncate">{target.formation}</div>
                <div className="text-[10px] text-space-500 font-mono">{target.location}</div>
              </button>
            ))}

            {/* Cached Samples Tube Status */}
            <div className="mt-auto pt-3 border-t border-space-800">
              <div className="text-xs font-mono text-space-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sample Tubes ({collectedSamples.length}/38)</span>
                </span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                {collectedSamples.map((s) => (
                  <div key={s.id} className="text-[11px] p-2 bg-space-800/60 rounded border border-space-700/50 flex flex-col">
                    <span className="font-semibold text-space-200">{s.name}</span>
                    <div className="flex justify-between text-[10px] text-space-400 font-mono mt-0.5">
                      <span>Sol {s.sol}</span>
                      <span className="text-mars-400 font-medium">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Spectrometer Analysis & Biosignature Evaluation */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
            {/* Target Overview Card */}
            <div className="p-4 rounded-xl bg-space-900/60 border border-space-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold font-display text-white">{selectedTarget.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-space-800 text-space-300 font-mono border border-space-700">
                    {selectedTarget.formation}
                  </span>
                </div>
                <p className="text-xs text-space-300 leading-relaxed max-w-2xl">{selectedTarget.description}</p>
                <div className="text-xs text-mars-400 font-mono mt-2">
                  Key Minerals: <span className="text-space-300">{selectedTarget.mineralogy}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col gap-2 shrink-0">
                <button
                  onClick={handleFireLaser}
                  disabled={isFiringLaser}
                  className="px-4 py-2 bg-mars-600 hover:bg-mars-500 disabled:bg-mars-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-mars-600/30 transition-all"
                >
                  <Zap className={`w-4 h-4 ${isFiringLaser ? 'animate-bounce text-yellow-300' : ''}`} />
                  {isFiringLaser ? 'Pulsing Laser...' : 'Fire SuperCam Laser'}
                </button>

                <button
                  onClick={handleCacheSample}
                  disabled={cachedSuccess}
                  className="px-4 py-2 bg-space-800 hover:bg-space-700 text-primary border border-space-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {cachedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Tube Sealed & Cached!</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 text-space-400" />
                      <span>Seal in Sample Tube</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Biosignature Probability Index (BPI) Banner */}
            <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
              selectedTarget.bpi > 70 
                ? 'bg-green-950/20 border-green-500/40' 
                : selectedTarget.bpi > 30 
                ? 'bg-yellow-950/20 border-yellow-500/40'
                : 'bg-space-900/60 border-space-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  selectedTarget.bpi > 70 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase font-mono tracking-wider text-space-400">
                    Astrobiology Biosignature Probability Index (BPI)
                  </div>
                  <div className="text-base font-bold text-white mt-0.5">
                    Rating: <span className={selectedTarget.bpi > 70 ? 'text-green-400' : 'text-yellow-400'}>{selectedTarget.bpiCategory}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-display font-bold text-white">{selectedTarget.bpi}%</div>
                <div className="text-[10px] text-space-400 font-mono">Organic Carbon Retention</div>
              </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LIBS Spectrum Chart */}
              <div className="p-4 rounded-xl bg-space-900/50 border border-space-800 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-space-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-mars-400" />
                    <span>LIBS Emission Spectrum (nm)</span>
                  </span>
                  <span className="text-[10px] text-space-500 font-mono">250nm - 750nm UV-VIS</span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedTarget.spectrum}>
                      <defs>
                        <linearGradient id="spectrumGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f47050" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f47050" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="nm" stroke="#606c8b" fontSize={10} tickLine={false} unit="nm" />
                      <YAxis stroke="#606c8b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#090b14', borderColor: '#2a334a', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="intensity" stroke="#f47050" fillOpacity={1} fill="url(#spectrumGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* PIXL Elemental Composition Chart */}
              <div className="p-4 rounded-xl bg-space-900/50 border border-space-800 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-space-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>PIXL X-Ray Element Abundance (wt%)</span>
                  </span>
                  <span className="text-[10px] text-space-500 font-mono">Calibrated Oxide wt%</span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedTarget.elements} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" stroke="#606c8b" fontSize={10} unit="%" />
                      <YAxis type="category" dataKey="name" stroke="#cbd5e1" fontSize={10} width={90} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#090b14', borderColor: '#2a334a', borderRadius: '8px' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {selectedTarget.elements.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
