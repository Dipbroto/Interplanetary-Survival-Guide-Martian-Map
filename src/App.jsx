import React, { useEffect } from 'react';
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

import { Radar, ChevronLeft } from 'lucide-react';

function App() {
  const { viewMode, showLoadingScreen, rightSidebarOpen, setRightSidebarOpen } = useMapStore();

  // Update weather data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      useMapStore.getState().updateWeather();
    }, 60000); // Every 60 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-space-900 relative selection:bg-mars-400/40 selection:text-white">
      {/* Dynamic Cosmic Background Atmosphere */}
      <SpaceAtmosphere />

      {/* Loading Screen */}
      {showLoadingScreen && <LoadingScreen />}

      {/* Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>

        {/* Map / 3D Viewport */}
        <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">
          {/* Map Container */}
          <div className="flex-1 relative">
            <ErrorBoundary>
              {viewMode === '2d' && (
                <div className="absolute inset-0">
                  <MarsMap />
                </div>
              )}

              {viewMode === '3d' && (
                <div className="absolute inset-0">
                  <Mars3DViewer />
                </div>
              )}

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

            {/* Quick Uncollapse Floating Tab when HUD Feed is closed */}
            {!rightSidebarOpen && (
              <button
                onClick={() => setRightSidebarOpen(true)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-[#0B0C10]/95 border-l border-t border-b border-cyber-cyan/40 hover:border-cyber-cyan hover:bg-space-900 text-cyber-cyan px-1.5 py-3.5 rounded-l-xl flex flex-col items-center gap-1.5 shadow-hud-glass cursor-pointer transition-all hover:translate-x-[-2px] group"
                title="Open HUD Telemetry Feed"
              >
                <Radar className="w-3.5 h-3.5 text-cyber-cyan group-hover:scale-110 transition-transform animate-pulse" />
                <span className="[writing-mode:vertical-lr] text-[9px] font-mono tracking-widest uppercase font-bold text-space-300 group-hover:text-cyber-cyan">
                  HUD FEED
                </span>
                <ChevronLeft className="w-3 h-3 text-space-400 group-hover:text-cyber-cyan" />
              </button>
            )}
          </div>

          {/* Bottom Panel (Spans Full Center Width) */}
          <ErrorBoundary>
            <BottomPanel />
          </ErrorBoundary>
        </div>

        {/* Right Sidebar: HUD Telemetry Feed & Radar Scanner */}
        <ErrorBoundary>
          <RightSidebar />
        </ErrorBoundary>
      </div>

      {/* Astronaut EVA Helmet HUD Simulator Overlay */}
      <ErrorBoundary>
        <EVAHelmetHUD />
      </ErrorBoundary>

      {/* In-Situ Science Laboratory & SuperCam Spectrometer Modal */}
      <ErrorBoundary>
        <ScienceLabModal />
      </ErrorBoundary>

      {/* Official NASA EVA Flight Plan & Checklist Modal */}
      <ErrorBoundary>
        <FlightPlanModal />
      </ErrorBoundary>

      {/* Martian Sky & Moons (Phobos/Deimos) Ephemeris Modal */}
      <ErrorBoundary>
        <MartianSkyEphemeris />
      </ErrorBoundary>

      {/* Procedural Audio Mixer & Synthesizer Console */}
      <ErrorBoundary>
        <AudioSynthesizerRack />
      </ErrorBoundary>

      {/* NASA What-If Contingency Simulator & Emergency Alert System */}
      <ErrorBoundary>
        <ContingencySimulator />
      </ErrorBoundary>

      {/* NASA HiRISE & Rover Raw Imagery Explorer Modal */}
      <ErrorBoundary>
        <MarsImageryModal />
      </ErrorBoundary>

      {/* Version Badge */}
      <div className="absolute bottom-1 right-1 text-[9px] text-space-600 font-mono pointer-events-none select-none z-10">
        MarsWalk Explorer v2.5 • NASA Space Apps Challenge 2026
      </div>
    </div>
  );
}

export default App;
