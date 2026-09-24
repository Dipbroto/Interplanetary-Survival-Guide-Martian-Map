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
    <div 
      className="h-screen w-screen flex flex-col overflow-hidden relative selection:bg-mars-400/40 selection:text-white"
      style={{ backgroundImage: "url('/background.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      {/* Dynamic Cosmic Background Atmosphere */}
      <SpaceAtmosphere />

      {/* Loading Screen */}
      {showLoadingScreen && <LoadingScreen />}

      {/* Center Box Map / 3D Viewport */}
      <div className="absolute top-[10%] bottom-[10%] left-[25%] right-[25%] z-0 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.7)] border border-white/10">
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

      {/* Floating UI Layer */}
      <div className="relative z-10 flex flex-col h-full w-full pointer-events-none">
        {/* Top Navigation */}
        <div className="pointer-events-auto">
          <TopBar />
        </div>

        <div className="flex-1 flex overflow-hidden justify-between p-4 gap-4">
          {/* Left Floating Sidebar */}
          <div className="pointer-events-auto h-full flex flex-col">
            <ErrorBoundary>
              <Sidebar />
            </ErrorBoundary>
          </div>

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

        {/* Bottom Floating Panel */}
        <div className="pointer-events-auto w-full px-4 pb-4">
          <ErrorBoundary>
            <BottomPanel />
          </ErrorBoundary>
        </div>
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
