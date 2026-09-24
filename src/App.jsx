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

import { Radar, ChevronLeft } from 'lucide-react';

function App() {
  const { viewMode, showLoadingScreen, rightSidebarOpen, setRightSidebarOpen } = useMapStore();
  const [isMapSectionActive, setIsMapSectionActive] = useState(false);
  const mapSectionRef = useRef(null);

  // Update weather data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      useMapStore.getState().updateWeather();
    }, 60000); // Every 60 seconds
    return () => clearInterval(interval);
  }, []);

  // Monitor when the user is scrolled into the interactive Map section
  useEffect(() => {
    const target = mapSectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show map sidebars/panels when at least 35% of the map viewport is visible
        setIsMapSectionActive(entry.isIntersecting && entry.intersectionRatio >= 0.35);
      },
      { threshold: [0, 0.2, 0.35, 0.5, 0.8] }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-screen h-screen overflow-y-auto overflow-x-hidden bg-[#050608] selection:bg-mars-400/40 selection:text-white scroll-smooth custom-scrollbar">
      {/* GLOBAL ATMOSPHERE & LOADING SCREEN */}
      <SpaceAtmosphere />
      {showLoadingScreen && <LoadingScreen />}

      {/* TOP NAVIGATION BAR (Fixed globally across all sections) */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <TopBar />
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
      {/* SECTION 3: SCIENCE & HIGH-RES IMAGERY (#section-imagery) */}
      {/* ======================================================== */}
      <section 
        id="section-imagery"
        className="min-h-screen w-full relative flex flex-col items-center py-24 scroll-mt-14"
        style={{ backgroundImage: "url('/mars2.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#050608] via-transparent to-[#050608] opacity-80 pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-[1400px] flex flex-col gap-16 px-6">
          <div className="w-full">
            <ErrorBoundary>
              <ScienceLabModal />
            </ErrorBoundary>
          </div>
          <div className="w-full">
            <ErrorBoundary>
              <MarsImageryModal />
            </ErrorBoundary>
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
