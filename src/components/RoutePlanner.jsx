import React, { useState, useEffect } from 'react';
import useMapStore from '../store/useMapStore';
import { routeDistance, estimateEVATime } from '../utils/marsUtils';
import { getElevationProfile, getProfileStats } from '../utils/elevationService';
import { expeditionPresets } from '../data/expeditionPresets';
import { MapPin, Plus, Trash2, Navigation, Clock, ArrowUpDown, Route, Compass, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoutePlanner() {
  const { 
    waypoints, 
    isPlacingWaypoint, 
    setPlacingWaypoint, 
    removeWaypoint, 
    updateWaypoint, 
    clearWaypoints,
    loadExpeditionPreset,
    setEVASimulating
  } = useMapStore();

  const [distance, setDistance] = useState(0);
  const [evaTime, setEvaTime] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (waypoints && waypoints.length > 1) {
      const dist = routeDistance(waypoints);
      setDistance(dist);
      const profile = getElevationProfile(waypoints, 100);
      const calculatedStats = getProfileStats(profile);
      setStats(calculatedStats);
      
      const est = estimateEVATime(dist, calculatedStats ? calculatedStats.avgSlope : 0);
      setEvaTime(typeof est === 'object' ? est.totalHours : est);
    } else {
      setDistance(0);
      setEvaTime(0);
      setStats(null);
    }
  }, [waypoints]);

  const handleNameChange = (id, newName) => {
    updateWaypoint(id, { name: newName });
  };

  return (
    <div className="flex flex-col space-y-3 p-4 glass-panel rounded-xl text-primary w-full h-full max-h-[100%]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display text-mars-400 flex items-center gap-2">
          <Route className="w-5 h-5" />
          Route Planner
        </h2>
        {isPlacingWaypoint && (
          <span className="flex items-center text-xs text-mars-400 bg-mars-500/20 px-2 py-1 rounded-full animate-pulse font-bold">
            <Navigation className="w-3 h-3 mr-1" />
            Placing...
          </span>
        )}
      </div>

      {/* NASA Presets Quick Selector */}
      <div className="bg-space-900/80 p-2.5 rounded-lg border border-space-700/60">
        <div className="text-[10px] uppercase font-mono tracking-wider text-space-400 mb-1.5 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-mars-400" />
          <span>NASA Expedition Presets</span>
        </div>
        <select
          onChange={(e) => {
            const found = expeditionPresets.find(p => p.id === e.target.value);
            if (found) loadExpeditionPreset(found);
          }}
          defaultValue=""
          className="w-full bg-space-800 border border-space-700 text-xs text-primary rounded px-2.5 py-1.5 focus:outline-none focus:border-mars-500 transition-colors"
        >
          <option value="" disabled>Select a NASA Expedition Route...</option>
          {expeditionPresets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name} ({preset.distanceKm} km)
            </option>
          ))}
        </select>
      </div>

      {/* Metrics Summary Card */}
      <div className="grid grid-cols-2 gap-2 bg-space-800/50 p-2.5 rounded-lg border border-space-700 text-sm">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-mars-400" />
          <div>
            <div className="text-space-400 text-[10px] uppercase tracking-wide">Distance</div>
            <div className="font-mono text-sm font-semibold">{distance.toFixed(2)} km</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-mars-400" />
          <div>
            <div className="text-space-400 text-[10px] uppercase tracking-wide">Est. Time</div>
            <div className="font-mono text-sm font-semibold text-mars-400">{evaTime.toFixed(1)} hrs</div>
          </div>
        </div>
        {stats && (
          <>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-green-400" />
              <div>
                <div className="text-space-400 text-[10px] uppercase tracking-wide">Elev Gain</div>
                <div className="font-mono text-xs text-green-400">+{stats.gain.toFixed(0)} m</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-space-400 text-[10px] uppercase tracking-wide">Elev Loss</div>
                <div className="font-mono text-xs text-red-400">-{stats.loss.toFixed(0)} m</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Waypoints List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 custom-scrollbar">
        <AnimatePresence>
          {(!waypoints || waypoints.length === 0) ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6 text-space-400 text-sm flex flex-col items-center justify-center h-full"
            >
              <MapPin className="w-8 h-8 text-space-600 mb-2" />
              <p className="font-medium text-space-300">No waypoints added</p>
              <p className="text-xs mt-1 text-space-500">Click "Add Waypoint" or pick a NASA preset above.</p>
            </motion.div>
          ) : (
            waypoints.map((wp, index) => {
              const colorRatio = waypoints.length > 1 ? index / (waypoints.length - 1) : 0;
              const r = Math.round(16 + colorRatio * (239 - 16));
              const g = Math.round(185 + colorRatio * (68 - 185));
              const b = Math.round(129 + colorRatio * (68 - 129));
              const wpColor = `rgb(${r}, ${g}, ${b})`;
              const displayLon = wp.lon !== undefined ? wp.lon : (wp.lng !== undefined ? wp.lng : 0);

              return (
                <motion.div
                  key={wp.id || `wp-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2 p-2 bg-space-800/60 hover:bg-space-800 border border-space-700/60 hover:border-space-600 rounded-lg group transition-all"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold text-space-950 shrink-0 shadow-sm"
                    style={{ backgroundColor: wpColor }}
                  >
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={wp.name || `Waypoint ${index + 1}`}
                      onChange={(e) => handleNameChange(wp.id, e.target.value)}
                      className="bg-transparent border-none text-xs font-semibold focus:ring-0 w-full p-0 text-primary placeholder-space-500 focus:outline-none transition-colors hover:text-white"
                      placeholder={`Waypoint ${index + 1}`}
                    />
                    <div className="text-[10px] text-space-400 font-mono truncate mt-0.5">
                      {wp.lat.toFixed(4)}°, {displayLon.toFixed(4)}° | Elev: {wp.elevation ? wp.elevation.toFixed(0) : 0} m
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeWaypoint(wp.id)}
                    className="p-1.5 text-space-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-all rounded-md hover:bg-space-700/80 shrink-0"
                    title="Remove Waypoint"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-2 border-t border-space-700/80 mt-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setPlacingWaypoint(!isPlacingWaypoint)}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium transition-all ${
              isPlacingWaypoint 
                ? 'bg-mars-500 text-white shadow-lg shadow-mars-500/25' 
                : 'bg-space-800 hover:bg-space-700 text-primary border border-space-700'
            }`}
          >
            <Plus className={`w-3.5 h-3.5 transition-transform ${isPlacingWaypoint ? 'rotate-45' : ''}`} />
            {isPlacingWaypoint ? 'Cancel Placing' : 'Drop Waypoint on Map'}
          </button>
          
          {waypoints && waypoints.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all waypoints?')) {
                  clearWaypoints();
                }
              }}
              className="p-2 rounded-lg bg-space-800 hover:bg-red-500/20 text-space-400 hover:text-red-400 border border-space-700 transition-colors"
              title="Clear Route"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Marswalk Simulator Launch Button */}
        {waypoints && waypoints.length > 1 && (
          <button
            onClick={() => setEVASimulating(true)}
            className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-mars-600 to-amber-600 hover:from-mars-500 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-mars-600/30 transition-all hover:scale-[1.01]"
          >
            <Play className="w-4 h-4 fill-white" />
            Launch Marswalk Simulator (EVA HUD)
          </button>
        )}
      </div>
    </div>
  );
}
