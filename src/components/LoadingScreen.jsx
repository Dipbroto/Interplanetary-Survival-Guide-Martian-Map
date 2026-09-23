import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useMapStore from '../store/useMapStore';

const loadingStatuses = [
  'Initializing Mars terrain data...',
  'Loading NASA WMTS tile services...',
  'Calibrating MOLA elevation models...',
  'Syncing Mars weather systems...',
  'Preparing Marswalk route planner...',
  'Systems ready. Welcome to Mars.'
];

export default function LoadingScreen() {
  const { showLoadingScreen, setShowLoadingScreen } = useMapStore();
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (!showLoadingScreen) return;

    const totalDuration = 3500; // 3.5 seconds
    const interval = 50;
    const steps = totalDuration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      // Update status text based on progress
      const newIndex = Math.min(
        Math.floor((newProgress / 100) * loadingStatuses.length),
        loadingStatuses.length - 1
      );
      setStatusIndex(newIndex);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => setShowLoadingScreen(false), 200);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [showLoadingScreen, setShowLoadingScreen]);

  return (
    <AnimatePresence>
      {showLoadingScreen && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[99999] bg-space-900 flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Starfield Background */}
          <div className="absolute inset-0 opacity-35">
            <div className="w-full h-full" 
                 style={{ backgroundImage: 'radial-gradient(1.5px 1.5px at 20px 30px, #fff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 40px 70px, #00FFCC, rgba(0,0,0,0)), radial-gradient(2px 2px at 50px 160px, #E27B58, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 90px 40px, #fff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 130px 80px, #fff, rgba(0,0,0,0))', backgroundSize: '200px 200px' }} />
          </div>

          {/* Subtle grid lines */}
          <div className="absolute inset-0 grid-lines opacity-20" />

          {/* Center Content */}
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Mars Globe Animation */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="relative w-44 h-44 mb-14 rounded-full overflow-hidden shadow-[0_0_80px_rgba(226,123,88,0.35)]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-mars-900 via-mars-400 to-mars-200 rounded-full" />
              <div className="absolute inset-0 bg-black/35 rounded-full shadow-[inset_-24px_-24px_48px_rgba(0,0,0,0.85)]" />
              {/* Surface texture patches */}
              <div className="absolute top-1/4 left-1/4 w-14 h-9 bg-mars-700/50 rounded-full blur-md" />
              <div className="absolute bottom-1/3 right-1/4 w-18 h-14 bg-mars-600/45 rounded-full blur-md" />
            </motion.div>

            {/* Typography — Space Grotesk + Rajdhani */}
            <h1 className="font-display text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mars-200 via-mars-400 to-mars-500 tracking-[0.15em] text-shadow-glow mb-3 text-center">
              MARSWALK EXPLORER
            </h1>
            <h2 className="text-space-300 font-mono tracking-[0.25em] uppercase text-xs md:text-sm mb-16">
              NASA Space Apps Challenge 2026
            </h2>

            {/* Progress Bar Area */}
            <div className="w-64 md:w-96 flex flex-col items-center">
              <div className="w-full h-[3px] bg-space-800 rounded-full overflow-hidden mb-4 relative">
                <motion.div 
                  className="h-full bg-gradient-to-r from-mars-400 to-cyber-cyan shadow-[0_0_12px_rgba(0,255,204,0.6)]"
                  style={{ width: `${progress}%` }}
                  layout
                />
              </div>
              
              {/* Status Text */}
              <div className="h-6 relative w-full flex justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={statusIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute text-space-200 text-xs font-mono tracking-wider"
                  >
                    {loadingStatuses[statusIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
