import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Radio, Wind, Heart, Zap, Sliders } from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { marsAudio } from '../utils/audioSynthesizer';

export default function AudioSynthesizerRack() {
  const { isAudioRackOpen, setAudioRackOpen, isAudioActive, toggleAudio } = useMapStore();
  const [masterVol, setMasterVol] = useState(0.3);
  const [windVol, setWindVol] = useState(0.25);
  const [breathVol, setBreathVol] = useState(0.04);
  const [geigerVol, setGeigerVol] = useState(0.06);

  const canvasRef = useRef(null);

  // Live Audio Oscilloscope / Frequency Spectrum Visualizer
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const freqData = new Uint8Array(32);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (isAudioActive) {
        marsAudio.getFrequencyData(freqData);
      } else {
        freqData.fill(0);
      }

      const barWidth = (canvas.width / 32) - 1;
      for (let i = 0; i < 32; i++) {
        const val = isAudioActive ? freqData[i] : 4;
        const barHeight = (val / 255) * (canvas.height - 4);
        
        // Gradient color from cyan to orange
        const r = Math.round(56 + (i / 32) * 188);
        const g = Math.round(189 - (i / 32) * 75);
        const b = Math.round(248 - (i / 32) * 230);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(i * (barWidth + 1), canvas.height - barHeight - 2, barWidth, barHeight + 2);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [isAudioActive, isAudioRackOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isAudioRackOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAudioRackOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAudioRackOpen, setAudioRackOpen]);

  if (!isAudioRackOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) setAudioRackOpen(false);
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel-solid w-full max-w-lg rounded-2xl border-2 border-cyan-500/60 p-5 bg-space-950 shadow-2xl flex flex-col gap-4 font-mono text-xs relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-space-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white tracking-wider flex items-center gap-2">
                MARTIAN AUDIO SYNTHESIZER
                <span className="text-[10px] font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                  Web Audio Engine
                </span>
              </h3>
              <p className="text-[10px] text-space-400">Procedural Planetary Soundscape & Comms Rack</p>
            </div>
          </div>
          <button
            onClick={() => setAudioRackOpen(false)}
            className="px-3 py-1 bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 font-bold rounded-xl flex items-center gap-1 shadow-neon-mars transition-all hover:scale-105 active:scale-95 border border-rose-400/60 cursor-pointer backdrop-blur-md"
            title="Close Audio Mixer (ESC)"
          >
            <X className="w-3.5 h-3.5" />
            <span>← BACK (ESC)</span>
          </button>
        </div>

        {/* Master State & Spectrum Analyzer */}
        <div className="bg-space-900/60 p-3.5 rounded-xl border border-space-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-space-400 text-[10px] uppercase tracking-wider">DSP Frequency Spectrum (64-pt FFT)</span>
            <button
              onClick={toggleAudio}
              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                isAudioActive 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20' 
                  : 'bg-space-800 text-space-400 hover:text-white'
              }`}
            >
              {isAudioActive ? <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isAudioActive ? 'SYNTHESIZER ACTIVE' : 'ENGINE MUTED'}</span>
            </button>
          </div>

          <div className="h-14 w-full bg-black/50 rounded-lg border border-space-800 overflow-hidden p-1">
            <canvas ref={canvasRef} width="420" height="48" className="w-full h-full" />
          </div>
        </div>

        {/* Channel Mixing Faders */}
        <div className="grid grid-cols-3 gap-3">
          {/* Wind Channel */}
          <div className="bg-space-900/40 p-3 rounded-xl border border-space-800 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
              <Wind className="w-3.5 h-3.5" />
              <span>Martian Wind</span>
            </div>
            <p className="text-[9px] text-space-500 leading-tight">Resonant pink noise gust generator</p>
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.02"
              value={windVol}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setWindVol(val);
                marsAudio.setWindVolume(val);
              }}
              className="w-full accent-amber-500 bg-space-800 rounded-lg cursor-pointer h-1.5 mt-2"
            />
            <div className="text-[10px] text-space-400 text-right font-mono">{Math.round(windVol * 166)}%</div>
          </div>

          {/* Respirator Channel */}
          <div className="bg-space-900/40 p-3 rounded-xl border border-space-800 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-green-400 font-bold text-[11px]">
              <Heart className="w-3.5 h-3.5" />
              <span>Suit Respirator</span>
            </div>
            <p className="text-[9px] text-space-500 leading-tight">Life-support breathing rhythm</p>
            <input
              type="range"
              min="0"
              max="0.1"
              step="0.005"
              value={breathVol}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setBreathVol(val);
                marsAudio.setBreathVolume(val);
              }}
              className="w-full accent-green-500 bg-space-800 rounded-lg cursor-pointer h-1.5 mt-2"
            />
            <div className="text-[10px] text-space-400 text-right font-mono">{Math.round(breathVol * 1000)}%</div>
          </div>

          {/* Geiger Channel */}
          <div className="bg-space-900/40 p-3 rounded-xl border border-space-800 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px]">
              <Zap className="w-3.5 h-3.5" />
              <span>Geiger Clicks</span>
            </div>
            <p className="text-[9px] text-space-500 leading-tight">Cosmic radiation Poisson pulse</p>
            <input
              type="range"
              min="0"
              max="0.15"
              step="0.01"
              value={geigerVol}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setGeigerVol(val);
                marsAudio.setGeigerVolume(val);
              }}
              className="w-full accent-purple-500 bg-space-800 rounded-lg cursor-pointer h-1.5 mt-2"
            />
            <div className="text-[10px] text-space-400 text-right font-mono">{Math.round(geigerVol * 666)}%</div>
          </div>
        </div>

        {/* Radio Quindar Tone Check Button */}
        <div className="flex items-center justify-between pt-2 border-t border-space-800">
          <button
            onClick={() => marsAudio.playQuindarTone(true)}
            className="px-3 py-1.5 bg-space-800 hover:bg-space-700 text-cyan-300 rounded-lg flex items-center gap-1.5 transition-colors border border-space-700"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Test NASA Quindar Tone (2525 Hz)</span>
          </button>

          <span className="text-[10px] text-space-500">
            Marswalk Audio Core v2.0
          </span>
        </div>
      </motion.div>
    </div>
  );
}
