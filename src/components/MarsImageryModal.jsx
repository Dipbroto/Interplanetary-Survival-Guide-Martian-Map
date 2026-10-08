import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Camera, Search, Filter, MapPin, ExternalLink, 
  Navigation, Eye, Sparkles, Layers, Compass, ZoomIn, 
  Calendar, Info, Shield, Radio, Rocket, Download, Share2, Loader2
} from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { marsAudio } from '../utils/audioSynthesizer';
import ProvenanceBadge from './ProvenanceBadge';
import { fetchMarsImagery } from '../services/nasaApiService';

export default function MarsImageryModal() {
  const { 
    isImageryModalOpen, 
    setImageryModalOpen,
    flyToCoordinate,
    setSelectedPOI,
    setScienceLabOpen,
    setViewMode,
    viewMode
  } = useMapStore();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('Jezero Crater');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inspectingImage, setInspectingImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const MARS_IMAGE_CATEGORIES = [
    { id: 'all', label: 'All Observations' },
    { id: 'rover', label: 'Rover Mastcam-Z' },
    { id: 'orbital', label: 'Orbital HiRISE' },
    { id: 'panorama', label: 'Panoramas' }
  ];

  // Fetch images from NASA API whenever the modal opens or search query changes
  useEffect(() => {
    if (!isImageryModalOpen) return;
    
    // Debounce the search query
    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      const queryStr = `${activeCategory !== 'all' ? activeCategory : ''} ${searchQuery || 'Mars surface'}`.trim();
      fetchMarsImagery(queryStr).then(data => {
        setImages(data);
        if (data.length > 0 && !inspectingImage) {
          setInspectingImage(data[0]);
        }
        setIsLoading(false);
      });
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeCategory, isImageryModalOpen]);

  const filteredImages = images; // We now let the API do the searching!

  

  const handleFlyTo = (img) => {
    marsAudio.playQuindarTone?.(true);
    flyToCoordinate(img.lat, img.lon, 6);
    document.getElementById('section-map')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInspectScience = (img) => {
    marsAudio.playUiClick?.();
    setImageryModalOpen(false);
    setScienceLabOpen(true);
  };

  return (
    <AnimatePresence>
      {isImageryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 select-none">
          {/* Dark Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              marsAudio.playUiClick?.();
              setImageryModalOpen(false);
            }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-7xl h-[92vh] bg-[#0B0C10]/98 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative z-10"
          >
            {/* Header Bar */}
            <div className="h-16 shrink-0 border-b border-white/[0.08] bg-space-950/90 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mars-500 to-rose-600 flex items-center justify-center text-white shadow-neon-mars border border-white/20">
                  <Camera className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-lg text-white tracking-wider">
                      NASA HiRISE & ROVER RAW IMAGERY EXPLORER
                    </h2>
                    <ProvenanceBadge type="OBSERVED" size="sm" detail="PDS / JPL" />
                  </div>
                  <p className="text-[11px] font-mono text-space-400">
                    Authentic Open-Source Planetary Reconnaissance • 25cm/px HiRISE Orbital & Rover Mastcam-Z
                  </p>
                </div>
              </div>

              <button 
                onClick={() => {
                  marsAudio.playUiClick?.();
                  setImageryModalOpen(false);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-space-400 hover:text-white border border-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          {/* Search & Category Filter Toolbar */}
          <div className="shrink-0 border-b border-white/[0.06] bg-space-900/60 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
            {/* Category Filter Chips (Horizontal Scrollable Menu Bar) */}
            <div 
              onWheel={(e) => {
                if (e.deltaY !== 0 && e.deltaX === 0) {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
              className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden custom-scrollbar-x py-0.5 whitespace-nowrap scroll-smooth max-w-full lg:max-w-[calc(100%-270px)]"
            >
              {MARS_IMAGE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    marsAudio.playUiClick?.();
                    setActiveCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 shadow-neon-cyan font-bold'
                      : 'bg-space-950/60 text-space-400 hover:text-white hover:bg-space-800 border border-white/[0.04]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-space-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search target, mission, mineral..."
                className="w-full bg-space-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-space-500 font-mono focus:outline-none focus:border-cyber-cyan/60"
              />
            </div>
          </div>

          {/* Main Dual-Pane Workspace */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Gallery Card Stream (Vertical Scrollable) */}
            <div className="w-1/2 lg:w-5/12 border-r border-white/[0.06] overflow-y-auto overflow-x-hidden p-4 space-y-3.5 custom-scrollbar-y">
              <div className="flex items-center justify-between text-[11px] font-mono text-space-400 px-1">
                <span>FOUND {filteredImages.length} RECONNAISSANCE OBSERVATIONS</span>
                <span className="text-cyber-cyan">NASA PUBLIC DOMAIN</span>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-space-400">
                  <Loader2 className="w-8 h-8 animate-spin text-cyber-cyan mb-4" />
                  <p className="font-mono text-sm tracking-wider uppercase animate-pulse">Syncing NASA PDS Archives...</p>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-space-500 font-mono text-sm">
                  No telemetry found for this query.
                </div>
              ) : (
                filteredImages.map((img) => {
                  const isSelected = inspectingImage?.id === img.id;
                  return (
                    <div
                      key={img.id}
                      onClick={() => {
                      marsAudio.playUiClick?.();
                      setInspectingImage(img);
                      setZoomLevel(1);
                    }}
                    className={`bento-card p-2.5 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${
                      isSelected
                        ? 'border-cyber-cyan/60 bg-space-900/90 shadow-neon-cyan ring-1 ring-cyber-cyan/40'
                        : 'border-white/[0.06] bg-space-950/60 hover:bg-space-900/80 hover:border-white/20'
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Thumbnail Preview */}
                      <div className="w-28 h-20 rounded-lg overflow-hidden shrink-0 bg-space-900 relative border border-white/10">
                        <img 
                          src={img.thumbnailUrl || img.imageUrl} 
                          alt={img.title}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images-assets.nasa.gov/image/PIA26574/PIA26574~small.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute bottom-1 right-1 text-[8px] font-mono bg-black/80 text-cyber-cyan px-1 rounded border border-cyber-cyan/30">
                          {img.sol ? `SOL ${img.sol}` : 'ORBIT'}
                        </span>
                      </div>

                      {/* Meta Information */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-[10px] font-mono font-bold text-cyber-cyan uppercase truncate">
                              {img.mission}
                            </span>
                            <span className="text-[9px] font-mono text-space-400 shrink-0">
                              {img.resolution}
                            </span>
                          </div>
                          <h3 className="font-display font-bold text-xs text-white group-hover:text-cyber-cyan transition-colors truncate">
                            {img.title}
                          </h3>
                          <p className="text-[10px] text-space-400 font-mono truncate mt-0.5">
                            {img.target}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[9px] font-mono text-space-400 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-mars-400" />
                            {img.lat.toFixed(2)}°, {img.lon.toFixed(2)}°
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>

            {/* Right: High-Resolution Telemetry & Analytical Lightbox */}
            {inspectingImage && (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#07080D]">
                {/* Image Viewport Canvas */}
                <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-radial from-space-900/40 to-[#04060A]">
                  <div className="relative max-w-full max-h-full rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
                    <img 
                      src={inspectingImage.imageUrl} 
                      alt={inspectingImage.title}
                      referrerPolicy="no-referrer"
                      style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
                      className="max-h-[50vh] xl:max-h-[56vh] w-auto object-contain cursor-zoom-in"
                      onClick={() => setZoomLevel(prev => prev === 1 ? 1.5 : (prev === 1.5 ? 2.2 : 1))}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = inspectingImage.thumbnailUrl || 'https://images-assets.nasa.gov/image/PIA26574/PIA26574~medium.jpg';
                      }}
                    />

                    {/* HUD Scanline overlay */}
                    <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />

                    {/* Corner Reticles */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyber-cyan/50 pointer-events-none" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyber-cyan/50 pointer-events-none" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyber-cyan/50 pointer-events-none" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyber-cyan/50 pointer-events-none" />

                    {/* Zoom Controller Floating Pill */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 text-[10px] font-mono text-space-300">
                      <span>ZOOM: {(zoomLevel * 100).toFixed(0)}%</span>
                      <button 
                        onClick={() => setZoomLevel(1)} 
                        className="hover:text-white px-1 font-bold"
                        title="Reset Zoom"
                      >
                        1X
                      </button>
                      <button 
                        onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.5))} 
                        className="hover:text-cyan-400 px-1 font-bold"
                        title="Zoom In"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Analytical Telemetry Drawer */}
                <div className="h-64 shrink-0 border-t border-white/[0.08] bg-space-950/90 p-5 overflow-y-auto overflow-x-hidden custom-scrollbar-y flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 uppercase font-bold">
                            {inspectingImage.mission}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-mars-500/15 text-mars-400 border border-mars-500/30 font-semibold">
                            {inspectingImage.instrument}
                          </span>
                          <span className="text-[10px] font-mono text-space-400">
                            {inspectingImage.earthDate}
                          </span>
                        </div>
                        <h2 className="text-base font-display font-bold text-white tracking-wide">
                          {inspectingImage.title}
                        </h2>
                      </div>

                      {/* Action Command Suite */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleFlyTo(inspectingImage)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-mars-500 to-mars-600 hover:brightness-110 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-neon-mars transition-all cursor-pointer"
                          title="Fly to this exact latitude & longitude on the map/3D globe"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>FLY TO LOCATION</span>
                        </button>

                        <button
                          onClick={() => handleInspectScience(inspectingImage)}
                          className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Analyze in In-Situ Science Laboratory"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                          <span>SCIENCE LAB</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-space-300 leading-relaxed font-sans mt-2">
                      {inspectingImage.description}
                    </p>
                  </div>

                  {/* Telemetry Metric Readout Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-white/[0.06] text-xs font-mono">
                    <div className="bg-space-900/60 p-2 rounded-lg border border-white/[0.04]">
                      <span className="text-[9px] text-space-400 uppercase block">Coordinates</span>
                      <span className="text-cyber-cyan font-bold">
                        {inspectingImage.lat.toFixed(4)}°, {inspectingImage.lon.toFixed(4)}°
                      </span>
                    </div>

                    <div className="bg-space-900/60 p-2 rounded-lg border border-white/[0.04]">
                      <span className="text-[9px] text-space-400 uppercase block">Elevation (MOLA)</span>
                      <span className="text-white font-bold">{inspectingImage.elevation.toLocaleString()} m</span>
                    </div>

                    <div className="bg-space-900/60 p-2 rounded-lg border border-white/[0.04]">
                      <span className="text-[9px] text-space-400 uppercase block">Solar Longitude (Ls)</span>
                      <span className="text-cyber-amber font-bold">{inspectingImage.ls}°</span>
                    </div>

                    <div className="bg-space-900/60 p-2 rounded-lg border border-white/[0.04]">
                      <span className="text-[9px] text-space-400 uppercase block">Data Provenance</span>
                      <span className="text-space-300 truncate block text-[10px]">{inspectingImage.credit}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
