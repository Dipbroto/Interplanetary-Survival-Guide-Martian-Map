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

function App() {
  const { viewMode, showLoadingScreen } = useMapStore();

  // Update weather data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      useMapStore.getState().updateWeather();
    }, 60000); // Every 60 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-space-950 relative">
      {/* Loading Screen */}
      {showLoadingScreen && <LoadingScreen />}

      {/* Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar />

        {/* Map / 3D Viewport */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Map Container */}
          <div className="flex-1 relative">
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

            {/* Scan line effect overlay */}
            <div className="absolute inset-0 pointer-events-none scanline opacity-30" />
          </div>

          {/* Bottom Panel */}
          <BottomPanel />
        </div>
      </div>

      {/* Astronaut EVA Helmet HUD Simulator Overlay */}
      <EVAHelmetHUD />

      {/* In-Situ Science Laboratory & SuperCam Spectrometer Modal */}
      <ScienceLabModal />

      {/* Version Badge */}
      <div className="absolute bottom-1 right-1 text-[9px] text-space-600 font-mono pointer-events-none select-none z-10">
        MarsWalk Explorer v2.0 • NASA Space Apps Challenge 2026
      </div>
    </div>
  );
}

export default App;
