import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Cloud, Zap, CloudFog, ChevronUp, ChevronDown } from 'lucide-react';
import useMapStore from '../store/useMapStore';
import ElevationProfile from './ElevationProfile';
import WeatherPanel from './WeatherPanel';
import RadiationPanel from './RadiationPanel';
import DustStormTracker from './DustStormTracker';

export default function BottomPanel() {
  const bottomPanelOpen = useMapStore(s => s.bottomPanelOpen);
  const setBottomPanelOpen = useMapStore(s => s.setBottomPanelOpen);
  const bottomPanelTab = useMapStore(s => s.bottomPanelTab);
  const setBottomPanelTab = useMapStore(s => s.setBottomPanelTab);
  const weather = useMapStore(s => s.weather);
  const waypoints = useMapStore(s => s.waypoints);

  const tabs = [
    { 
      id: 'elevation', 
      label: 'Elevation', 
      icon: BarChart3,
      badge: waypoints && waypoints.length > 1 ? `${waypoints.length} WPs` : null,
      badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800'
    },
    { 
      id: 'weather', 
      label: 'Weather', 
      icon: Cloud,
      badge: weather?.temperature?.avg !== undefined ? `${Math.round(weather.temperature.avg)}°C` : 'MEDA',
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800'
    },
    { 
      id: 'radiation', 
      label: 'Radiation', 
      icon: Zap,
      badge: '0.06 mSv/h',
      badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800'
    },
    { 
      id: 'dust', 
      label: 'Dust Storms', 
      icon: CloudFog,
      badge: weather?.dustOpacity ? `τ ${weather.dustOpacity.toFixed(2)}` : 'CLEAR',
      badgeColor: 'text-mars-400 bg-mars-950/60 border-mars-800'
    },
  ];

  const renderContent = () => {
    switch (bottomPanelTab) {
      case 'elevation': return <ElevationProfile />;
      case 'weather': return <WeatherPanel />;
      case 'radiation': return <RadiationPanel />;
      case 'dust': return <DustStormTracker />;
      default: return null;
    }
  };

  // Minimized state: Aerodynamic, floating aerospace telemetry capsule
  if (!bottomPanelOpen) {
    return (
      <div 
        onClick={() => setBottomPanelOpen(true)}
        className="cursor-pointer group flex items-center justify-between gap-3 px-4 py-2 rounded-full bg-[#0B0C10]/85 border border-white/10 shadow-hud-glass backdrop-blur-2xl hover:bg-[#0B0C10]/95 hover:border-[#F16938]/40 transition-all font-mono text-xs text-stone-300 hover:text-white"
        title="Click to Open Environmental & Elevation Telemetry Deck"
      >
        <div className="flex items-center gap-1.5 text-amber-300">
          <Cloud className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold tabular-nums">{weather?.temperature?.avg !== undefined ? `${Math.round(weather.temperature.avg)}°C` : '-62°C'}</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5 text-purple-300">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-bold tabular-nums">0.06 mSv/h</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5 text-cyan-300">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold tracking-tight">{waypoints && waypoints.length > 1 ? `${waypoints.length} Waypoints` : 'Elevation'}</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1 text-[#F16938] group-hover:text-[#FF8A65] font-display font-bold text-[11px] uppercase tracking-[0.14em]">
          <span>Telemetry Deck</span>
          <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    );
  }

  // Expanded state: Full multi-tab telemetry deck
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative z-30 shrink-0 flex flex-col rounded-2xl border border-white/[0.12] bg-[#0B0C10]/90 backdrop-blur-3xl overflow-hidden shadow-2xl h-[295px] w-full"
    >
      {/* Tab Bar Header */}
      <div className="flex items-center justify-between h-10 px-3 bg-space-900/90 border-b border-white/[0.08] shrink-0 font-mono">
        <div 
          onWheel={(e) => {
            if (e.deltaY !== 0 && e.deltaX === 0) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
          className="flex items-center gap-2 h-full overflow-x-auto overflow-y-hidden custom-scrollbar-x whitespace-nowrap min-w-0 flex-1 py-0.5 scroll-smooth"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = bottomPanelTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setBottomPanelTab(tab.id)}
                className={`relative shrink-0 flex items-center gap-2 px-3 h-full transition-all text-xs font-mono font-medium ${
                  isActive
                    ? 'text-stone-100 bg-[#F16938]/15 border-b-2 border-[#F16938]'
                    : 'text-stone-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F16938]' : 'text-stone-400'}`} />
                <span className="font-display font-bold uppercase tracking-[0.14em] text-[11px] whitespace-nowrap">{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono tabular-nums font-semibold ${tab.badgeColor} whitespace-nowrap`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setBottomPanelOpen(false)}
          className="flex items-center gap-1 px-2.5 py-1 text-stone-400 hover:text-[#F16938] transition-colors rounded-lg hover:bg-white/[0.04] shrink-0 ml-2 text-[10px] font-mono uppercase tracking-wider font-semibold"
          title="Minimize Telemetry Deck"
        >
          <span>Minimize</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={bottomPanelTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 p-3 overflow-y-auto overflow-x-hidden custom-scrollbar-y"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
