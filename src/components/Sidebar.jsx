import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Route, MapPin, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';
import useMapStore from '../store/useMapStore';
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
    { id: 'layers', label: 'Layers', icon: Layers },
    { id: 'route', label: 'Route', icon: Route },
    { id: 'poi', label: 'POI', icon: MapPin },
    { id: 'mission', label: 'Mission', icon: Rocket },
  ];

  const renderContent = () => {
    switch (sidebarTab) {
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
        return null;
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarOpen ? 380 : 52 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative z-30 flex flex-col h-full glass-panel-solid border-r border-space-700 bg-space-950/95 backdrop-blur-xl shrink-0 overflow-hidden"
    >
      {/* Tab Navigation */}
      <div className="shrink-0 border-b border-space-800">
        <div className={`flex ${sidebarOpen ? 'flex-row' : 'flex-col'} items-center p-1.5 gap-1`}>
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
                className={`flex items-center gap-2 p-2 rounded-lg transition-all text-xs ${
                  sidebarOpen ? 'flex-1 justify-center' : 'w-full justify-center'
                } ${
                  isActive
                    ? 'bg-mars-500/20 text-mars-400 border border-mars-500/30'
                    : 'text-space-400 hover:text-primary hover:bg-space-800/60 border border-transparent'
                }`}
                title={tab.label}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && (
                  <span className="font-semibold uppercase tracking-wider">{tab.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.div
              key={sidebarTab}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.15 }}
              className="p-3"
            >
              {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-14 bg-space-800/90 border border-space-700 rounded-r-lg flex items-center justify-center text-space-400 hover:text-mars-400 hover:bg-space-700 transition-colors z-50"
      >
        {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    </motion.div>
  );
}
