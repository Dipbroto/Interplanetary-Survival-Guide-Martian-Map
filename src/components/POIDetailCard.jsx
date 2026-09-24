import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MapPin, Navigation, Rocket, Mountain, Info, Target, 
  Calendar, User, FlaskConical, Camera, Search, Compass, ExternalLink 
} from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { landingSites } from '../data/landingSites';
import { geologicalFeatures } from '../data/geologicalFeatures';
import { marsAudio } from '../utils/audioSynthesizer';
import ProvenanceBadge from './ProvenanceBadge';

const POIDetailCard = () => {
  const { 
    selectedPOI, 
    setSelectedPOI, 
    addWaypoint, 
    setScienceLabOpen,
    setImageryModalOpen,
    flyToCoordinate
  } = useMapStore();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'landing' | 'geology'
  const [searchQuery, setSearchQuery] = useState('');

  // Combined POIs for catalog view
  const allPOIs = [
    ...landingSites.map(s => ({ ...s, poiType: 'landingSite' })),
    ...geologicalFeatures.map(f => ({ ...f, poiType: 'geologicalFeature' }))
  ];

  const filteredPOIs = allPOIs.filter(poi => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'landing' && poi.poiType === 'landingSite') ||
      (activeTab === 'geology' && poi.poiType === 'geologicalFeature');
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      poi.name.toLowerCase().includes(q) || 
      (poi.location && poi.location.toLowerCase().includes(q)) ||
      (poi.type && poi.type.toLowerCase().includes(q));
    return matchesTab && matchesSearch;
  });

  const handleSelectPOI = (poi) => {
    marsAudio.playUiClick?.();
    setSelectedPOI(poi);
    const lon = poi.lon !== undefined ? poi.lon : (poi.lng !== undefined ? poi.lng : 0);
    flyToCoordinate(poi.lat, lon, 5);
    document.getElementById('section-map')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigate = () => {
    if (!selectedPOI) return;
    const lon = selectedPOI.lon !== undefined ? selectedPOI.lon : (selectedPOI.lng !== undefined ? selectedPOI.lng : 0);
    addWaypoint({
      id: Date.now().toString(),
      lat: selectedPOI.lat,
      lon: lon,
      elevation: selectedPOI.elevation || 0,
      name: selectedPOI.name
    });
    marsAudio.playQuindarTone?.(true);
  };

  // IF NO POI SELECTED: RENDER INTERACTIVE VISUAL CATALOG
  if (!selectedPOI) {
    return (
      <div className="flex flex-col h-full overflow-hidden select-none">
        {/* Catalog Header */}
        <div className="shrink-0 p-3.5 border-b border-white/[0.06] bg-space-950/60">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display font-bold text-xs tracking-wider text-white uppercase flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>Martian Reconnaissance Catalog</span>
            </span>
            <span className="text-[9px] font-mono text-space-400">
              {filteredPOIs.length} SITES
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-space-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search craters, rovers, volcanoes..."
              className="w-full bg-space-900/90 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-space-500 font-mono focus:outline-none focus:border-cyber-cyan/50"
            />
          </div>

          {/* Category Filter Chips (Horizontal Scrollable Menu Bar) */}
          <div className="flex items-center gap-1 font-mono text-[10px] overflow-x-auto overflow-y-hidden custom-scrollbar-x py-0.5 whitespace-nowrap scroll-smooth">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 font-bold'
                  : 'text-space-400 hover:text-white bg-space-900/50'
              }`}
            >
              All ({allPOIs.length})
            </button>
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-2.5 py-1 rounded-lg transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'landing'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                  : 'text-space-400 hover:text-white bg-space-900/50'
              }`}
            >
              Rovers & Landers
            </button>
            <button
              onClick={() => setActiveTab('geology')}
              className={`px-2.5 py-1 rounded-lg transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'geology'
                  ? 'bg-mars-500/20 text-mars-300 border border-mars-500/40 font-bold'
                  : 'text-space-400 hover:text-white bg-space-900/50'
              }`}
            >
              Geology & Ice
            </button>
          </div>
        </div>

        {/* Catalog Items List (Vertical Scrollable) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2.5 custom-scrollbar-y">
          {filteredPOIs.map((poi) => (
            <div
              key={poi.id}
              onClick={() => handleSelectPOI(poi)}
              className="bento-card p-2 rounded-xl border border-white/[0.06] bg-space-950/70 hover:bg-space-900/90 hover:border-cyber-cyan/40 transition-all cursor-pointer group flex gap-2.5"
            >
              {/* Photo Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-space-900 relative border border-white/10">
                {poi.image ? (
                  <img
                    src={poi.image}
                    alt={poi.name}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images-assets.nasa.gov/image/PIA26574/PIA26574~small.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl bg-space-900">
                    {poi.icon || '🪐'}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>

              {/* Information */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[9px] font-mono text-cyber-cyan uppercase truncate font-bold">
                      {poi.poiType === 'landingSite' ? poi.agency || 'NASA' : poi.category}
                    </span>
                    <span className="text-[9px] font-mono text-space-400 shrink-0">
                      {poi.elevation?.toLocaleString()} m
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-xs text-white group-hover:text-cyber-cyan transition-colors truncate">
                    {poi.name}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-space-400 mt-1">
                  <span>
                    {(poi.lat || 0).toFixed(2)}°, {(poi.lon !== undefined ? poi.lon : (poi.lng || 0)).toFixed(2)}°
                  </span>
                  <span className={`px-1.5 py-0.2 rounded ${
                    poi.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-space-400'
                  }`}>
                    {poi.status || poi.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // IF POI IS SELECTED: RENDER HIGH-DEFINITION DETAIL CARD
  const isLandingSite = selectedPOI.poiType === 'landingSite';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="flex flex-col h-full overflow-hidden select-none bg-[#0B0C10]/98"
      >
        {/* Hero Photo Banner */}
        <div className="h-44 w-full shrink-0 relative overflow-hidden bg-space-950 border-b border-white/[0.08]">
          {selectedPOI.image ? (
            <img 
              src={selectedPOI.image} 
              alt={selectedPOI.name}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images-assets.nasa.gov/image/PIA26574/PIA26574~medium.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-space-900 to-space-950 text-4xl">
              {selectedPOI.icon || '🪐'}
            </div>
          )}

          {/* Gradients & Scanlines */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-black/30 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-scanlines opacity-15 pointer-events-none" />

          {/* Top Controls */}
          <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between z-10">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md backdrop-blur-md uppercase ${
              isLandingSite
                ? 'bg-blue-600/80 text-white border border-blue-400/40 shadow-neon-blue'
                : 'bg-mars-500/80 text-white border border-mars-400/40 shadow-neon-mars'
            }`}>
              {isLandingSite ? 'NASA LANDING SITE' : (selectedPOI.category || 'GEOLOGICAL FEATURE')}
            </span>

            <button 
              onClick={() => {
                marsAudio.playUiClick?.();
                setSelectedPOI(null);
              }}
              className="p-1.5 bg-black/60 hover:bg-black/90 rounded-full text-white transition-colors cursor-pointer border border-white/20"
              title="Return to Catalog"
            >
              <X size={15} />
            </button>
          </div>

          {/* Attribution Watermark */}
          <div className="absolute bottom-2 left-3 z-10 flex items-center gap-1.5">
            <ProvenanceBadge type="OBSERVED" size="xs" detail="NASA / PDS" />
            <span className="text-[9px] font-mono text-white/80 drop-shadow">
              {selectedPOI.agency || 'NASA / JPL-Caltech'}
            </span>
          </div>
        </div>

        {/* Content Body (Vertical Scrollable) */}
        <div className="px-4 py-3 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-y space-y-3.5">
          {/* Title & Category */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-display font-bold text-white tracking-wide">
                {selectedPOI.name}
              </h2>
              {selectedPOI.status && (
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                  selectedPOI.status === 'Active'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                    : 'bg-space-800 text-space-400 border border-white/10'
                }`}>
                  {selectedPOI.status}
                </span>
              )}
            </div>
            {selectedPOI.location && (
              <p className="text-[11px] font-mono text-space-400">
                Region: {selectedPOI.location}
              </p>
            )}
          </div>

          {/* Scientific Context */}
          <p className="text-xs text-space-300 leading-relaxed font-sans">
            {selectedPOI.description || selectedPOI.science}
          </p>

          {/* Telemetry Metrics Bento */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div className="bg-space-950/80 p-2.5 rounded-xl border border-white/[0.05]">
              <div className="flex items-center text-space-400 text-[9px] uppercase tracking-wider mb-0.5">
                <MapPin size={11} className="mr-1 text-mars-400" /> Coordinates
              </div>
              <div className="text-cyber-cyan font-bold">
                {(selectedPOI.lat || 0).toFixed(4)}°, {(selectedPOI.lon !== undefined ? selectedPOI.lon : (selectedPOI.lng || 0)).toFixed(4)}°
              </div>
            </div>

            <div className="bg-space-950/80 p-2.5 rounded-xl border border-white/[0.05]">
              <div className="flex items-center text-space-400 text-[9px] uppercase tracking-wider mb-0.5">
                <Mountain size={11} className="mr-1 text-cyber-amber" /> Elevation
              </div>
              <div className="text-white font-bold">
                {selectedPOI.elevation?.toLocaleString()} m
              </div>
            </div>
          </div>

          {/* Mission Objectives / Science Context */}
          {selectedPOI.objectives && (
            <div className="bg-space-950/60 p-3 rounded-xl border border-white/[0.05]">
              <div className="text-[10px] uppercase font-mono tracking-wider text-space-400 font-bold mb-1.5 flex items-center gap-1">
                <Target size={12} className="text-cyber-cyan" />
                <span>Primary Mission Objectives</span>
              </div>
              <ul className="text-xs text-space-300 space-y-1 font-sans">
                {selectedPOI.objectives.map((obj, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan/60" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedPOI.science && (
            <div className="bg-space-950/60 p-3 rounded-xl border border-white/[0.05]">
              <div className="text-[10px] uppercase font-mono tracking-wider text-cyber-amber font-bold mb-1">
                Planetary Geology & Astrobiology
              </div>
              <p className="text-xs text-space-300 font-sans leading-relaxed">
                {selectedPOI.science}
              </p>
            </div>
          )}
        </div>

        {/* Command Buttons Footer */}
        <div className="p-3 border-t border-white/[0.08] bg-space-950/90 shrink-0 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                marsAudio.playUiClick?.();
                setScienceLabOpen(true);
              }}
              className="py-2 px-2 bg-purple-600/25 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 rounded-xl font-mono text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <FlaskConical size={14} />
              <span>Science Lab</span>
            </button>

            <button
              onClick={() => {
                marsAudio.playUiClick?.();
                setImageryModalOpen(true);
              }}
              className="py-2 px-2 bg-cyber-cyan/15 hover:bg-cyber-cyan/30 text-cyber-cyan border border-cyber-cyan/40 rounded-xl font-mono text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Camera size={14} />
              <span>HiRISE Gallery</span>
            </button>
          </div>

          <button
            onClick={handleNavigate}
            className="w-full py-2.5 bg-gradient-to-r from-mars-500 to-mars-600 hover:brightness-110 text-white rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-neon-mars transition-all cursor-pointer"
          >
            <Navigation size={14} />
            <span>Plot Rover Route Here</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default POIDetailCard;
