import React, { useState, useEffect, useMemo } from 'react';
import useMapStore from '../store/useMapStore';
import { 
  Compass, Globe, Rocket, Shield, Activity, Thermometer, Wind, Eye, 
  ChevronDown, Sparkles, MapPin, Play, ArrowRight, Radio, Layers, 
  Orbit, Mountain, Sun, Zap, Satellite, ShieldAlert, Cpu, Heart
} from 'lucide-react';
import { marsAudio } from '../utils/audioSynthesizer';
import { marsDateFromEarthDate } from '../utils/marsUtils';

const DESTINATIONS = [
  {
    id: 'jezero',
    name: 'Jezero Crater Delta',
    rover: 'Perseverance & Ingenuity',
    lat: 18.4447,
    lon: 77.4508,
    zoom: 4,
    elevation: '-2,600 m',
    highlight: 'Ancient Paleolake River Delta',
    description: 'Sedimentary clay mudstones and layered river delta holding potential fossil biosignatures of ancient Martian microbial life.',
    image: 'https://images-assets.nasa.gov/image/PIA26378/PIA26378~medium.jpg',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40',
  },
  {
    id: 'olympus',
    name: 'Olympus Mons Caldera',
    rover: 'Tharsis Volcanic Province',
    lat: 18.65,
    lon: -133.8,
    zoom: 3,
    elevation: '+21,229 m',
    highlight: 'Tallest Volcano in Solar System',
    description: 'Soaring 21.2 km above the datum—nearly triple Mount Everest. Features a multi-ring caldera with six collapsed magma chambers.',
    image: 'https://images-assets.nasa.gov/image/PIA10020/PIA10020~small.jpg',
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-950/40',
  },
  {
    id: 'valles',
    name: 'Valles Marineris Chasma',
    rover: 'Equatorial Rift System',
    lat: -14.0,
    lon: -59.2,
    zoom: 3,
    elevation: '-5,000 m',
    highlight: 'Grand Canyon of the Red Planet',
    description: 'A 4,000 km tectonic rift spanning up to 7 km deep. Would stretch across the entire continental United States from New York to San Francisco.',
    image: 'https://images-assets.nasa.gov/image/PIA14564/PIA14564~medium.jpg',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/40',
  },
  {
    id: 'gale',
    name: 'Gale Crater & Mount Sharp',
    rover: 'Curiosity Rover (MSL)',
    lat: -4.5895,
    lon: 137.4417,
    zoom: 4,
    elevation: '-4,500 m',
    highlight: 'Stratified Aqueous Bedrock',
    description: 'Climbing Aeolis Mons through ancient lakebeds, hematite ridges, and clay strata confirming billions of years of habitable water history.',
    image: 'https://images-assets.nasa.gov/image/PIA26310/PIA26310~medium.jpg',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40',
  },
  {
    id: 'polar',
    name: 'Planum Boreum & Korolev',
    rover: 'Northern Polar Caps',
    lat: 73.0,
    lon: 165.0,
    zoom: 3,
    elevation: '-3,900 m',
    highlight: 'Permanent 2,200 km³ Water Ice Reservoir',
    description: 'Vast layered deposits of pristine water ice and dry ice. Korolev Crater houses an impact dome filled with 1.8 km thick pure water ice.',
    image: 'https://images-assets.nasa.gov/image/PIA10651/PIA10651~small.jpg',
    badgeColor: 'border-sky-500/40 text-sky-400 bg-sky-950/40',
  },
];

const CAPABILITIES = [
  {
    icon: Layers,
    title: 'Multi-Spectral Cartography',
    description: 'High-precision equirectangular & 3D tiles from NASA Mars Trek. Switch between Viking True Color, MOLA Elevation, THEMIS Thermal Inertia, and TES Dust opacity.',
    color: 'text-mars-400',
    border: 'border-mars-500/30',
    glow: 'rgba(249,115,22,0.15)',
  },
  {
    icon: Shield,
    title: 'EVA Walkback Safety Engine',
    description: 'Real-time hazard mitigation calculating terrain slope, metabolic O₂ burn rates, and dynamic 2 km safe / 5 km abort walkback radii per NASA EVA standards.',
    color: 'text-cyber-cyan',
    border: 'border-cyber-cyan/30',
    glow: 'rgba(0,255,204,0.15)',
  },
  {
    icon: Orbit,
    title: 'Martian Celestial Ephemeris',
    description: 'Surface observer sky dome calculating live solar positions, night sky stellar views, and real-time Phobos & Deimos solar eclipse transit simulations.',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    glow: 'rgba(245,158,11,0.15)',
  },
  {
    icon: Cpu,
    title: 'Spectrometry & Rock Analysis',
    description: 'Multi-wavelength absorption spectrometry for olivine, hematite, smectite clays, and gypsum, connected directly to Curiosity and Perseverance science logs.',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    glow: 'rgba(168,85,247,0.15)',
  },
];

export default function HomeHero() {
  const { currentSol, weather, setMapCenter, setMapZoom, setViewMode, setEVASimulating } = useMapStore();
  const [activeDestIdx, setActiveDestIdx] = useState(0);

  const marsDate = useMemo(() => marsDateFromEarthDate(new Date()), []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFlyTo = (dest) => {
    marsAudio.playQuindarTone(true);
    setMapCenter([dest.lat, dest.lon]);
    setMapZoom(dest.zoom);
    scrollTo('section-map');
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-between text-white overflow-hidden pt-20 pb-16 px-4 sm:px-6">
      {/* Background Ambience Layer with Warm Mars Atmospheric Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-radial from-mars-500/15 via-amber-600/5 to-transparent blur-3xl opacity-80" />
        <div className="absolute -bottom-24 left-1/4 w-[600px] h-[400px] bg-cyan-500/10 blur-3xl opacity-60" />
      </div>

      {/* TOP: Strategic Header & Live Mars Telemetry Ticker */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center text-center mt-6 mb-8">
        
        {/* Mission Identification Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0B0C10]/90 border border-mars-400/30 shadow-[0_0_20px_rgba(244,112,80,0.2)] mb-6 backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-mars-400 animate-ping" />
          <span className="text-[11px] font-mono tracking-[0.2em] text-mars-300 uppercase font-semibold">
            NASA Space Apps Challenge 2026 • Interplanetary Expedition
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-200 to-mars-300 drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] max-w-4xl leading-[1.08] mb-5">
          SURVIVE & EXPLORE THE RED PLANET
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-stone-300 max-w-2xl font-sans font-light leading-relaxed mb-8 drop-shadow-md">
          Tactical surface cartography, autonomous rover traverse routing, and life-support safety simulation calibrated for the next generation of human Martian explorers.
        </p>

        {/* Live Mars Telemetry Pill Bar */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 bg-[#0B0C10]/85 border border-white/[0.08] backdrop-blur-2xl px-5 py-3 rounded-2xl shadow-hud-glass font-mono text-xs mb-8">
          <div className="flex items-center gap-2">
            <span className="text-space-400">MARTIAN DATE:</span>
            <span className="text-amber-400 font-bold">{marsDate.formatted}</span>
          </div>
          <div className="hidden sm:block w-[1px] h-3.5 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-space-400">MTC TIME:</span>
            <span className="text-cyan-400 font-bold">{marsDate.timeFormatted}</span>
          </div>
          <div className="hidden sm:block w-[1px] h-3.5 bg-white/10" />
          <div className="flex items-center gap-2">
            <Thermometer className="w-3.5 h-3.5 text-mars-400" />
            <span className="text-space-400">SURFACE TEMP:</span>
            <span className="text-white font-bold">{weather?.temperature?.avg || -63}°C</span>
          </div>
          <div className="hidden sm:block w-[1px] h-3.5 bg-white/10" />
          <div className="flex items-center gap-2">
            <Wind className="w-3.5 h-3.5 text-cyber-cyan" />
            <span className="text-space-400">PRESSURE:</span>
            <span className="text-white font-bold">{weather?.pressure?.value || 636} Pa</span>
          </div>
        </div>

        {/* Primary Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => {
              marsAudio.playQuindarTone(true);
              scrollTo('section-map');
            }}
            className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-mars-600 via-mars-500 to-amber-600 hover:from-mars-500 hover:to-amber-500 text-white font-display font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:shadow-[0_0_45px_rgba(249,115,22,0.8)] hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2.5 cursor-pointer border border-white/20"
          >
            <Compass className="w-4 h-4 text-white animate-spin-slow" />
            <span>Launch Mission Control (Map)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setViewMode('3d');
              marsAudio.playQuindarTone(false);
              scrollTo('section-map');
            }}
            className="px-6 py-3.5 rounded-xl bg-space-900/90 hover:bg-space-800 text-stone-200 hover:text-white font-mono text-xs tracking-wider uppercase transition-all border border-white/10 hover:border-cyber-cyan/50 hover:shadow-[0_0_20px_rgba(0,255,204,0.3)] flex items-center gap-2 cursor-pointer backdrop-blur-md"
          >
            <Globe className="w-4 h-4 text-cyber-cyan" />
            <span>3D Planetary Globe</span>
          </button>

          <button
            onClick={() => {
              marsAudio.playQuindarTone(false);
              scrollTo('section-sky');
            }}
            className="px-6 py-3.5 rounded-xl bg-space-900/90 hover:bg-space-800 text-stone-200 hover:text-white font-mono text-xs tracking-wider uppercase transition-all border border-white/10 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2 cursor-pointer backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Celestial Ephemeris & Eclipse</span>
          </button>
        </div>
      </div>

      {/* MIDDLE: Interactive Destination Showcase Cards */}
      <div className="relative z-10 w-full max-w-6xl my-6">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-mars-400" />
            <h2 className="text-xs font-mono tracking-[0.18em] uppercase text-stone-300 font-bold">
              Prime Exploration Landing Sites & Geological Wonders
            </h2>
          </div>
          <span className="text-[11px] font-mono text-space-400 hidden sm:inline">
            Click any site to fly directly to it on the interactive map
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {DESTINATIONS.map((dest, idx) => (
            <div
              key={dest.id}
              onClick={() => handleFlyTo(dest)}
              className="group relative bg-[#0B0C10]/85 hover:bg-[#11131a] border border-white/[0.08] hover:border-mars-400/50 rounded-2xl overflow-hidden shadow-hud-glass transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col"
            >
              {/* Image Preview with Aspect Ratio */}
              <div className="relative w-full h-32 overflow-hidden bg-space-950">
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-black/30 to-transparent" />
                
                {/* Elevation & Highlight Tag */}
                <div className="absolute top-2.5 left-2.5">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border backdrop-blur-md ${dest.badgeColor}`}>
                    {dest.highlight}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-white group-hover:text-mars-300 transition-colors leading-snug mb-1">
                    {dest.name}
                  </h3>
                  <div className="text-[10px] font-mono text-stone-400 flex items-center justify-between mb-2">
                    <span className="truncate">{dest.rover}</span>
                    <span className="text-amber-400 font-bold shrink-0">{dest.elevation}</span>
                  </div>
                  <p className="text-[11px] text-stone-400/90 font-sans line-clamp-2 leading-relaxed mb-3">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-mars-400 group-hover:text-mars-300">
                  <span className="font-semibold">Fly to Site</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM: 4 Mission Architectural Pillars */}
      <div className="relative z-10 w-full max-w-6xl mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className="bg-[#0B0C10]/75 border border-white/[0.06] rounded-2xl p-4 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-[#0D0F15]"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`p-2 rounded-xl bg-white/[0.04] border ${cap.border}`}>
                    <Icon className={`w-4 h-4 ${cap.color}`} />
                  </div>
                  <h4 className="font-display font-bold text-xs text-stone-200">
                    {cap.title}
                  </h4>
                </div>
                <p className="text-[11px] text-stone-400 font-sans leading-relaxed">
                  {cap.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <div 
        onClick={() => scrollTo('section-map')}
        className="relative z-10 mt-10 flex flex-col items-center gap-1.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity group"
      >
        <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400 group-hover:text-mars-300">
          Scroll Down to Interactive Map
        </span>
        <ChevronDown className="w-4 h-4 text-mars-400 animate-bounce" />
      </div>
    </div>
  );
}
