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
          className="fixed inset-0 z-[99999] bg-space-950 flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Starfield Background */}
          <div className="absolute inset-0 opacity-40">
            {/* Minimal CSS Starfield */}
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-space-800 via-space-950 to-space-950" 
                 style={{ backgroundImage: 'radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)), radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)), radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0))', backgroundSize: '200px 200px' }} />
          </div>

          {/* Center Content */}
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Mars Animation */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="relative w-48 h-48 mb-12 rounded-full overflow-hidden shadow-[0_0_60px_rgba(236,76,46,0.4)]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-mars-800 via-mars-500 to-mars-300 rounded-full" />
              <div className="absolute inset-0 bg-black/40 rounded-full shadow-[inset_-20px_-20px_40px_rgba(0,0,0,0.8)]" />
              {/* Fake texture patches */}
              <div className="absolute top-1/4 left-1/4 w-12 h-8 bg-mars-700/50 rounded-full blur-md" />
              <div className="absolute bottom-1/3 right-1/4 w-16 h-12 bg-mars-600/50 rounded-full blur-md" />
            </motion.div>

            {/* Typography */}
            <h1 className="font-display text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mars-300 via-mars-400 to-mars-500 tracking-widest text-shadow-glow mb-4 text-center">
              MARSWALK EXPLORER
            </h1>
            <h2 className="text-secondary font-mono tracking-[0.2em] uppercase text-sm md:text-base mb-16">
              NASA Space Apps Challenge 2026
            </h2>

            {/* Progress Bar Area */}
            <div className="w-64 md:w-96 flex flex-col items-center">
              <div className="w-full h-1 bg-space-800 rounded-full overflow-hidden mb-4 relative">
                <motion.div 
                  className="h-full bg-mars-400 shadow-[0_0_10px_rgba(244,112,80,0.8)]"
                  style={{ width: `${progress}%` }}
                  layout
                />
              </div>
              
              {/* Status Text with AnimatePresence for smooth swapping */}
              <div className="h-6 relative w-full flex justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={statusIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute text-primary text-xs font-mono tracking-wide"
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
