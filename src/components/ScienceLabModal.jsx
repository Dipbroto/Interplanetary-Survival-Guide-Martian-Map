import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FlaskConical, Sparkles, Activity, ShieldCheck, 
  Layers, Database, CheckCircle2, ChevronRight, Zap, 
  Target, Eye, Radio, Microscope, Sliders, Droplets, 
  Info, RefreshCw, Flame, Award, Atom, Compass, ChevronDown
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import useMapStore from '../store/useMapStore';
import { marsAudio, playLaserZap, playSampleSeal, playUiClick, playUiHover } from '../utils/audioSynthesizer';

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
    surfaceTexture: 'radial-gradient(circle at 35% 45%, #604a3e 0%, #3d2f27 45%, #231914 100%)',
    rockImage: 'https://images-assets.nasa.gov/image/PIA26252/PIA26252~medium.jpg',
    organics: 'Polycyclic aromatic hydrocarbons, aliphatic carboxylic acids',
    elements: [
      { name: 'SiO2 (Silica)', value: 48, color: '#38bdf8' },
      { name: 'FeO (Iron)', value: 19, color: '#f97316' },
      { name: 'Al2O3 (Alumina)', value: 14, color: '#a855f7' },
      { name: 'MgO (Magnesium)', value: 9, color: '#22c55e' },
      { name: 'CaO (Calcium)', value: 6, color: '#eab308' },
      { name: 'SO3 (Sulfur)', value: 4, color: '#ec4899' },
    ],
    spectrum: [
      { nm: 250, intensity: 12, label: 'UV Baseline' },
      { nm: 280, intensity: 48, label: 'C (Organics)' },
      { nm: 320, intensity: 88, label: 'Si (Silica)' },
      { nm: 380, intensity: 35, label: 'Al (Alumina)' },
      { nm: 430, intensity: 95, label: 'Fe (Iron Oxide)' },
      { nm: 510, intensity: 62, label: 'Mg (Magnesium)' },
      { nm: 589, intensity: 98, label: 'Na (Sodium)' },
      { nm: 670, intensity: 40, label: 'Ca (Calcium)' },
      { nm: 740, intensity: 22, label: 'K (Potassium)' }
    ],
    sherlocFluorescence: [
      [10, 20, 15, 85, 90, 20, 10, 5],
      [15, 30, 45, 95, 88, 35, 15, 10],
      [10, 40, 80, 100, 92, 40, 20, 15],
      [20, 35, 75, 85, 70, 30, 15, 10],
      [15, 20, 30, 40, 35, 20, 10, 5],
      [5, 10, 15, 25, 20, 10, 5, 5],
    ]
  },
  {
    id: 'wildcat-ridge',
    name: 'Wildcat Ridge Organic Mudstone',
    location: 'Jezero Delta Front (18.448°N, 77.412°E)',
    formation: 'Aqueous Sulfate Mudstone & Siltstone',
    mineralogy: 'Calcium Sulfate (Sulfate veins), Smectite, Kerogen-like Carbon',
    bpi: 96,
    bpiCategory: 'SIGNATURE DETECTED',
    description: 'Co-located aromatic organic molecules within calcium sulfate minerals. Regarded as having the highest concentration of organic carbon ever detected on Mars.',
    surfaceTexture: 'radial-gradient(circle at 55% 35%, #7a5843 0%, #4a3327 50%, #22140d 100%)',
    rockImage: 'https://images-assets.nasa.gov/image/PIA26574/PIA26574~medium.jpg',
    organics: 'Class-A Aromatic ring compounds correlated with sulfate veins',
    elements: [
      { name: 'SiO2 (Silica)', value: 42, color: '#38bdf8' },
      { name: 'SO3 (Sulfur)', value: 23, color: '#ec4899' },
      { name: 'FeO (Iron)', value: 16, color: '#f97316' },
      { name: 'CaO (Calcium)', value: 11, color: '#eab308' },
      { name: 'Al2O3 (Alumina)', value: 5, color: '#a855f7' },
      { name: 'C (Organics)', value: 3, color: '#00ffcc' },
    ],
    spectrum: [
      { nm: 250, intensity: 22, label: 'UV Baseline' },
      { nm: 280, intensity: 92, label: 'C (Aromatics!)' },
      { nm: 320, intensity: 75, label: 'Si (Silica)' },
      { nm: 380, intensity: 40, label: 'Al (Alumina)' },
      { nm: 430, intensity: 80, label: 'Fe (Iron Oxide)' },
      { nm: 510, intensity: 55, label: 'Mg (Magnesium)' },
      { nm: 589, intensity: 85, label: 'Na (Sodium)' },
      { nm: 670, intensity: 70, label: 'Ca (Calcium)' },
      { nm: 740, intensity: 30, label: 'K (Potassium)' }
    ],
    sherlocFluorescence: [
      [20, 45, 75, 95, 90, 70, 40, 15],
      [35, 80, 98, 100, 95, 85, 60, 25],
      [40, 90, 100, 100, 98, 90, 70, 30],
      [30, 75, 92, 95, 90, 80, 50, 20],
      [20, 50, 70, 80, 75, 55, 30, 15],
      [10, 25, 35, 45, 40, 25, 15, 10],
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
    surfaceTexture: 'radial-gradient(circle at 40% 60%, #4a5c43 0%, #2f3b2b 45%, #151a13 100%)',
    rockImage: 'https://images-assets.nasa.gov/image/PIA10020/PIA10020~small.jpg',
    organics: 'Trace abiotic methane clathrate precursors',
    elements: [
      { name: 'SiO2 (Silica)', value: 41, color: '#38bdf8' },
      { name: 'FeO (Iron)', value: 24, color: '#f97316' },
      { name: 'MgO (Magnesium)', value: 23, color: '#22c55e' },
      { name: 'CaO (Calcium)', value: 7, color: '#eab308' },
      { name: 'Al2O3 (Alumina)', value: 3, color: '#a855f7' },
      { name: 'SO3 (Sulfur)', value: 2, color: '#ec4899' },
    ],
    spectrum: [
      { nm: 250, intensity: 20, label: 'UV Baseline' },
      { nm: 280, intensity: 30, label: 'C (Carbonate)' },
      { nm: 320, intensity: 65, label: 'Si (Silica)' },
      { nm: 380, intensity: 92, label: 'Al (Alumina)' },
      { nm: 430, intensity: 45, label: 'Fe (Iron Oxide)' },
      { nm: 510, intensity: 88, label: 'Mg (Olivine)' },
      { nm: 589, intensity: 70, label: 'Na (Sodium)' },
      { nm: 670, intensity: 82, label: 'Ca (Pyroxene)' },
      { nm: 740, intensity: 35, label: 'K (Potassium)' }
    ],
    sherlocFluorescence: [
      [5, 10, 15, 10, 5, 5, 5, 5],
      [10, 15, 25, 20, 15, 10, 5, 5],
      [15, 20, 35, 30, 20, 15, 10, 5],
      [10, 15, 25, 20, 15, 10, 5, 5],
      [5, 10, 15, 10, 5, 5, 5, 5],
      [5, 5, 5, 5, 5, 5, 5, 5],
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
    surfaceTexture: 'radial-gradient(circle at 60% 40%, #7d3c3c 0%, #4d2323 50%, #200d0d 100%)',
    rockImage: 'https://images-assets.nasa.gov/image/PIA26310/PIA26310~medium.jpg',
    organics: 'Aliphatic organic fragments protected by iron oxide cement',
    elements: [
      { name: 'FeO (Iron)', value: 54, color: '#f97316' },
      { name: 'SiO2 (Silica)', value: 26, color: '#38bdf8' },
      { name: 'SO3 (Sulfur)', value: 11, color: '#ec4899' },
      { name: 'Al2O3 (Alumina)', value: 4, color: '#a855f7' },
      { name: 'CaO (Calcium)', value: 3, color: '#eab308' },
      { name: 'MgO (Magnesium)', value: 2, color: '#22c55e' },
    ],
    spectrum: [
      { nm: 250, intensity: 15, label: 'UV Baseline' },
      { nm: 280, intensity: 75, label: 'C (Carbonate)' },
      { nm: 320, intensity: 98, label: 'Si (Silica)' },
      { nm: 380, intensity: 84, label: 'Al (Alumina)' },
      { nm: 430, intensity: 99, label: 'Fe (Hematite Peak)' },
      { nm: 510, intensity: 42, label: 'Mg (Magnesium)' },
      { nm: 589, intensity: 85, label: 'Na (Sodium)' },
      { nm: 670, intensity: 30, label: 'Ca (Calcium)' },
      { nm: 740, intensity: 18, label: 'K (Potassium)' }
    ],
    sherlocFluorescence: [
      [15, 25, 30, 40, 35, 20, 15, 10],
      [20, 35, 55, 65, 50, 30, 20, 15],
      [25, 45, 75, 80, 65, 40, 25, 15],
      [20, 35, 60, 70, 55, 35, 20, 10],
      [15, 25, 35, 45, 35, 25, 15, 10],
      [10, 15, 20, 25, 20, 15, 10, 5],
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
    surfaceTexture: 'radial-gradient(circle at 45% 45%, #3a3b40 0%, #202126 50%, #0d0e12 100%)',
    rockImage: 'https://images-assets.nasa.gov/image/PIA14564/PIA14564~medium.jpg',
    organics: 'Zero biological organics; primordial mantle volatile traces',
    elements: [
      { name: 'SiO2 (Silica)', value: 50, color: '#38bdf8' },
      { name: 'FeO (Iron)', value: 21, color: '#f97316' },
      { name: 'Al2O3 (Alumina)', value: 12, color: '#a855f7' },
      { name: 'CaO (Calcium)', value: 8, color: '#eab308' },
      { name: 'MgO (Magnesium)', value: 6, color: '#22c55e' },
      { name: 'TiO2 (Titanium)', value: 3, color: '#f43f5e' },
    ],
    spectrum: [
      { nm: 250, intensity: 40, label: 'UV Baseline' },
      { nm: 280, intensity: 60, label: 'C (Carbonate)' },
      { nm: 320, intensity: 70, label: 'Si (Silica)' },
      { nm: 380, intensity: 80, label: 'Al (Alumina)' },
      { nm: 430, intensity: 90, label: 'Fe (Iron Oxide)' },
      { nm: 510, intensity: 65, label: 'Mg (Magnesium)' },
      { nm: 589, intensity: 50, label: 'Na (Sodium)' },
      { nm: 670, intensity: 40, label: 'Ca (Calcium)' },
      { nm: 740, intensity: 25, label: 'K (Potassium)' }
    ],
    sherlocFluorescence: [
      [5, 5, 5, 5, 5, 5, 5, 5],
      [5, 8, 10, 8, 5, 5, 5, 5],
      [5, 10, 12, 10, 8, 5, 5, 5],
      [5, 8, 10, 8, 5, 5, 5, 5],
      [5, 5, 8, 5, 5, 5, 5, 5],
      [5, 5, 5, 5, 5, 5, 5, 5],
    ]
  },
  {
    id: 'polar-ice-core',
    name: 'Planum Boreum Cryo-Core',
    location: 'Korolev Crater Perimeter (73.0°N, 165.0°E)',
    formation: 'Glacial Firn & Basal Ice Core',
    mineralogy: 'H2O Pure Ice (96%), Frozen CO2, Trapped Atmospheric Dust',
    bpi: 88,
    bpiCategory: 'HIGH - CRYOPRESERVED',
    description: 'Subsurface cryogenic ice strata preserving ancient Martian atmospheric gas bubbles, volcanic ash layers, and hyper-preserved prebiotic chemistry.',
    surfaceTexture: 'radial-gradient(circle at 50% 50%, #7dd3fc 0%, #0284c7 40%, #082f49 100%)',
    rockImage: 'https://images-assets.nasa.gov/image/PIA10651/PIA10651~small.jpg',
    organics: 'Cryopreserved amino acid analogs and formaldehyde polymers',
    elements: [
      { name: 'H2O (Ice)', value: 82, color: '#00ffcc' },
      { name: 'CO2 (Dry Ice)', value: 12, color: '#38bdf8' },
      { name: 'Dust (SiO2/Fe)', value: 4, color: '#f97316' },
      { name: 'SO4 (Sulfate)', value: 1.5, color: '#ec4899' },
      { name: 'Prebiotics', value: 0.5, color: '#eab308' },
    ],
    spectrum: [
      { nm: 250, intensity: 90, label: 'Ice Albedo' },
      { nm: 280, intensity: 75, label: 'CO2 Gas' },
      { nm: 320, intensity: 30, label: 'Silica Dust' },
      { nm: 380, intensity: 20, label: 'Alumina' },
      { nm: 430, intensity: 25, label: 'Iron Oxide' },
      { nm: 510, intensity: 45, label: 'Hydrate' },
      { nm: 589, intensity: 30, label: 'Sodium' },
      { nm: 670, intensity: 85, label: 'H2O Absorption' },
      { nm: 740, intensity: 95, label: 'Ice Band' }
    ],
    sherlocFluorescence: [
      [10, 20, 40, 50, 45, 30, 15, 10],
      [20, 50, 75, 85, 80, 60, 35, 15],
      [30, 70, 90, 95, 90, 75, 45, 20],
      [25, 60, 85, 90, 85, 70, 40, 15],
      [15, 35, 55, 65, 60, 45, 25, 10],
      [10, 15, 25, 30, 25, 15, 10, 5],
    ]
  }
];

export default function ScienceLabModal() {
  const { isScienceLabOpen, setScienceLabOpen, collectedSamples = [], addSample, currentSol } = useMapStore();
  const [selectedTarget, setSelectedTarget] = useState(ROCK_TARGETS[0]);
  
  // Active instrument tab: 'supercam' | 'sherloc' | 'pixl' | 'msr'
  const [activeInstrument, setActiveInstrument] = useState('supercam');

  // Laser Targeting Canvas states
  const [laserTargetPos, setLaserTargetPos] = useState({ x: 50, y: 50 });
  const [ablationPits, setAblationPits] = useState([
    { id: 1, x: 45, y: 40, label: '#01 Core Matrix' },
    { id: 2, x: 62, y: 55, label: '#02 Mineral Vein' }
  ]);
  const [isFiringLaser, setIsFiringLaser] = useState(false);
  const [laserBeamActive, setLaserBeamActive] = useState(false);

  // SHERLOC UV Raman states
  const [uvIntensity, setUvIntensity] = useState(85);
  const [uvMode, setUvMode] = useState('organics'); // 'organics' | 'minerals' | 'composite'

  // Paleo-Groundwater pH Simulator
  const [paleoPh, setPaleoPh] = useState(7.2);

  // MSR Tube Sealing State
  const [cachedSuccess, setCachedSuccess] = useState(false);
  const [customTubeNotes, setCustomTubeNotes] = useState('');
  const [isSealingTube, setIsSealingTube] = useState(false);

  // Selected Spectral Peak highlight
  const [highlightedPeak, setHighlightedPeak] = useState(null);

  const target = selectedTarget || ROCK_TARGETS[0];
  const safeSamples = Array.isArray(collectedSamples) ? collectedSamples : [];

  // Reset ablation pits when target changes
  useEffect(() => {
    setAblationPits([
      { id: 1, x: 40 + Math.random() * 20, y: 35 + Math.random() * 20, label: '#01 Primary Spot' }
    ]);
    setHighlightedPeak(null);
  }, [selectedTarget.id]);

  // Click on Rock Surface to Aim and Fire SuperCam Laser
  const handleCanvasClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    
    setLaserTargetPos({ x, y });
    triggerLaserAblation(x, y);
  };

  const triggerLaserAblation = (x, y) => {
    if (isFiringLaser) return;
    setIsFiringLaser(true);
    setLaserBeamActive(true);
    playLaserZap();

    setTimeout(() => {
      setLaserBeamActive(false);
      setIsFiringLaser(false);
      setAblationPits(prev => [
        ...prev.slice(-5), // Keep max 6 recent ablation pits
        { 
          id: Date.now(), 
          x: Math.round(x), 
          y: Math.round(y), 
          label: `#0${prev.length + 1} (${Math.round(x)}µm, ${Math.round(y)}µm)` 
        }
      ]);
    }, 450);
  };

  const handleCacheSample = () => {
    if (isSealingTube) return;
    setIsSealingTube(true);
    playSampleSeal();

    setTimeout(() => {
      const newSample = {
        id: `sample-${Date.now()}`,
        name: target.name,
        location: target.location,
        sol: currentSol || 423,
        rockType: target.formation,
        keyMinerals: target.mineralogy,
        biosignatureScore: target.bpi,
        notes: customTubeNotes || 'Verified hermetic seal under 1.2 bar N2 purge.',
        status: `Cached in MSR Tube #${safeSamples.length + 1}`
      };
      if (addSample) addSample(newSample);
      setIsSealingTube(false);
      setCachedSuccess(true);
      setCustomTubeNotes('');
      setTimeout(() => setCachedSuccess(false), 3000);
    }, 1200);
  };

  // Compute paleo-environmental diagnosis based on pH slider
  const getPaleoEnvironment = (ph) => {
    if (ph < 4.5) {
      return {
        epoch: 'Early Hesperian (Acidic Groundwater)',
        regime: 'Hyper-Acidic Brine (pH ' + ph.toFixed(1) + ')',
        precipitates: 'Jarosite, Ferric Sulfates, Gypsum',
        habitability: 'Extreme Acidophile Chemolithotrophy Only',
        color: 'text-amber-400',
        badge: 'border-amber-500/40 bg-amber-950/40 text-amber-300'
      };
    } else if (ph <= 8.2) {
      return {
        epoch: 'Noachian (Fluvio-Lacustrine Epoch)',
        regime: 'Neutral to Mildly Alkaline Lake (pH ' + ph.toFixed(1) + ')',
        precipitates: 'Smectite Clays, Fe-Mg Carbonates, Silica Gel',
        habitability: 'Optimal for Microorganic Macromolecule Preservation',
        color: 'text-emerald-400',
        badge: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
      };
    } else {
      return {
        epoch: 'Deep Crustal Serpentinization Epoch',
        regime: 'Alkaline Hydrothermal Fluids (pH ' + ph.toFixed(1) + ')',
        precipitates: 'Serpentine, Brucite, Hydrotalcite, Calcite',
        habitability: 'Abiotic Hydrogen & Methane Generation (CH4/H2 Fuel)',
        color: 'text-cyan-400',
        badge: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
      };
    }
  };

  const paleoDiagnosis = getPaleoEnvironment(paleoPh);

  return (
    <AnimatePresence>
      {isScienceLabOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          {/* Dark Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              marsAudio.playUiClick?.();
              setScienceLabOpen(false);
            }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-7xl rounded-3xl flex flex-col overflow-hidden border border-white/10 shadow-2xl bg-[#0B0C10]/95 backdrop-blur-2xl relative z-10 text-white font-sans max-h-[95vh]"
          >
            {/* HEADER: SuperCam & PIXL Rover Science Suite */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-space-900/60 shrink-0 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-mars-500/20 text-[#F16938] border border-mars-500/30 shrink-0 shadow-[0_0_12px_rgba(241,105,56,0.25)]">
                  <FlaskConical className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base sm:text-lg font-display font-black text-stone-100 tracking-[0.14em] uppercase">
                      In-Situ Planetary Science Laboratory
                    </h2>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-800 font-semibold">
                      SuperCam • PIXL • SHERLOC Suite
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 font-mono tracking-wide">
                    Laser-Induced Breakdown Spectroscopy (LIBS) • Deep-UV Raman • Mars Sample Return
                  </p>
                </div>
              </div>

              {/* Instrument Mode Selector Tabs & Close Button */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-[#070A10]/75 p-1 rounded-2xl border border-white/[0.08] font-mono text-xs backdrop-blur-md">
                  <button
                    onClick={() => { setActiveInstrument('supercam'); playUiClick(); }}
                    className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider text-xs border ${
                      activeInstrument === 'supercam'
                        ? 'bg-[#F16938]/20 border-[#F16938]/60 text-stone-100 shadow-[0_0_12px_rgba(241,105,56,0.2)] font-semibold'
                        : 'text-stone-400 hover:text-white border-transparent hover:bg-white/[0.03]'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-[#F16938]" />
                    <span className="hidden sm:inline">SuperCam LIBS</span>
                  </button>

                  <button
                    onClick={() => { setActiveInstrument('sherloc'); playUiClick(); }}
                    className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider text-xs border ${
                      activeInstrument === 'sherloc'
                        ? 'bg-purple-950/40 border-purple-500/50 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)] font-semibold'
                        : 'text-stone-400 hover:text-white border-transparent hover:bg-white/[0.03]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden sm:inline">SHERLOC</span>
                  </button>

                  <button
                    onClick={() => { setActiveInstrument('pixl'); playUiClick(); }}
                    className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider text-xs border ${
                      activeInstrument === 'pixl'
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-[0_0_12px_rgba(0,255,204,0.2)] font-semibold'
                        : 'text-stone-400 hover:text-white border-transparent hover:bg-white/[0.03]'
                    }`}
                  >
                    <Atom className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">PIXL</span>
                  </button>

                  <button
                    onClick={() => { setActiveInstrument('msr'); playUiClick(); }}
                    className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider text-xs border ${
                      activeInstrument === 'msr'
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-[0_0_12px_rgba(245,166,35,0.2)] font-semibold'
                        : 'text-stone-400 hover:text-white border-transparent hover:bg-white/[0.03]'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">MSR Cache ({safeSamples.length})</span>
                  </button>
                </div>
                
                {/* Close Button */}
                <button 
                  onClick={() => {
                    playUiClick?.();
                    setScienceLabOpen(false);
                  }}
                  className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white border border-white/10 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            </div>

        {/* BODY CONTAINER */}
        <div className="flex flex-col lg:flex-row overflow-hidden min-h-[580px]">
          
          {/* LEFT COLUMN: Target Geological Samples Selector */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/[0.08] p-4 flex flex-col gap-2.5 shrink-0 bg-space-950/40">
            <div className="text-xs font-display font-bold text-stone-300 uppercase tracking-[0.14em] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#F16938]" />
                <span>Geological Target Specimens</span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono tracking-wider">6 Cataloged</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[380px] lg:max-h-none custom-scrollbar pr-1">
              {ROCK_TARGETS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTarget(t);
                    playUiClick();
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer backdrop-blur-md ${
                    selectedTarget.id === t.id
                      ? 'bg-[#F16938]/15 border-[#F16938]/60 text-stone-100 shadow-[0_0_12px_rgba(241,105,56,0.18)] scale-[1.01]'
                      : 'bg-[#070A10]/50 border-white/[0.05] hover:border-white/15 text-stone-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-stone-100 tracking-wide">{t.name}</span>
                    <span className={`text-[9px] font-bold font-mono tabular-nums px-1.5 py-0.5 rounded border ${
                      t.bpi > 80 ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' :
                      t.bpi > 30 ? 'bg-amber-950/60 text-amber-400 border-amber-500/30' :
                      'bg-stone-900/60 text-stone-400 border-stone-800'
                    }`}>
                      BPI {t.bpi}%
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 font-sans truncate">{t.formation}</div>
                  <div className="text-[10px] text-stone-500 font-mono tabular-nums">{t.location}</div>
                </button>
              ))}
            </div>

            {/* Quick Astrobiology Score Badge */}
            <div className="mt-auto pt-3 border-t border-white/[0.08]">
              <div className="bg-[#070A10]/60 p-2.5 rounded-xl border border-white/[0.06] flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-stone-300 font-medium">Habitability Confidence</span>
                </div>
                <span className="text-xs font-mono font-bold tabular-nums text-emerald-400">{target.bpi}%</span>
              </div>
            </div>
          </div>

          {/* CENTER & RIGHT: Interactive Instruments Workspace */}
          <div className="flex-1 p-5 lg:p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar">

            {/* TARGET HEADER & TACTICAL DESCRIPTION */}
            <div className="bg-[#070A10]/70 border border-white/[0.08] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold font-display text-white">{target.name}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.04] text-stone-300 font-mono border border-white/10">
                    {target.formation}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F16938]/15 text-[#F16938] font-mono border border-[#F16938]/30">
                    {target.location}
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed max-w-3xl font-sans">{target.description}</p>
                <div className="text-xs text-stone-400 font-mono mt-2">
                  Mineral Matrix: <span className="text-amber-400 font-medium">{target.mineralogy}</span>
                </div>
              </div>

              {/* Firing & Sealing Action Buttons */}
              <div className="flex md:flex-col gap-2 shrink-0">
                <button
                  onClick={() => triggerLaserAblation(laserTargetPos.x, laserTargetPos.y)}
                  disabled={isFiringLaser}
                  className="px-4 py-2.5 bg-[#F16938]/20 hover:bg-[#F16938]/35 disabled:opacity-50 text-stone-100 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(241,105,56,0.2)] transition-all cursor-pointer border border-[#F16938]/60 hover:border-[#F16938] backdrop-blur-md active:scale-95"
                  title="Pulse SuperCam Laser at the selected target point"
                >
                  <Zap className={`w-4 h-4 text-[#F16938] ${isFiringLaser ? 'animate-bounce text-yellow-300' : ''}`} />
                  <span>{isFiringLaser ? 'Pulsing Laser...' : 'Fire SuperCam Laser'}</span>
                </button>

                <button
                  onClick={handleCacheSample}
                  disabled={isSealingTube || cachedSuccess}
                  className="px-4 py-2.5 bg-[#070A10]/70 hover:bg-[#101522]/90 text-stone-200 border border-white/[0.08] hover:border-amber-500/40 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm backdrop-blur-md"
                >
                  {cachedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">MSR Tube Hermetic Sealed!</span>
                    </>
                  ) : isSealingTube ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                      <span className="text-amber-400">Crimping Seal...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 text-amber-400" />
                      <span>Seal in Sample Tube</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* TAB 1: SUPERCAM LIBS INTERACTIVE LASER ABLATION VIEW */}
            {activeInstrument === 'supercam' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* Left: Interactive Rock Surface Canvas */}
                  <div className="lg:col-span-6 bg-space-900/70 border border-white/[0.08] rounded-2xl p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3 font-mono text-xs">
                      <span className="text-stone-300 flex items-center gap-1.5 font-bold">
                        <Target className="w-4 h-4 text-mars-400" />
                        <span>Microscopic Target Grain (Click to Aim Laser)</span>
                      </span>
                      <span className="text-cyan-400 text-[11px]">
                        X: {Math.round(laserTargetPos.x * 20)}µm | Y: {Math.round(laserTargetPos.y * 20)}µm
                      </span>
                    </div>

                    {/* Interactive Rock Surface Target Viewport */}
                    <div 
                      onClick={handleCanvasClick}
                      className="relative w-full h-56 rounded-xl overflow-hidden cursor-crosshair border border-white/20 select-none group shadow-inner"
                      style={{ background: target.surfaceTexture }}
                    >
                      {/* Sub-grain micro-texture overlay */}
                      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

                      {/* Optical Grid Crosshairs Overlay */}
                      <div className="absolute inset-0 border border-cyan-500/20 pointer-events-none flex items-center justify-center">
                        <div className="w-full h-[1px] bg-cyan-400/20" />
                        <div className="absolute h-full w-[1px] bg-cyan-400/20" />
                      </div>

                      {/* Laser Beam Projection Animation when Fired */}
                      <AnimatePresence>
                        {laserBeamActive && (
                          <motion.div
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-0 w-1 bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 shadow-[0_0_20px_#f97316] pointer-events-none origin-top z-30"
                            style={{ 
                              left: `${laserTargetPos.x}%`, 
                              height: `${laserTargetPos.y}%`,
                              transform: 'translateX(-50%)'
                            }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Laser Target Reticle (where the crosshair is currently aimed) */}
                      <div 
                        className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400 pointer-events-none z-20 flex items-center justify-center transition-all duration-150"
                        style={{ left: `${laserTargetPos.x}%`, top: `${laserTargetPos.y}%` }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        <span className="absolute -top-4 text-[9px] font-mono font-bold text-cyan-300 bg-black/70 px-1 rounded">
                          AIM
                        </span>
                      </div>

                      {/* Persistent Ablation Burn Pits */}
                      {ablationPits.map((pit) => (
                        <div
                          key={pit.id}
                          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/90 border border-amber-500/80 pointer-events-none z-10 shadow-[0_0_8px_rgba(245,158,11,0.6)] flex items-center justify-center"
                          style={{ left: `${pit.x}%`, top: `${pit.y}%` }}
                        >
                          <div className="w-1 h-1 rounded-full bg-amber-400" />
                          <span className="absolute -bottom-3.5 text-[8px] font-mono text-amber-300/90 whitespace-nowrap bg-black/80 px-1 rounded border border-amber-500/20">
                            {pit.label}
                          </span>
                        </div>
                      ))}

                      {/* Floating HUD Helper */}
                      <div className="absolute bottom-2 left-2 text-[10px] font-mono text-stone-300 bg-black/70 px-2 py-0.5 rounded border border-white/10 pointer-events-none">
                        SuperCam ChemCam Focal Depth: 2.14 m
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-stone-400">
                      <span>Recent Ablation Shots: <strong className="text-amber-400">{ablationPits.length}</strong></span>
                      <button 
                        onClick={() => setAblationPits([])}
                        className="text-[10px] text-stone-400 hover:text-white underline cursor-pointer"
                      >
                        Clear Shots
                      </button>
                    </div>
                  </div>

                  {/* Right: LIBS Emission Spectrum Chart with Clickable Peak Inspector */}
                  <div className="lg:col-span-6 bg-space-900/70 border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-stone-300 flex items-center gap-1.5 font-bold">
                        <Activity className="w-4 h-4 text-mars-400" />
                        <span>LIBS Emission Spectrum (250nm - 750nm)</span>
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        {highlightedPeak ? `Selected: ${highlightedPeak.label}` : 'Click peak to inspect'}
                      </span>
                    </div>

                    <div className="w-full h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={target.spectrum || []}>
                          <defs>
                            <linearGradient id="libsGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f47050" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#f47050" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="nm" stroke="#606c8b" fontSize={10} tickLine={false} unit="nm" />
                          <YAxis stroke="#606c8b" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0B0C10', borderColor: '#f97316', borderRadius: '10px', fontSize: '11px', fontFamily: 'monospace' }} />
                          <Area type="monotone" dataKey="intensity" stroke="#f47050" strokeWidth={2} fillOpacity={1} fill="url(#libsGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Interactive Spectral Peaks Quick Selector */}
                    <div className="mt-3 pt-2.5 border-t border-white/[0.08]">
                      <div className="text-[10px] font-mono uppercase text-stone-400 mb-1.5">
                        Interactive Spectral Line Analysis:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {target.spectrum.map((peak) => (
                          <button
                            key={peak.nm}
                            onClick={() => {
                              setHighlightedPeak(peak);
                              playUiHover();
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer border ${
                              highlightedPeak?.nm === peak.nm
                                ? 'bg-amber-500/30 text-amber-300 border-amber-500/80 shadow-sm'
                                : 'bg-space-800/80 text-stone-400 border-white/[0.06] hover:text-white hover:border-white/20'
                            }`}
                          >
                            {peak.nm}nm: {peak.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SHERLOC DEEP-UV RAMAN ORGANIC BIOSIGNATURE HEATMAP */}
            {activeInstrument === 'sherloc' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left: 2D Organic Fluorescence Heatmap Matrix */}
                  <div className="lg:col-span-7 bg-space-900/70 border border-white/[0.08] rounded-2xl p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3 font-mono text-xs">
                      <span className="text-stone-300 flex items-center gap-1.5 font-bold">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>SHERLOC 248.6nm Deep-UV Fluorescence Scan</span>
                      </span>
                      <span className="text-purple-300 text-[11px] font-bold">
                        Organic Signal: {target.bpi}%
                      </span>
                    </div>

                    {/* 2D Heatmap Grid */}
                    <div className="relative w-full h-56 rounded-xl bg-space-950 border border-purple-500/30 p-2 flex flex-col justify-between overflow-hidden shadow-inner">
                      <div className="grid grid-cols-8 gap-1.5 h-full">
                        {target.sherlocFluorescence.flatMap((row, rIdx) =>
                          row.map((val, cIdx) => {
                            const adjustedVal = Math.min(100, Math.round(val * (uvIntensity / 80)));
                            const isOrganicPeak = adjustedVal > 70;
                            return (
                              <div
                                key={`${rIdx}-${cIdx}`}
                                className="rounded-md transition-all relative group flex items-center justify-center cursor-pointer border border-white/[0.04] hover:border-white/40"
                                style={{
                                  backgroundColor: isOrganicPeak
                                    ? `rgba(168, 85, 247, ${adjustedVal / 100})`
                                    : `rgba(6, 182, 212, ${adjustedVal / 150})`,
                                  boxShadow: isOrganicPeak ? '0 0 10px rgba(168,85,247,0.5)' : 'none'
                                }}
                              >
                                <span className="text-[8px] font-mono text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {adjustedVal}%
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-stone-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
                          <span>Aromatic Carbon Hotspots (High Fluorescence)</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-600" />
                          <span>Silicate/Carbonate Substrate</span>
                        </span>
                      </div>
                    </div>

                    {/* Interactive UV Excitation Slider */}
                    <div className="mt-3.5 flex items-center gap-4 bg-space-950/70 p-2.5 rounded-xl border border-white/[0.06]">
                      <Sliders className="w-4 h-4 text-purple-400 shrink-0" />
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between text-[11px] font-mono text-stone-300 mb-1">
                          <span>Deep-UV Laser Pulse Power:</span>
                          <span className="text-purple-300 font-bold">{uvIntensity}% (248.6 nm)</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="100"
                          value={uvIntensity}
                          onChange={(e) => setUvIntensity(Number(e.target.value))}
                          className="w-full accent-purple-500 h-1.5 bg-space-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Astrobiology Interpretation & Molecule Findings */}
                  <div className="lg:col-span-5 bg-space-900/70 border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono text-stone-300 font-bold uppercase mb-2 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Astrobiology Biosignature Assessment</span>
                      </div>
                      
                      <div className="bg-space-950/80 p-3 rounded-xl border border-white/[0.06] space-y-2 mb-3">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-stone-400">Target Organic Class:</span>
                          <span className="text-purple-300 font-bold">{target.organics}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-stone-400">Carbon Chain Complexity:</span>
                          <span className="text-emerald-400 font-bold">Polycyclic Ring Matrix</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-stone-400">Aqueous Preservation:</span>
                          <span className="text-cyan-400 font-bold">Sulfate Entrapment</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-300 font-sans leading-relaxed">
                        SHERLOC uses deep-ultraviolet (DUV) Raman and native fluorescence photons to detect polycyclic aromatic hydrocarbons without destroying delicate molecular backbones.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[11px] font-mono text-purple-200">
                      Recommendation: <strong>PRIORITY FOR RETURN CORE CACHING</strong>. Sample qualifies for high-tier laboratory mass spectrometry on Earth.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PIXL SUB-MM X-RAY LITHOCHEMISTRY */}
            {activeInstrument === 'pixl' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* Elemental Bar Chart */}
                  <div className="lg:col-span-7 bg-space-900/70 border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3 font-mono text-xs">
                      <span className="text-stone-300 flex items-center gap-1.5 font-bold">
                        <Atom className="w-4 h-4 text-cyan-400" />
                        <span>PIXL Calibrated Oxide Abundances (Weight %)</span>
                      </span>
                      <span className="text-stone-400 text-[10px]">100µm X-Ray Spot</span>
                    </div>

                    <div className="w-full h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={target.elements || []} layout="vertical" margin={{ left: 30, right: 20 }}>
                          <XAxis type="number" stroke="#606c8b" fontSize={10} unit="%" />
                          <YAxis type="category" dataKey="name" stroke="#cbd5e1" fontSize={10} width={90} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0B0C10', borderColor: '#00ffcc', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {(target.elements || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Mineral Stoichiometry Card */}
                  <div className="lg:col-span-5 bg-space-900/70 border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono text-stone-300 font-bold uppercase mb-2 flex items-center gap-1.5">
                        <Microscope className="w-4 h-4 text-amber-400" />
                        <span>Petrological Stoichiometry</span>
                      </div>
                      
                      <div className="space-y-2 text-xs font-mono">
                        <div className="p-2.5 rounded-xl bg-space-950/70 border border-white/[0.06] flex justify-between">
                          <span className="text-stone-400">Silica Saturation:</span>
                          <span className="text-cyan-400 font-bold">{target.elements[0]?.value}% (Sub-Alkaline)</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-space-950/70 border border-white/[0.06] flex justify-between">
                          <span className="text-stone-400">Total Iron Index (FeOT):</span>
                          <span className="text-orange-400 font-bold">{target.elements[1]?.value}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-space-950/70 border border-white/[0.06] flex justify-between">
                          <span className="text-stone-400">Grain Micro-Hardness:</span>
                          <span className="text-white font-bold">6.5 Mohs</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-space-950/80 border border-white/[0.06] text-[11px] font-sans text-stone-400">
                      Correlated with MRO CRISM orbital infrared signatures confirming smectite-nontronite clay formation.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MSR HERMETIC SAMPLE CACHING STATION */}
            {activeInstrument === 'msr' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left: Titanium Tube Visualization & Sealing */}
                  <div className="lg:col-span-7 bg-space-900/70 border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 font-mono text-xs">
                        <span className="text-stone-300 flex items-center gap-1.5 font-bold">
                          <Database className="w-4 h-4 text-amber-400" />
                          <span>NASA MSR Titanium Hermetic Sample Tube Assembly</span>
                        </span>
                        <span className="text-amber-400 text-[11px]">NASA Spec: MSR-TUBE-042</span>
                      </div>

                      {/* Titanium Tube Visual Schematic */}
                      <div className="relative w-full h-28 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-2xl border border-amber-500/40 p-4 flex items-center justify-between overflow-hidden shadow-xl mb-4">
                        <div className="flex items-center gap-3 z-10">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 font-bold font-mono text-sm">
                            #{safeSamples.length + 1}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white font-display">{target.name}</div>
                            <div className="text-[11px] text-stone-400 font-mono">Core Dim: 13mm Ø × 60mm Length</div>
                            <div className="text-[10px] text-emerald-400 font-mono">Headspace N2 Purge: 1.2 bar Verified</div>
                          </div>
                        </div>

                        <div className="z-10 text-right font-mono">
                          <span className="text-xs text-amber-400 font-bold uppercase px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40">
                            Ready to Crimp
                          </span>
                        </div>
                      </div>

                      {/* Custom Field Notes Input */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono text-stone-300">
                          Mission Astrobiology Field Log Notes (Stored with Tube Telemetry):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Harvested from Skinner Ridge lower delta bench; abundant organic signal."
                          value={customTubeNotes}
                          onChange={(e) => setCustomTubeNotes(e.target.value)}
                          className="w-full bg-space-950/90 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-500 focus:outline-none focus:border-amber-400/60"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleCacheSample}
                      disabled={isSealingTube || cachedSuccess}
                      className="mt-4 w-full py-3 bg-gradient-to-r from-amber-600 via-mars-600 to-amber-700 hover:from-amber-500 hover:to-mars-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-600/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {cachedSuccess ? 'Successfully Hermetically Sealed & Registered' : 'Execute Hermetic Nitrogen Purge & Crimp Seal'}
                    </button>
                  </div>

                  {/* Right: Sample Depot Inventory */}
                  <div className="lg:col-span-5 bg-space-900/70 border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono text-stone-300 font-bold uppercase mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Cached Sample Depot Inventory</span>
                        </span>
                        <span className="text-stone-400 font-mono text-[10px]">{safeSamples.length} Sealed</span>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                        {safeSamples.length === 0 ? (
                          <div className="p-4 rounded-xl bg-space-950/60 border border-dashed border-white/10 text-center text-xs text-stone-500 font-mono">
                            No tubes sealed yet. Click "Seal in Sample Tube" to register your first core sample!
                          </div>
                        ) : (
                          safeSamples.map((s, idx) => (
                            <div key={s.id || idx} className="p-2.5 rounded-xl bg-space-950/80 border border-white/[0.06] font-mono text-xs">
                              <div className="flex justify-between items-center text-stone-200 font-bold">
                                <span>{s.name}</span>
                                <span className="text-[10px] text-amber-400">{s.status}</span>
                              </div>
                              <div className="text-[10px] text-stone-400 truncate mt-0.5">{s.rockType}</div>
                              {s.notes && (
                                <p className="text-[9px] text-stone-400/90 italic mt-1 font-sans">
                                  "{s.notes}"
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-space-950/50 border border-white/[0.06] text-[10px] font-mono text-stone-400">
                      Destination: Mars Sample Return Lander Depot (Three Forks)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE PALEO-ENVIRONMENTAL GROUNDWATER PH SIMULATOR */}
            <div className="bg-space-900/70 border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold uppercase text-stone-200">
                    Paleo-Groundwater Acidity & Mineral Precipitation Simulator
                  </span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${paleoDiagnosis.badge}`}>
                  {paleoDiagnosis.epoch}
                </span>
              </div>

              {/* Interactive pH Slider */}
              <div className="flex items-center gap-4 bg-space-950/80 p-3 rounded-xl border border-white/[0.06]">
                <div className="text-xs font-mono text-stone-300 shrink-0 font-bold">
                  Simulated Water pH: <span className={`${paleoDiagnosis.color} font-black text-sm`}>{paleoPh.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="10.0"
                  step="0.1"
                  value={paleoPh}
                  onChange={(e) => setPaleoPh(Number(e.target.value))}
                  className="flex-1 accent-cyan-400 h-2 bg-space-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono text-stone-400 shrink-0">Acidic (2.0) ↔ Alkaline (10.0)</span>
              </div>

              {/* Dynamic Precipitation Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-space-950/60 border border-white/[0.06]">
                  <span className="text-[10px] text-stone-400 uppercase">Chemical Regime:</span>
                  <div className={`font-bold mt-0.5 ${paleoDiagnosis.color}`}>{paleoDiagnosis.regime}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-space-950/60 border border-white/[0.06]">
                  <span className="text-[10px] text-stone-400 uppercase">Precipitated Minerals:</span>
                  <div className="text-white font-semibold mt-0.5">{paleoDiagnosis.precipitates}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-space-950/60 border border-white/[0.06]">
                  <span className="text-[10px] text-stone-400 uppercase">Biosignature Retention:</span>
                  <div className="text-emerald-400 font-semibold mt-0.5">{paleoDiagnosis.habitability}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
}
