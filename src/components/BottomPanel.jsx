import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Cloud, Zap, CloudFog, ChevronUp, ChevronDown } from 'lucide-react';
import useMapStore from '../store/useMapStore';
import ElevationProfile from './ElevationProfile';
import WeatherPanel from './WeatherPanel';
import RadiationPanel from './RadiationPanel';
import DustStormTracker from './DustStormTracker';

export default function BottomPanel() {
  const { bottomPanelOpen, setBottomPanelOpen, bottomPanelTab, setBottomPanelTab } = useMapStore();

  const tabs = [
    { id: 'elevation', label: 'Elevation', icon: BarChart3 },
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'radiation', label: 'Radiation', icon: Zap },
    { id: 'dust', label: 'Dust Storms', icon: CloudFog },
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
      animate={{ height: bottomPanelOpen ? 280 : 36 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative z-20 shrink-0 flex flex-col glass-panel-solid border-t border-space-700 bg-space-950/95 backdrop-blur-xl overflow-hidden"
    >
      {/* Tab Bar Header */}
      <div className="flex items-center justify-between h-9 px-3 bg-space-900/60 border-b border-space-800 shrink-0">
        <div className="flex items-center gap-0.5 h-full">
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
                className={`flex items-center gap-1.5 px-3 h-full border-t-2 transition-all text-xs ${
                  isActive
                    ? 'border-mars-500 bg-space-800/40 text-mars-400'
                    : 'border-transparent text-space-400 hover:text-primary hover:bg-space-800/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="font-semibold uppercase tracking-wider">{tab.label}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
          className="p-1 text-space-400 hover:text-mars-400 transition-colors rounded"
        >
          {bottomPanelOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {bottomPanelOpen && (
            <motion.div
              key={bottomPanelTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 p-3 overflow-y-auto"
            >
              {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
