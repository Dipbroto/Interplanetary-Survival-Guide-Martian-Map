import React, { useState, useMemo } from 'react';
import useMapStore from '../store/useMapStore';
import { 
  Compass, Globe, Rocket, Shield, Activity, Thermometer, Wind, Eye, 
  MapPin, ArrowRight, Layers, Orbit, Mountain, Sun, Zap, Satellite, 
  Cpu, Target, Crosshair, Radar, CheckCircle2, ChevronRight, Radio, 
  Box, Clock, AlertTriangle, ChevronDown, Download, RadioTower, Sparkles
} from 'lucide-react';
import { marsAudio } from '../utils/audioSynthesizer';
import { marsDateFromEarthDate } from '../utils/marsUtils';

const FEATURED_DESTINATIONS = [
  {
    id: 'basecamp',
    name: 'Basecamp Alpha',
    subtitle: 'Jezero Delta Outpost',
    dotColor: 'bg-cyan-400/80',
    description: 'Primary habitat and research base. Fully equipped for long-term stay.',
    image: '/dest_basecamp.jpg',
    lat: 18.4447,
    lon: 77.4508,
    zoom: 4,
  },
  {
    id: 'crater_zeta',
    name: 'Crater Zeta',
    subtitle: 'Gale Crater Strata',
    dotColor: 'bg-amber-400/80',
    description: 'Rich in geological data and mineral samples. High radiation levels.',
    image: '/dest_crater_zeta.jpg',
    lat: -4.5895,
    lon: 137.4417,
    zoom: 4,
  },
  {
    id: 'mount_olympus',
    name: 'Mount Olympus',
    subtitle: 'Caldera Apex (+21.2 km)',
    dotColor: 'bg-blue-400/80',
    description: 'The largest volcano in the solar system. Stunning views, extreme conditions.',
    image: '/dest_olympus.jpg',
    lat: 18.65,
    lon: -133.8,
    zoom: 3,
  },
  {
    id: 'elysium',
    name: 'Elysium Planitia',
    subtitle: 'Volcanic Lava Plains',
    dotColor: 'bg-purple-400/80',
    description: 'Vast plains and potential for future expansion. Low elevation zone.',
    image: '/dest_elysium.jpg',
    lat: 3.0,
    lon: 154.7,
    zoom: 3,
  },
];

const QUICK_NAV_ITEMS = [
  {
    icon: Compass,
    title: 'PLAN YOUR JOURNEY',
    subtitle: 'Check conditions, find safe zones',
    target: 'section-map',
    is3d: false,
  },
  {
    icon: MapPin,
    title: 'EXPLORE LOCATIONS',
    subtitle: 'Bases, craters, research sites',
    target: 'section-map',
    is3d: false,
  },
  {
    icon: Box,
    title: 'ACCESS RESOURCES',
    subtitle: 'Water, oxygen, energy & more',
    target: 'section-science',
    is3d: false,
  },
  {
    icon: Radio,
    title: 'STAY INFORMED',
    subtitle: 'Live data & mission updates',
    target: 'section-sky',
    is3d: false,
  },
];

const MAP_LAYERS = [
  'Mars Surface',
  'Topography',
  'Temperature',
  'Radiation',
];

export default function HomeHero() {
  const { weather, currentSol, setMapCenter, setMapZoom, setViewMode } = useMapStore();
  const [activeLayerTab, setActiveLayerTab] = useState('Mars Surface');

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
    <div className="relative w-full text-stone-200 pt-24 pb-14 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto flex flex-col gap-6">
      
      {/* ========================================================================= */}
      {/* TIER 1: PANORAMIC OUTPOST HERO BANNER WITH CURRENT CONDITIONS HUD         */}
      {/* ========================================================================= */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-white/[0.07] shadow-[0_12px_40px_rgba(0,0,0,0.8)] min-h-[460px] flex items-center bg-[#07090E]/60 backdrop-blur-sm">
        
        {/* Background Image: High-res Martian Basecamp at Sunset */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/mars_base_sunset.jpg" 
            alt="Mars Outpost Basecamp at Sunset" 
            className="w-full h-full object-cover object-center scale-[1.01]"
          />
          {/* Subtle Dark Vignette & Atmospheric Contrast Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090E]/95 via-[#07090E]/80 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Left Text & Call To Action */}
          <div className="max-w-xl">
            {/* Small Monospace Category Header */}
            <div className="flex items-center gap-2 mb-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F16938] shadow-[0_0_8px_rgba(241,105,56,0.8)]" />
              <span className="text-[#F16938] font-mono text-[10px] sm:text-[11px] tracking-[0.28em] font-semibold uppercase">
                EXPLORE / SURVIVE / THRIVE
              </span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.85rem] font-display font-black tracking-tight leading-[1.05] mb-5 drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-stone-50 via-stone-100 to-stone-300">Your Guide to</span><br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-stone-50 via-stone-100 to-stone-300">Life on </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF7A50] via-[#F16938] to-[#E05220] drop-shadow-[0_0_20px_rgba(241,105,56,0.4)]">Mars</span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-stone-300/95 font-sans text-sm sm:text-[15px] leading-relaxed mb-8 max-w-lg drop-shadow font-normal">
              Real data. Critical insights. A survival guide for the harshest planet in our solar system. Explore Mars, find safe zones, track conditions, and plan your journey.
            </p>

            {/* Primary Pill Button CTA (Professional Frosted Glass & Darker Amber Styling) */}
            <button
              onClick={() => {
                marsAudio.playQuindarTone(true);
                scrollTo('section-map');
              }}
              className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#0A0D14]/85 hover:bg-[#121724]/95 text-stone-200 hover:text-white font-mono text-xs uppercase tracking-[0.14em] font-semibold border border-[#F16938]/40 hover:border-[#F16938]/90 shadow-[0_4px_24px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)] backdrop-blur-2xl active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#F16938]/20 border border-[#F16938]/50 flex items-center justify-center text-[#F16938] group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(241,105,56,0.3)]">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span>Explore the Map</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Right Floating Glass Card: CURRENT CONDITIONS */}
          <div className="w-full sm:w-80 bg-[#07090F]/80 border border-white/[0.08] rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl shrink-0 self-start lg:self-center">
            
            {/* Header: Title with Orange Pulse */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
              <span className="w-2 h-2 rounded-full bg-[#F16938] animate-pulse shadow-[0_0_8px_#F16938]" />
              <span className="text-xs font-display font-bold tracking-[0.18em] text-stone-200 uppercase">
                CURRENT CONDITIONS
              </span>
            </div>

            {/* Key-Value Telemetry Rows */}
            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="flex items-center justify-between text-stone-300">
                <div className="flex items-center gap-2 text-stone-400">
                  <MapPin className="w-3.5 h-3.5 text-[#F16938]" />
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Sector</span>
                </div>
                <span className="font-bold text-stone-100 tracking-tight">Sector 07</span>
              </div>

              <div className="flex items-center justify-between text-stone-300">
                <div className="flex items-center gap-2 text-stone-400">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Temperature</span>
                </div>
                <span className="font-bold text-cyan-300 tabular-nums">{weather?.temperature?.avg || -63}°C</span>
              </div>

              <div className="flex items-center justify-between text-stone-300">
                <div className="flex items-center gap-2 text-stone-400">
                  <RadioTower className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Radiation</span>
                </div>
                <span className="font-bold text-amber-300 tracking-tight uppercase text-[11px]">Moderate</span>
              </div>

              <div className="flex items-center justify-between text-stone-300">
                <div className="flex items-center gap-2 text-stone-400">
                  <Wind className="w-3.5 h-3.5 text-stone-300" />
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Wind Speed</span>
                </div>
                <span className="font-bold text-stone-100 tabular-nums">12 km/h</span>
              </div>

              <div className="flex items-center justify-between text-stone-300">
                <div className="flex items-center gap-2 text-stone-400">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Visibility</span>
                </div>
                <span className="font-bold text-emerald-400 tabular-nums">94%</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 2: 4-PILL QUICK NAVIGATION BAR                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {QUICK_NAV_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => {
                marsAudio.playUiClick();
                if (item.is3d) {
                  setViewMode('3d');
                }
                scrollTo(item.target);
              }}
              className="group bg-[#070A10]/60 hover:bg-[#0D121C]/85 border border-white/[0.06] hover:border-[#F16938]/30 rounded-2xl p-4 transition-all duration-300 text-left flex items-center gap-3.5 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] group-hover:border-[#F16938]/30 group-hover:bg-[#F16938]/10 flex items-center justify-center shrink-0 transition-colors">
                <Icon className="w-4 h-4 text-[#F16938]/90 group-hover:text-[#F16938] group-hover:scale-110 transition-transform" />
              </div>
              <div className="overflow-hidden">
                <div className="font-display font-bold text-xs text-stone-200 tracking-[0.14em] group-hover:text-white uppercase truncate">
                  {item.title}
                </div>
                <div className="text-[11px] font-sans text-stone-400 group-hover:text-stone-300 transition-colors truncate">
                  {item.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TIER 3: LOWER BENTO GRID (3 COLUMNS)                                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ----------------------------------------------------------------------- */}
        {/* COLUMN 1 (5 COLS): INTERACTIVE TACTICAL MAP PREVIEW CARD                */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-5 bg-[#070A10]/75 border border-white/[0.07] rounded-3xl p-5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col justify-between">
          
          {/* Top Layer Filter Tabs (Transparent Frosted Glass Style) */}
          <div className="flex items-center justify-between gap-1 mb-3.5 overflow-x-auto pb-1 custom-scrollbar">
            <div className="flex items-center gap-1.5">
              {MAP_LAYERS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveLayerTab(tab);
                    marsAudio.playUiClick();
                  }}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                    activeLayerTab === tab
                      ? 'bg-[#F16938]/20 border-[#F16938]/60 text-stone-100 shadow-[0_0_12px_rgba(241,105,56,0.18)] backdrop-blur-md'
                      : 'bg-white/[0.02] border-white/[0.05] text-stone-400 hover:text-stone-200 hover:border-white/10 hover:bg-white/[0.05] backdrop-blur-sm'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="px-2.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider text-stone-400 hover:text-stone-200 bg-white/[0.02] border border-white/[0.05] hover:border-white/10 flex items-center gap-1 shrink-0 backdrop-blur-sm cursor-pointer">
              <span>More</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Interactive Map Surface Canvas Viewport */}
          <div 
            onClick={() => {
              marsAudio.playQuindarTone(true);
              scrollTo('section-map');
            }}
            className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-white/[0.06] bg-space-950 group cursor-pointer"
          >
            {/* Mars Surface Texture Image */}
            <img 
              src="/mars_texture.jpg" 
              alt="Martian Surface Map Preview" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80"
            />
            
            {/* Subtle Grid Reticle Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070A10] via-transparent to-transparent pointer-events-none" />

            {/* Zoom Controls Overlay (Top-Left) */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
              <div className="w-6 h-6 rounded-lg bg-[#070A10]/80 border border-white/[0.08] flex items-center justify-center text-xs font-mono font-bold text-stone-300 backdrop-blur-md">
                +
              </div>
              <div className="w-6 h-6 rounded-lg bg-[#070A10]/80 border border-white/[0.08] flex items-center justify-center text-xs font-mono font-bold text-stone-300 backdrop-blur-md">
                −
              </div>
            </div>

            {/* Stylized Rover Traverse Route Graphic */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path 
                d="M 120 70 Q 180 120 230 140 T 320 200" 
                fill="none" 
                stroke="#F16938" 
                strokeWidth="2.5" 
                strokeDasharray="4 4"
                className="animate-pulse"
              />
            </svg>

            {/* Waypoint 1: Basecamp Alpha */}
            <div className="absolute top-[60px] left-[105px] flex items-center gap-1.5 z-10 pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-500/20 animate-ping" />
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/80 border border-cyan-400/40 text-cyan-300 backdrop-blur-md">
                Basecamp Alpha
              </span>
            </div>

            {/* Waypoint 2: Sector 07 */}
            <div className="absolute top-[130px] left-[220px] flex items-center gap-1.5 z-10 pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-amber-400 ring-4 ring-amber-500/20" />
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/80 border border-amber-400/40 text-amber-300 backdrop-blur-md">
                Sector 07
              </span>
            </div>

            {/* Waypoint 3: Crater Zeta */}
            <div className="absolute bottom-[45px] left-[260px] flex items-center gap-1.5 z-10 pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-[#F16938] ring-4 ring-red-500/20" />
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/80 border border-[#F16938]/40 text-[#F16938] backdrop-blur-md">
                Crater Zeta
              </span>
            </div>

            {/* Bottom Scale & Coordinates Telemetry */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2.5 font-mono text-[10px] text-stone-400 z-10 pointer-events-none">
              <span className="px-2 py-0.5 rounded-md bg-black/75 border border-white/10 text-stone-300 backdrop-blur-sm tabular-nums font-semibold">
                10 km
              </span>
              <span className="px-2 py-0.5 rounded-md bg-black/75 border border-white/10 text-stone-300 backdrop-blur-sm tabular-nums font-medium">
                4.5895° S &nbsp; 137.4417° E
              </span>
            </div>

            {/* Floating Mini Mars Globe Button (Bottom-Right) */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setViewMode('3d');
                marsAudio.playQuindarTone(false);
                scrollTo('section-map');
              }}
              className="absolute bottom-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#070A10]/85 hover:bg-[#0E131E]/95 border border-white/15 hover:border-cyan-400/50 text-stone-300 hover:text-white font-mono text-[11px] shadow-lg backdrop-blur-xl transition-all group-hover:scale-105 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold uppercase tracking-wider text-[10px]">Mars 3D</span>
              <ArrowRight className="w-3 h-3 text-stone-400" />
            </div>

            {/* Hover overlay hint */}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 border border-white/10 text-[10px] font-mono text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
              Click to Open Mission Map ↗
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span className="tracking-wider uppercase">NASA Trek Equirectangular Projection</span>
            <span className="text-[#F16938] font-semibold tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F16938] animate-pulse" />
              Active Sector Feed
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* COLUMN 2 (4 COLS): FEATURED DESTINATIONS 2x2 GRID                       */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-4 bg-[#070A10]/75 border border-white/[0.07] rounded-3xl p-5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col justify-between">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-display font-bold text-xs tracking-[0.16em] text-stone-200 uppercase">
              FEATURED DESTINATIONS
            </h3>
            <button 
              onClick={() => scrollTo('section-map')}
              className="px-2.5 py-1 rounded-full bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/10 text-[10px] font-mono uppercase tracking-wider text-stone-400 hover:text-stone-200 flex items-center gap-1 cursor-pointer transition-all backdrop-blur-sm"
            >
              <span>View All</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* 2x2 Cards Grid */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            {FEATURED_DESTINATIONS.map((dest) => (
              <div
                key={dest.id}
                onClick={() => handleFlyTo(dest)}
                className="group relative bg-[#0A0D14]/50 hover:bg-[#0F1420]/80 border border-white/[0.05] hover:border-white/15 rounded-2xl overflow-hidden p-2.5 transition-all duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-xl"
              >
                {/* Image Thumbnail */}
                <div className="w-full h-20 rounded-xl overflow-hidden mb-2 relative bg-space-950">
                  <img 
                    src={dest.image} 
                    alt={dest.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${dest.dotColor}`} />
                    <span className="font-display font-bold text-xs text-stone-200 group-hover:text-white transition-colors truncate tracking-wide">
                      {dest.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400/90 font-sans line-clamp-2 leading-relaxed mb-2 font-normal">
                    {dest.description}
                  </p>
                </div>

                {/* Explore Link (Refined Ghost Pill) */}
                <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#F16938] font-bold tracking-widest uppercase group-hover:text-[#FF8A65] flex items-center gap-1">
                    Explore
                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* COLUMN 3 (3 COLS): TELEMETRY, QUICK FACTS & MISSION DISPATCHES         */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-3 flex flex-col gap-3.5 justify-between">
          
          {/* Card A: MARS QUICK FACTS */}
          <div className="bg-[#070A10]/75 border border-white/[0.07] rounded-2xl p-4 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]">
            <h4 className="font-display font-bold text-xs tracking-[0.16em] text-stone-200 uppercase mb-3">
              MARS QUICK FACTS
            </h4>

            <div className="flex flex-col gap-2.5 font-mono text-xs text-stone-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-400 text-[11px]">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Avg Temperature</span>
                </div>
                <span className="font-bold text-stone-100 text-[11px] tabular-nums">-63°C</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-400 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Day Length (Sol)</span>
                </div>
                <span className="font-bold text-stone-100 text-[11px] tabular-nums">24h 39m</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-400 text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Surface Gravity</span>
                </div>
                <span className="font-bold text-stone-100 text-[11px] tabular-nums">0.38 g</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-400 text-[11px]">
                  <Wind className="w-3.5 h-3.5 text-[#F16938]" />
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Atmosphere</span>
                </div>
                <span className="font-bold text-stone-100 text-[11px] tabular-nums">95% CO₂</span>
              </div>
            </div>
          </div>

          {/* Card B: LATEST UPDATES FEED */}
          <div className="bg-[#070A10]/75 border border-white/[0.07] rounded-2xl p-4 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)] flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display font-bold text-xs tracking-[0.16em] text-stone-200 uppercase">
                LATEST UPDATES
              </h4>
              <button 
                onClick={() => scrollTo('section-science')}
                className="px-2 py-0.5 rounded-full bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-[10px] font-mono uppercase tracking-wider text-stone-400 hover:text-stone-200 flex items-center gap-0.5 cursor-pointer backdrop-blur-sm transition-all"
              >
                <span>View All</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                <div className="p-1 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-display font-bold text-xs text-stone-200 tracking-wide truncate">System Check Complete</div>
                  <div className="text-[10px] font-mono text-stone-400 tracking-wider">Basecamp Alpha • 2h ago</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                <div className="p-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
                  <AlertTriangle className="w-3 h-3" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-display font-bold text-xs text-stone-200 tracking-wide truncate">Dust Storm Alert</div>
                  <div className="text-[10px] font-mono text-stone-400 tracking-wider">Sector 12 • 5h ago</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                <div className="p-1 rounded bg-purple-950/40 border border-purple-500/30 text-purple-400 shrink-0 mt-0.5">
                  <Cpu className="w-3 h-3" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-display font-bold text-xs text-stone-200 tracking-wide truncate">New Research Data Available</div>
                  <div className="text-[10px] font-mono text-stone-400 tracking-wider">Crater Zeta • 8h ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card C: THE NEXT STEP IS YOURS PROMPT CARD */}
          <div 
            onClick={() => {
              marsAudio.playQuindarTone(true);
              scrollTo('section-map');
            }}
            className="group relative bg-gradient-to-r from-[#070A10]/85 via-[#0C0F16]/80 to-[#120F0C]/75 border border-white/[0.07] hover:border-[#F16938]/30 rounded-2xl p-4 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] cursor-pointer flex items-center justify-between transition-all"
          >
            <div>
              <div className="font-display font-bold text-xs text-stone-200 tracking-wide group-hover:text-[#F16938] transition-colors">
                The next step is yours.
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-stone-400">
                Plan. Explore. Survive.
              </div>
            </div>

            {/* Glowing Action Button Circle */}
            <div className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-[#F16938]/20 border border-white/[0.08] hover:border-[#F16938]/50 flex items-center justify-center text-stone-400 hover:text-[#F16938] transition-all shadow-sm">
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* TIER 4: NASA FOOTER BRANDING STRIP                                        */}
      {/* ========================================================================= */}
      <div className="pt-6 pb-2 border-t border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-stone-400">
        <div className="flex items-center gap-3">
          {/* NASA Meatball Logo */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-900/40 border border-blue-500/25 text-white font-display font-black tracking-[0.2em] text-[10px]">
              NASA
            </span>
            <span className="text-[11px] font-sans text-stone-400">
              In collaboration with NASA Space Apps Challenge 2026
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono tracking-[0.22em] uppercase text-stone-400/80">
          <span>REAL DATA</span>
          <span>•</span>
          <span>REAL LOCATIONS</span>
          <span>•</span>
          <span className="text-stone-300 font-semibold">A SAFER TOMORROW</span>
        </div>
      </div>

    </div>
  );
}
