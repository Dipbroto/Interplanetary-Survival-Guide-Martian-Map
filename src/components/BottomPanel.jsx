import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Cloud, Zap, CloudFog, ChevronUp, ChevronDown } from 'lucide-react';
import useMapStore from '../store/useMapStore';
import ElevationProfile from './ElevationProfile';
import WeatherPanel from './WeatherPanel';
import RadiationPanel from './RadiationPanel';
import DustStormTracker from './DustStormTracker';

export default function BottomPanel() {
  const { 
    bottomPanelOpen, 
    setBottomPanelOpen, 
    bottomPanelTab, 
    setBottomPanelTab,
    weather,
    waypoints
  } = useMapStore();

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

  return (
    <motion.div
      initial={false}
      animate={{ height: bottomPanelOpen ? 295 : 40 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative z-30 shrink-0 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0B0C10]/70 backdrop-blur-3xl overflow-hidden shadow-hud-glass transition-all hover:bg-[#0B0C10]/80"
    >
      {/* Tab Bar Header (Horizontal Scrollable Menu Bar) */}
      <div className="flex items-center justify-between h-10 px-3 bg-space-900/80 border-b border-white/[0.06] shrink-0 font-mono">
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
                onClick={() => {
                  setBottomPanelTab(tab.id);
                  if (!bottomPanelOpen) setBottomPanelOpen(true);
                }}
                className={`relative shrink-0 flex items-center gap-2 px-3 h-full transition-all text-xs font-semibold ${
                  isActive
                    ? 'text-mars-300 bg-mars-500/10'
                    : 'text-space-300 hover:text-white hover:bg-space-850/50'
                }`}
              >
                {/* Active Top Laser Indicator */}
                {isActive && (
                  <span className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-mars-500 via-mars-400 to-amber-400 shadow-[0_0_8px_#f47050]" />
                )}
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-mars-400' : 'text-space-400'}`} />
                <span className="uppercase tracking-wider text-[11px] whitespace-nowrap">{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${tab.badgeColor} whitespace-nowrap`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
          className="p-1 text-space-400 hover:text-mars-400 transition-colors rounded hover:bg-space-800 shrink-0 ml-2"
          title={bottomPanelOpen ? "Minimize Telemetry Deck" : "Expand Telemetry Deck"}
        >
          {bottomPanelOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Content Area (Vertical Scrollable) */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {bottomPanelOpen && (
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
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
