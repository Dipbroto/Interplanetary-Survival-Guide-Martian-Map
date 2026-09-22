import React, { useState, useEffect } from 'react';
import useMapStore from '../store/useMapStore';
import { routeDistance, estimateEVATime } from '../utils/marsUtils';
import { getElevationProfile, getProfileStats } from '../utils/elevationService';
import { MapPin, Plus, Trash2, Navigation, Clock, ArrowUpDown, Route } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoutePlanner() {
  const { waypoints, isPlacingWaypoint, setPlacingWaypoint, removeWaypoint, updateWaypoint, clearWaypoints } = useMapStore();
  const [distance, setDistance] = useState(0);
  const [evaTime, setEvaTime] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (waypoints && waypoints.length > 1) {
      const dist = routeDistance(waypoints);
      setDistance(dist);
      setEvaTime(estimateEVATime(dist, waypoints));
      
      const profile = getElevationProfile(waypoints, 100);
      setStats(getProfileStats(profile));
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
    <div className="flex flex-col space-y-4 p-4 glass-panel rounded-xl text-primary w-full h-full max-h-[100%]">
      <div className="flex justify-between items-center mb-2">
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

      <div className="grid grid-cols-2 gap-2 mb-2 bg-space-800/50 p-3 rounded-lg border border-space-700 text-sm">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-mars-400" />
          <div>
            <div className="text-secondary text-[10px] uppercase tracking-wide">Total Distance</div>
            <div className="font-mono text-sm">{distance.toFixed(2)} km</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-mars-400" />
          <div>
            <div className="text-secondary text-[10px] uppercase tracking-wide">Est. EVA Time</div>
            <div className="font-mono text-sm">{evaTime.toFixed(1)} hrs</div>
          </div>
        </div>
        {stats && (
          <>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-green-400" />
              <div>
                <div className="text-secondary text-[10px] uppercase tracking-wide">Elevation Gain</div>
                <div className="font-mono text-sm text-green-400">+{stats.gain.toFixed(0)} m</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-secondary text-[10px] uppercase tracking-wide">Elevation Loss</div>
                <div className="font-mono text-sm text-red-400">-{stats.loss.toFixed(0)} m</div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 custom-scrollbar">
        <AnimatePresence>
          {(!waypoints || waypoints.length === 0) ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-secondary text-sm flex flex-col items-center justify-center h-full"
            >
              <MapPin className="w-8 h-8 text-space-600 mb-2" />
              <p>No waypoints added.</p>
              <p className="text-xs mt-1">Click "Add Waypoint" to begin planning a route.</p>
            </motion.div>
          ) : (
            waypoints.map((wp, index) => {
              const colorRatio = waypoints.length > 1 ? index / (waypoints.length - 1) : 0;
              // Gradient from green (#10b981) to red (#ef4444)
              const r = Math.round(16 + colorRatio * (239 - 16));
              const g = Math.round(185 + colorRatio * (68 - 185));
              const b = Math.round(129 + colorRatio * (68 - 129));
              
              return (
                <motion.div
                  key={wp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-3 bg-space-800/40 p-2.5 rounded-lg border border-space-700/50 hover:bg-space-800/60 transition-colors group shadow-sm"
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0 cursor-grab active:cursor-grabbing"
                    style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                  >
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={wp.name || `Waypoint ${index + 1}`}
                      onChange={(e) => handleNameChange(wp.id, e.target.value)}
                      className="bg-transparent border-none text-sm font-semibold focus:ring-0 w-full p-0 text-primary placeholder-space-600 focus:outline-none transition-colors hover:text-white"
                      placeholder={`Waypoint ${index + 1}`}
                    />
                    <div className="text-[10px] text-space-400 font-mono truncate mt-0.5">
                      {wp.lat.toFixed(4)}°, {wp.lng.toFixed(4)}° | Elev: {wp.elevation ? wp.elevation.toFixed(0) : 0}m
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeWaypoint(wp.id)}
                    className="p-1.5 text-space-500 hover:text-red-400 opacity-50 group-hover:opacity-100 transition-all rounded-md hover:bg-space-700/80 flex-shrink-0"
                    title="Remove Waypoint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2 pt-3 border-t border-space-700/80 mt-auto">
        <button
          onClick={() => setPlacingWaypoint(!isPlacingWaypoint)}
          className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 ${
            isPlacingWaypoint 
              ? 'bg-mars-500 text-white shadow-lg shadow-mars-500/25 scale-[0.98]' 
              : 'bg-space-800 hover:bg-space-700 text-primary border border-space-700 shadow-sm'
          }`}
        >
          <Plus className={`w-4 h-4 transition-transform ${isPlacingWaypoint ? 'rotate-45' : ''}`} />
          {isPlacingWaypoint ? 'Cancel Placing' : 'Add Waypoint'}
        </button>
        
        {waypoints && waypoints.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear the entire route?')) {
                clearWaypoints();
              }
            }}
            className="p-2.5 rounded-lg bg-space-800 hover:bg-red-500/20 text-space-400 hover:text-red-400 border border-space-700 transition-colors shadow-sm"
            title="Clear Route"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
