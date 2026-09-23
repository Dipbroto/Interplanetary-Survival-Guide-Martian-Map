import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Layers, Route, MapPin, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';
import useMapStore from '../store/useMapStore';
import SurvivalGuidePanel from './SurvivalGuidePanel';
import LayerPanel from './LayerPanel';
import RoutePlanner from './RoutePlanner';
import RouteAnalysis from './RouteAnalysis';
import POIDetailCard from './POIDetailCard';
import MissionTimeline from './MissionTimeline';
import ResourceCalculator from './ResourceCalculator';
import MissionReport from './MissionReport';

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, sidebarTab, setSidebarTab } = useMapStore();

  const tabs = [
    { id: 'guide', label: 'The Guide', icon: ShieldCheck },
    { id: 'layers', label: 'Layers', icon: Layers },
    { id: 'route', label: 'Route', icon: Route },
    { id: 'poi', label: 'POI', icon: MapPin },
    { id: 'mission', label: 'Mission', icon: Rocket },
  ];

  const renderContent = () => {
    switch (sidebarTab) {
      case 'guide':
        return <SurvivalGuidePanel />;
      case 'layers':
        return <LayerPanel />;
      case 'route':
        return (
          <div className="flex flex-col gap-4">
            <RoutePlanner />
            <RouteAnalysis />
          </div>
        );
      case 'poi':
        return <POIDetailCard />;
      case 'mission':
        return (
          <div className="flex flex-col gap-4">
            <MissionTimeline />
            <ResourceCalculator />
            <MissionReport />
          </div>
        );
      default:
        return <SurvivalGuidePanel />;
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarOpen ? 396 : 54 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative z-30 flex flex-col h-full border-r border-white/[0.05] bg-[#0B0C10]/96 backdrop-blur-2xl shrink-0 overflow-hidden shadow-hud-glass"
    >
      {/* Tab Navigation Bar (Horizontal when open, Vertical when collapsed) */}
      <div className="shrink-0 border-b border-white/[0.05] bg-space-900/40 p-1.5">
        <div 
          onWheel={(e) => {
            if (sidebarOpen && e.deltaY !== 0 && e.deltaX === 0) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
          className={`flex ${
            sidebarOpen 
              ? 'flex-row overflow-x-auto overflow-y-hidden custom-scrollbar-x whitespace-nowrap py-0.5' 
              : 'flex-col overflow-y-auto overflow-x-hidden custom-scrollbar-y py-1 max-h-[calc(100vh-120px)]'
          } items-center gap-1.5 scroll-smooth`}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = sidebarTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSidebarTab(tab.id);
                  if (!sidebarOpen) setSidebarOpen(true);
                }}
                className={`relative flex items-center gap-2 py-2 px-2.5 rounded-xl transition-all text-xs font-sans font-medium shrink-0 ${
                  sidebarOpen ? 'flex-1 min-w-[70px] justify-center' : 'w-full justify-center'
                } ${
                  isActive
                    ? 'bg-mars-400/12 text-mars-300 border border-mars-400/30 shadow-[0_0_15px_rgba(226,123,88,0.15)]'
                    : 'text-space-300 hover:text-white hover:bg-space-800/40 border border-transparent'
                }`}
                title={tab.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-mars-400' : 'text-space-400'}`} />
                {sidebarOpen && (
                  <span className="font-semibold uppercase tracking-[0.1em] text-[11px] whitespace-nowrap">{tab.label}</span>
                )}
                {/* Active Laser Underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-mars-400 to-transparent shadow-[0_0_8px_rgba(226,123,88,0.6)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area (Vertical Scrollable) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-y">
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.div
              key={sidebarTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="p-3.5 space-y-4"
            >
              {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse Handle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-12 bg-space-900/90 border border-white/10 rounded-r-lg flex items-center justify-center text-space-400 hover:text-mars-400 hover:border-mars-500/50 transition-all z-50 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    </motion.div>
  );
}
