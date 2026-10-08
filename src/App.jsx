import React, { useEffect, useState, useRef } from 'react';
import useMapStore from './store/useMapStore';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import BottomPanel from './components/BottomPanel';
import MarsMap from './components/MarsMap';
import Mars3DViewer from './components/Mars3DViewer';
import LoadingScreen from './components/LoadingScreen';
import EVAHelmetHUD from './components/EVAHelmetHUD';
import ScienceLabModal from './components/ScienceLabModal';
import FlightPlanModal from './components/FlightPlanModal';
import MartianSkyEphemeris from './components/MartianSkyEphemeris';
import AudioSynthesizerRack from './components/AudioSynthesizerRack';
import ContingencySimulator from './components/ContingencySimulator';
import ErrorBoundary from './components/ErrorBoundary';
import SpaceAtmosphere from './components/SpaceAtmosphere';
import RightSidebar from './components/RightSidebar';
import MarsImageryModal from './components/MarsImageryModal';
import HomeHero from './components/HomeHero';

import { Radar, ChevronLeft, Camera, FlaskConical, Sparkles, Image } from 'lucide-react';

function App() {
  const { viewMode, showLoadingScreen, rightSidebarOpen, setRightSidebarOpen, setScienceLabOpen, setImageryModalOpen } = useMapStore();
  const [activeSection, setActiveSection] = useState('home');
  const [isMapSectionActive, setIsMapSectionActive] = useState(false);
  const mapSectionRef = useRef(null);

  // Update weather data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      useMapStore.getState().updateWeather();
    }, 60000); // Every 60 seconds
    return () => clearInterval(interval);
  }, []);

  // Monitor all sections to update activeSection and isMapSectionActive
  useEffect(() => {
    const sections = [
      { id: 'section-home', key: 'home' },
      { id: 'section-map', key: 'map' },
      { id: 'section-imagery', key: 'imagery' },
      { id: 'section-sky', key: 'sky' }
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            const found = sections.find((s) => s.id === entry.target.id);
            if (found) {
              setActiveSection(found.key);
              if (found.key === 'map') {
                setIsMapSectionActive(true);
              } else {
                setIsMapSectionActive(false);
              }
            }
          }
        });
      },
      { threshold: [0.1, 0.25, 0.45, 0.7] }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-screen h-screen overflow-y-auto overflow-x-hidden bg-[#050608] selection:bg-mars-400/40 selection:text-white scroll-smooth custom-scrollbar">
      {/* GLOBAL ATMOSPHERE & LOADING SCREEN */}
      <SpaceAtmosphere />
      {showLoadingScreen && <LoadingScreen />}

      {/* TOP NAVIGATION BAR (Fixed globally across all sections) */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <TopBar isMapActive={isMapSectionActive} activeSection={activeSection} />
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: MISSION OVERVIEW HOMEPAGE (#section-home)    */}
      {/* ======================================================== */}
      <section 
        id="section-home"
        className="min-h-screen w-full relative flex flex-col items-center justify-between"
        style={{ backgroundImage: "url('/background.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      >
        <HomeHero />
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: THE INTERACTIVE MARS MAP & 3D GLOBE (#section-map) */}
      {/* ======================================================== */}
      <section 
        id="section-map"
        ref={mapSectionRef}
        className="h-screen w-full flex flex-col relative overflow-hidden"
        style={{ backgroundImage: "url('/background.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      >
        {/* Full-Bleed Edge-to-Edge Mars 3D Globe & Map Viewport */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <ErrorBoundary>
            {viewMode === '2d' && <MarsMap />}
            {viewMode === '3d' && <Mars3DViewer />}
            {viewMode === 'split' && (
              <div className="absolute inset-0 flex">
                <div className="w-1/2 h-full border-r border-space-700 relative">
                  <MarsMap />
                </div>
                <div className="w-1/2 h-full relative">
                  <Mars3DViewer />
                </div>
              </div>
            )}
          </ErrorBoundary>
        </div>

        {/* Floating UI Layer for Map Section */}
        <div className="relative z-10 flex flex-col h-full w-full pointer-events-none pt-20">
          <div className="flex-1 flex overflow-hidden justify-end p-4 gap-4">
            {/* Right Floating Sidebar */}
            <div className="pointer-events-auto h-full flex flex-col items-end">
              <ErrorBoundary>
                <RightSidebar />
              </ErrorBoundary>

              {/* Quick Uncollapse Floating Tab when HUD Feed is closed */}
              {!rightSidebarOpen && (
                <button
                  onClick={() => setRightSidebarOpen(true)}
                  className="mt-auto mb-auto bg-[#0B0C10]/95 border border-cyber-cyan/40 hover:border-cyber-cyan hover:bg-space-900 text-cyber-cyan px-2 py-4 rounded-xl shadow-hud-glass cursor-pointer transition-all flex flex-col items-center gap-2 group backdrop-blur-md"
                  title="Open HUD Telemetry Feed"
                >
                  <Radar className="w-4 h-4 text-cyber-cyan group-hover:scale-110 transition-transform animate-pulse" />
                  <ChevronLeft className="w-4 h-4 text-space-400 group-hover:text-cyber-cyan" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Version Badge */}
        <div className="absolute bottom-1 right-1 text-[9px] text-space-600 font-mono pointer-events-none select-none z-10">
          MarsWalk Explorer v2.5 • NASA Space Apps Challenge 2026
        </div>
      </section>

      {/* FIXED LEFT SIDEBAR (Only visible when viewing #section-map) */}
      <div className={`fixed left-4 top-1/2 -translate-y-1/2 z-[400] pointer-events-none transition-all duration-500 ${
        isMapSectionActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'
      }`}>
        <div className="pointer-events-auto flex flex-col">
          <ErrorBoundary>
            <Sidebar />
          </ErrorBoundary>
        </div>
      </div>

      {/* FIXED BOTTOM PANEL (Only visible when viewing #section-map) */}
      <div className={`fixed bottom-0 left-0 right-0 pointer-events-none z-50 w-full px-4 pb-3 flex justify-center transition-all duration-500 ${
        isMapSectionActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}>
        <div className="pointer-events-auto w-full max-w-2xl flex justify-center">
          <ErrorBoundary>
            <BottomPanel />
          </ErrorBoundary>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: SCIENCE & HIGH-RES IMAGERY HUB (#section-imagery) */}
      {/* ======================================================== */}
      <section 
        id="section-imagery"
        className="min-h-screen w-full relative flex flex-col items-center justify-center py-24 scroll-mt-14"
        style={{ backgroundImage: "url('/mars2.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#050608] via-transparent to-[#050608] opacity-90 pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-5xl flex flex-col gap-12 px-6 items-center">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-[0.15em] uppercase mb-4 shadow-black drop-shadow-2xl">
              Scientific Exploration Hub
            </h2>
            <p className="text-space-300 font-mono text-sm max-w-2xl mx-auto leading-relaxed">
              Access the In-Situ Planetary Science Laboratory and the High-Resolution Rover & Orbital Imagery Gallery. Authentic NASA PDS/JPL data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            
            {/* Launch Science Lab Button */}
            <button
              onClick={() => setScienceLabOpen(true)}
              className="group relative h-72 rounded-3xl overflow-hidden border border-white/10 hover:border-[#F16938]/60 transition-all duration-500 flex flex-col items-center justify-center text-center p-8 bg-[#0B0C10]/60 backdrop-blur-md hover:shadow-[0_0_40px_rgba(241,105,56,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#F16938]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-20 h-20 rounded-2xl bg-[#F16938]/20 text-[#F16938] border border-[#F16938]/30 flex items-center justify-center mb-6 shadow-neon-mars group-hover:scale-110 transition-transform duration-500">
                <FlaskConical className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white tracking-widest mb-2">SCIENCE LAB</h3>
              <p className="text-stone-400 font-mono text-xs">SuperCam LIBS & SHERLOC Deep-UV</p>
              
              <div className="absolute bottom-6 flex items-center gap-2 text-[#F16938] opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-widest font-mono">Launch Module</span>
              </div>
            </button>

            {/* Launch Imagery Gallery Button */}
            <button
              onClick={() => setImageryModalOpen(true)}
              className="group relative h-72 rounded-3xl overflow-hidden border border-white/10 hover:border-cyber-cyan/60 transition-all duration-500 flex flex-col items-center justify-center text-center p-8 bg-[#0B0C10]/60 backdrop-blur-md hover:shadow-[0_0_40px_rgba(0,255,204,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-20 h-20 rounded-2xl bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 flex items-center justify-center mb-6 shadow-neon-cyan group-hover:scale-110 transition-transform duration-500">
                <Camera className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white tracking-widest mb-2">IMAGERY GALLERY</h3>
              <p className="text-stone-400 font-mono text-xs">HiRISE & Mastcam-Z Raw PDS Archives</p>
              
              <div className="absolute bottom-6 flex items-center gap-2 text-cyber-cyan opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <Image className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-widest font-mono">Launch Module</span>
              </div>
            </button>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: DEEP SPACE & CELESTIAL EPHEMERIS (#section-sky) */}
      {/* ======================================================== */}
      <section 
        id="section-sky"
        className="min-h-screen w-full relative flex flex-col items-center py-24 scroll-mt-14"
        style={{ backgroundImage: "url('/mars3.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#050608] via-transparent to-[#050608] opacity-80 pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-[1400px] flex flex-col gap-12 px-6">
          <ErrorBoundary>
            <MartianSkyEphemeris />
          </ErrorBoundary>
        </div>
      </section>

      {/* GLOBAL MODALS (Fixed overlays) */}
      <ErrorBoundary>
        <ScienceLabModal />
      </ErrorBoundary>
      <ErrorBoundary>
        <MarsImageryModal />
      </ErrorBoundary>
      <ErrorBoundary>
        <EVAHelmetHUD />
      </ErrorBoundary>
      <ErrorBoundary>
        <FlightPlanModal />
      </ErrorBoundary>
      <ErrorBoundary>
        <AudioSynthesizerRack />
      </ErrorBoundary>
      <ErrorBoundary>
        <ContingencySimulator />
      </ErrorBoundary>
    </div>
  );
}

export default App;
