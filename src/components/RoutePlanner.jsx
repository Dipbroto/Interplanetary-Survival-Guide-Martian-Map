import React, { useState, useEffect, useMemo } from 'react';
import useMapStore from '../store/useMapStore';
import { routeDistance, estimateEVATime, marsDistance } from '../utils/marsUtils';
import { getElevationProfile, getProfileStats } from '../utils/elevationService';
import { expeditionPresets } from '../data/expeditionPresets';
import { 
  MapPin, Plus, Trash2, Navigation, Clock, ArrowUpDown, Route, 
  Compass, Play, Pause, Cpu, ShieldCheck, Sparkles, Zap, ChevronRight, 
  FileText, ShieldAlert, CheckCircle2, Info, RotateCcw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AUTONOMOUS_TARGET_PAIRS, generateAutonomousTraverse } from '../utils/autonomousRouter';
import ProvenanceBadge from './ProvenanceBadge';
import { marsAudio } from '../utils/audioSynthesizer';

export default function RoutePlanner() {
  const { 
    waypoints, 
    isPlacingWaypoint, 
    setPlacingWaypoint, 
    removeWaypoint, 
    removeLastWaypoint,
    undoLastPoint,
    setWaypoints,
    updateWaypoint, 
    clearWaypoints,
    loadExpeditionPreset,
    activePresetId,
    setEVASimulating,
    setFlightPlanOpen,
    setContingencyModalOpen,
    activeContingency,
    setMapCenter,
    setMapZoom,
    addWaypoint,
    selectedWaypointId,
    setSelectedWaypoint,
    isRoverDriving,
    setRoverDriving,
    roverProgress,
    setRoverProgress,
    driveTargetWaypointId,
    setDriveTargetWaypointId,
  } = useMapStore();

  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'auto'
  const [distance, setDistance] = useState(0);
  const [evaTime, setEvaTime] = useState(0);
  const [stats, setStats] = useState(null);

  // Autonomous Router State
  const [selectedPairId, setSelectedPairId] = useState('jezero-delta');
  const [routingMode, setRoutingMode] = useState('safety'); // 'safety' | 'science' | 'fastest'
  const [generatedRouteResult, setGeneratedRouteResult] = useState(null);

  useEffect(() => {
    if (waypoints && waypoints.length > 1) {
      const dist = routeDistance(waypoints);
      setDistance(dist || 0);
      const profile = getElevationProfile(waypoints, 100);
      const calculatedStats = getProfileStats(profile);
      setStats(calculatedStats);
      
      const est = estimateEVATime(dist || 0, calculatedStats ? calculatedStats.avgSlope : 0);
      setEvaTime(typeof est === 'object' ? (est.totalHours || 0) : (est || 0));
    } else {
      setDistance(0);
      setEvaTime(0);
      setStats(null);
    }
  }, [waypoints]);

  const handleNameChange = (id, newName) => {
    updateWaypoint(id, { name: newName });
  };

  // Precompute cumulative physical distances along route
  const routeDistances = useMemo(() => {
    if (!waypoints || waypoints.length < 2) return { cumDists: [0], totalDistKm: 0 };
    const cumDists = [0];
    let sum = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const latA = waypoints[i].lat;
      const lonA = waypoints[i].lon !== undefined ? waypoints[i].lon : waypoints[i].lng;
      const latB = waypoints[i+1].lat;
      const lonB = waypoints[i+1].lon !== undefined ? waypoints[i+1].lon : waypoints[i+1].lng;
      const d = Math.max(0.01, marsDistance(latA, lonA, latB, lonB));
      sum += d;
      cumDists.push(sum);
    }
    return { cumDists, totalDistKm: sum };
  }, [waypoints]);

  const handleSimulateToWaypoint = (wp, index, customWaypoints = null) => {
    const activeWps = customWaypoints || waypoints;
    if (index === 0) {
      setDriveTargetWaypointId(null);
      setSelectedWaypoint(wp.id);
      setRoverDriving(false);
      setRoverProgress(0);
      marsAudio.playQuindarTone(true);
      return;
    }

    if (isRoverDriving && driveTargetWaypointId === wp.id) {
      setRoverDriving(false);
    } else {
      let targetDist = 0;
      let totalDist = 0;
      if (activeWps && activeWps.length > 1) {
        let sum = 0;
        for (let i = 1; i < activeWps.length; i++) {
          const p1 = activeWps[i - 1];
          const p2 = activeWps[i];
          const lon1 = p1.lon !== undefined ? p1.lon : (p1.lng !== undefined ? p1.lng : 0);
          const lon2 = p2.lon !== undefined ? p2.lon : (p2.lng !== undefined ? p2.lng : 0);
          sum += marsDistance(p1.lat, lon1, p2.lat, lon2);
          if (i === index) targetDist = sum;
        }
        totalDist = sum;
      }

      const currentDist = (roverProgress || 0) * (totalDist || 1);

      // If rover is already at or past this target, restart from beginning
      if (currentDist >= targetDist - 0.05) {
        setRoverProgress(0);
      }

      setDriveTargetWaypointId(wp.id);
      setSelectedWaypoint(wp.id);
      const displayLon = wp.lon !== undefined ? wp.lon : (wp.lng !== undefined ? wp.lng : 0);

      // Frame both rover starting point and target station with optimal framing zoom
      if (activeWps && activeWps.length > 0) {
        const startWp = activeWps[0];
        const startLon = startWp.lon !== undefined ? startWp.lon : (startWp.lng !== undefined ? startWp.lng : 0);
        const midLat = (startWp.lat + wp.lat) / 2;
        const midLon = (startLon + displayLon) / 2;
        const distKm = marsDistance(startWp.lat, startLon, wp.lat, displayLon);
        const dynamicZoom = distKm < 4 ? 9 : (distKm < 15 ? 8 : (distKm < 50 ? 7 : 6));
        setMapCenter([midLat, midLon]);
        setMapZoom(dynamicZoom);
      } else {
        setMapCenter([wp.lat, displayLon]);
        setMapZoom(8);
      }
      setRoverDriving(true);
    }
  };

  const handleRunAutoRouter = (pairId = selectedPairId, mode = routingMode, autoApply = true) => {
    let origin, destination;
    let targetCenter = null;
    let targetZoom = 7;

    if (pairId === 'custom-current') {
      if (!waypoints || waypoints.length < 2) return;
      origin = waypoints[0];
      destination = waypoints[waypoints.length - 1];
      const origLat = origin.lat;
      const origLon = origin.lon !== undefined ? origin.lon : origin.lng;
      const destLat = destination.lat;
      const destLon = destination.lon !== undefined ? destination.lon : destination.lng;
      targetCenter = [(origLat + destLat) / 2, (origLon + destLon) / 2];
      targetZoom = 6;
    } else {
      const pair = AUTONOMOUS_TARGET_PAIRS.find(p => p.id === pairId) || AUTONOMOUS_TARGET_PAIRS[0];
      origin = pair.origin;
      destination = pair.destination;
      targetCenter = pair.center || [origin.lat, origin.lon];
      targetZoom = pair.zoom || 7;
    }

    const result = generateAutonomousTraverse(origin, destination, { mode });
    if (!result) return;
    setGeneratedRouteResult(result);

    if (autoApply && result.waypoints) {
      setWaypoints(result.waypoints);
      if (targetCenter) {
        setMapCenter(targetCenter);
        setMapZoom(targetZoom);
      }
      marsAudio.playQuindarTone(true);
    }
  };

  const handleApplyAutoRoute = () => {
    if (!generatedRouteResult || !generatedRouteResult.waypoints) return;
    setWaypoints(generatedRouteResult.waypoints);
    const pair = AUTONOMOUS_TARGET_PAIRS.find(p => p.id === selectedPairId);
    if (pair && pair.center) {
      setMapCenter(pair.center);
      setMapZoom(pair.zoom || 7);
    } else if (generatedRouteResult.waypoints[0]) {
      const firstWp = generatedRouteResult.waypoints[0];
      setMapCenter([firstWp.lat, firstWp.lon]);
      setMapZoom(7);
    }
    marsAudio.playQuindarTone(true);
  };

  return (
    <div className="flex flex-col space-y-3 p-4 glass-panel rounded-xl text-primary w-full h-full max-h-[100%] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-lg font-display text-mars-400 flex items-center gap-2">
            <Route className="w-5 h-5" />
            <span>Marswalk Route Planner</span>
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <ProvenanceBadge type="DERIVED" size="xs" detail="IAU Geodesy" />
            <span className="text-[10px] text-space-400 font-mono">0.38g Human Bioenergetics</span>
          </div>
        </div>

        {isPlacingWaypoint && (
          <span className="flex items-center text-xs text-mars-400 bg-mars-500/20 px-2 py-1 rounded-full animate-pulse font-bold">
            <Navigation className="w-3 h-3 mr-1" />
            Placing...
          </span>
        )}
      </div>

      {/* Mode Tabs: Manual vs Autonomous */}
      <div className="flex bg-space-900/80 p-0.5 rounded-lg border border-space-800 shrink-0">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'manual'
              ? 'bg-space-800 text-white shadow-sm'
              : 'text-space-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-mars-400" />
          <span>Manual Waypoints</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('auto');
            if (!generatedRouteResult) handleRunAutoRouter();
          }}
          className={`flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'auto'
              ? 'bg-mars-600 text-white shadow-sm shadow-mars-600/30'
              : 'text-space-400 hover:text-mars-300'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>Autonomous Router</span>
          <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1 py-0.2 rounded font-mono">AI</span>
        </button>
      </div>

      {/* MANUAL MODE VIEW */}
      {activeTab === 'manual' && (
        <>
          {/* NASA Presets Quick Selector */}
          <div className="bg-space-900/80 p-2.5 rounded-lg border border-space-700/60 shrink-0">
            <div className="text-[10px] uppercase font-mono tracking-wider text-space-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-mars-400" />
                <span>NASA Expedition Presets</span>
              </span>
              <ProvenanceBadge type="OBSERVED" size="xs" detail="Rover Tracks" />
            </div>
            <select
              onChange={(e) => {
                const found = expeditionPresets.find(p => p.id === e.target.value);
                if (found) loadExpeditionPreset(found);
              }}
              value={activePresetId || ''}
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
          <div className="grid grid-cols-2 gap-2 bg-space-800/50 p-2.5 rounded-lg border border-space-700 text-sm shrink-0">
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
                <div className="text-space-400 text-[10px] uppercase tracking-wide">Est. Duration</div>
                <div className="font-mono text-sm font-semibold text-mars-400">{evaTime.toFixed(1)} hrs</div>
              </div>
            </div>
            {stats && (
              <>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-space-400 text-[10px] uppercase tracking-wide">Elev Gain</div>
                    <div className="font-mono text-xs text-green-400">
                      +{(stats.gain ?? stats.elevationGain ?? 0).toFixed(0)} m
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-red-400" />
                  <div>
                    <div className="text-space-400 text-[10px] uppercase tracking-wide">Elev Loss</div>
                    <div className="font-mono text-xs text-red-400">
                      -{(stats.loss ?? stats.elevationLoss ?? 0).toFixed(0)} m
                    </div>
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
                  <p className="text-xs mt-1 text-space-500">Drop points on the map or use the Autonomous Router.</p>
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
                      onClick={() => {
                        setSelectedWaypoint(wp.id);
                        setMapCenter([wp.lat, displayLon]);
                        setMapZoom(8);
                        marsAudio.playQuindarTone(true);
                      }}
                      className={`flex flex-col gap-1 p-2 rounded-lg group transition-all cursor-pointer border ${
                        selectedWaypointId === wp.id
                          ? 'bg-space-800 border-mars-500 shadow-md shadow-mars-500/25 ring-1 ring-mars-500/60'
                          : 'bg-space-800/60 hover:bg-space-800 border-space-700/60 hover:border-space-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold text-space-950 shrink-0 shadow-sm"
                          style={{ backgroundColor: wpColor }}
                        >
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={wp.name || `Waypoint ${index + 1}`}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleNameChange(wp.id, e.target.value)}
                              className="bg-transparent border-none text-xs font-semibold focus:ring-0 w-full p-0 text-primary placeholder-space-500 focus:outline-none transition-colors hover:text-white"
                              placeholder={`Waypoint ${index + 1}`}
                            />
                            {selectedWaypointId === wp.id && (
                              <span className="text-[8px] bg-mars-500/20 text-mars-300 px-1.5 py-0.5 rounded font-mono shrink-0 font-bold">
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-space-400 font-mono truncate mt-0.5">
                            {wp.lat.toFixed(4)}°, {displayLon.toFixed(4)}° | Elev: {wp.elevation ? wp.elevation.toFixed(0) : 0} m
                          </div>
                        </div>

                        {/* Quick Drive Rover to this Spot */}
                        {index > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSimulateToWaypoint(wp, index);
                            }}
                            className={`p-1.5 rounded-md transition-all shrink-0 cursor-pointer ${
                              isRoverDriving && driveTargetWaypointId === wp.id
                                ? 'bg-amber-600 text-white animate-pulse'
                                : 'text-amber-400 hover:text-amber-300 hover:bg-space-700/80'
                            }`}
                            title={
                              isRoverDriving && driveTargetWaypointId === wp.id
                                ? 'Pause Rover Drive'
                                : `Simulate Rover Drive to Station #${index + 1}`
                            }
                          >
                            {isRoverDriving && driveTargetWaypointId === wp.id ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeWaypoint(wp.id);
                          }}
                          className="p-1.5 text-space-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-all rounded-md hover:bg-space-700/80 shrink-0"
                          title="Remove Waypoint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Selected Station Expanded Action: Run / Simulate Rover directly to this spot */}
                      {selectedWaypointId === wp.id && (
                        <div className="pt-2 mt-1 border-t border-space-700/80 flex items-center justify-between pl-8">
                          <span className="text-[10px] text-space-400 font-mono">
                            {index === 0 ? '🏁 Basecamp Origin' : `🎯 Station #${index + 1} (${(routeDistances.cumDists[index] || 0).toFixed(1)} km)`}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSimulateToWaypoint(wp, index);
                            }}
                            className={`py-1.5 px-3 rounded-lg font-mono text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                              isRoverDriving && driveTargetWaypointId === wp.id
                                ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                                : 'bg-gradient-to-r from-amber-600 to-mars-600 hover:from-amber-500 hover:to-mars-500 text-white hover:scale-[1.02]'
                            }`}
                          >
                            {isRoverDriving && driveTargetWaypointId === wp.id ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3 fill-white" />
                            )}
                            <span>
                              {index === 0
                                ? 'Reset to Origin'
                                : isRoverDriving && driveTargetWaypointId === wp.id
                                ? 'Pause Rover'
                                : `Simulate Drive to This Station`}
                            </span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* AUTONOMOUS ROUTER VIEW */}
      {activeTab === 'auto' && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {/* Target Corridor Picker */}
          <div className="bg-space-900/80 p-3 rounded-xl border border-space-700/60 space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-space-400 block">
              1. Exploration Sector Target
            </span>
            <select
              value={selectedPairId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedPairId(val);
                handleRunAutoRouter(val, routingMode, true);
              }}
              className="w-full bg-space-800 border border-space-700 text-xs text-primary rounded-lg p-2 focus:outline-none focus:border-mars-500"
            >
              {waypoints && waypoints.length >= 2 && (
                <option value="custom-current">
                  📍 Use My Current Placed Points ({waypoints[0].name} → {waypoints[waypoints.length - 1].name})
                </option>
              )}
              {AUTONOMOUS_TARGET_PAIRS.map(pair => (
                <option key={pair.id} value={pair.id}>
                  {pair.name} ({pair.location})
                </option>
              ))}
            </select>
          </div>

          {/* Multi-Objective Optimization Mode */}
          <div className="bg-space-900/80 p-3 rounded-xl border border-space-700/60 space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-space-400 block">
              2. Multi-Objective Optimization Criterion
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  setRoutingMode('safety');
                  handleRunAutoRouter(selectedPairId, 'safety', true);
                }}
                className={`p-2 rounded-lg border text-center transition-all ${
                  routingMode === 'safety'
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/50'
                    : 'bg-space-800 border-space-700 text-space-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                <span className="text-[10px] font-bold block">Safety First</span>
                <span className="text-[8px] text-space-400 block font-mono">Slope &lt; 10°</span>
              </button>

              <button
                onClick={() => {
                  setRoutingMode('science');
                  handleRunAutoRouter(selectedPairId, 'science', true);
                }}
                className={`p-2 rounded-lg border text-center transition-all ${
                  routingMode === 'science'
                    ? 'bg-purple-950/80 border-purple-400 text-purple-300 ring-1 ring-purple-400/50'
                    : 'bg-space-800 border-space-700 text-space-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                <span className="text-[10px] font-bold block">Max Science</span>
                <span className="text-[8px] text-space-400 block font-mono">Outcrops Buffer</span>
              </button>

              <button
                onClick={() => {
                  setRoutingMode('fastest');
                  handleRunAutoRouter(selectedPairId, 'fastest', true);
                }}
                className={`p-2 rounded-lg border text-center transition-all ${
                  routingMode === 'fastest'
                    ? 'bg-blue-950/80 border-blue-400 text-blue-300 ring-1 ring-blue-400/50'
                    : 'bg-space-800 border-space-700 text-space-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                <span className="text-[10px] font-bold block">Energy/Direct</span>
                <span className="text-[8px] text-space-400 block font-mono">Min Distance</span>
              </button>
            </div>

            <button
              onClick={() => handleRunAutoRouter(selectedPairId, routingMode, true)}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-gradient-to-r from-mars-600 to-amber-600 hover:from-mars-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-mars-600/30 transition-all hover:scale-[1.01]"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Re-Compute & Center Route</span>
            </button>
          </div>

          {/* Explainability & Decision Support Card */}
          {generatedRouteResult && (
            <div className="bg-space-900/90 p-3 rounded-xl border border-mars-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white uppercase flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-mars-400" />
                  <span>"Why This Route?" Decision Support</span>
                </span>
                <ProvenanceBadge type="DERIVED" size="xs" detail="IDW Optimization" />
              </div>

              <p className="text-[11px] text-space-200 leading-relaxed font-sans">
                {generatedRouteResult.explainability.summary}
              </p>

              {/* Rationale Bullet Points */}
              <ul className="space-y-1 text-[10px] text-space-300 font-mono">
                {generatedRouteResult.explainability.rationale.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-mars-400">▸</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              {/* Tradeoff Scores */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-space-800 text-center font-mono">
                <div className="bg-space-800/80 p-1.5 rounded">
                  <span className="text-[8px] text-space-400 block uppercase">Safety Index</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {generatedRouteResult.explainability.safetyScore}%
                  </span>
                </div>
                <div className="bg-space-800/80 p-1.5 rounded">
                  <span className="text-[8px] text-space-400 block uppercase">Science Yield</span>
                  <span className="text-xs font-bold text-purple-400">
                    {generatedRouteResult.explainability.scienceScore}%
                  </span>
                </div>
                <div className="bg-space-800/80 p-1.5 rounded">
                  <span className="text-[8px] text-space-400 block uppercase">Max Slope</span>
                  <span className="text-xs font-bold text-amber-400">
                    {generatedRouteResult.metrics.maxSlopeDeg}°
                  </span>
                </div>
              </div>

              {/* Dual Action: Refocus & Edit in Manual Mode */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleApplyAutoRoute}
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01]"
                  title="Refocus map camera and ensure traverse is synced"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Traverse Synced ({generatedRouteResult.metrics.traverseDistanceKm} km)</span>
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className="py-2 px-3 rounded-lg bg-space-800 hover:bg-space-700 text-space-200 border border-space-700 font-bold text-xs flex items-center gap-1 transition-all shrink-0"
                  title="Switch to manual list to edit waypoints"
                >
                  <span>Edit Points</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Recommended Corridor Stations & Science Outcrops */}
          {generatedRouteResult && generatedRouteResult.waypoints && (
            <div className="bg-space-900/90 p-3 rounded-xl border border-space-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-space-300 font-bold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-mars-400" />
                  <span>Recommended Stations ({generatedRouteResult.waypoints.length})</span>
                </span>
                <span className="text-[9px] text-space-400 font-mono">Click to Select</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {generatedRouteResult.waypoints.map((wp, idx) => {
                  const isSelected = selectedWaypointId === wp.id;
                  const isStart = idx === 0;
                  const isEnd = idx === generatedRouteResult.waypoints.length - 1;
                  const isScience = wp.type === 'science';

                  let badgeLabel = 'Pass';
                  let badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                  if (isStart) {
                    badgeLabel = 'Base';
                    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                  } else if (isEnd) {
                    badgeLabel = 'Target';
                    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                  } else if (isScience) {
                    badgeLabel = 'Outcrop';
                    badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                  }

                  return (
                    <div
                      key={wp.id || `auto-wp-${idx}`}
                      onClick={() => {
                        // Ensure store waypoints match generatedRouteResult
                        if (generatedRouteResult?.waypoints) {
                          const currentIds = (waypoints || []).map(w => w.id).join(',');
                          const genIds = generatedRouteResult.waypoints.map(w => w.id).join(',');
                          if (currentIds !== genIds) {
                            setWaypoints(generatedRouteResult.waypoints);
                          }
                        }
                        setSelectedWaypoint(wp.id);
                        setMapCenter([wp.lat, wp.lon]);
                        setMapZoom(9);
                        marsAudio.playQuindarTone(true);
                      }}
                      className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-space-800 border-mars-500 shadow-md shadow-mars-500/25 ring-1 ring-mars-500/60'
                          : 'bg-space-800/60 hover:bg-space-800 border-space-700/60 hover:border-space-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                            isSelected ? 'bg-mars-500 text-white' : 'bg-space-700 text-space-300'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-space-200'}`}>
                            {wp.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 ${badgeColor}`}>
                            {badgeLabel}
                          </span>
                          {idx > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (generatedRouteResult?.waypoints) {
                                  const currentIds = (waypoints || []).map(w => w.id).join(',');
                                  const genIds = generatedRouteResult.waypoints.map(w => w.id).join(',');
                                  if (currentIds !== genIds) {
                                    setWaypoints(generatedRouteResult.waypoints);
                                  }
                                }
                                handleSimulateToWaypoint(wp, idx, generatedRouteResult?.waypoints);
                              }}
                              className={`p-1 rounded transition-all cursor-pointer ${
                                isRoverDriving && driveTargetWaypointId === wp.id
                                  ? 'bg-amber-600 text-white animate-pulse'
                                  : 'text-amber-400 hover:text-amber-300 hover:bg-space-700/80'
                              }`}
                              title={
                                isRoverDriving && driveTargetWaypointId === wp.id
                                  ? 'Pause Rover Drive'
                                  : `Simulate Rover Drive to Station #${idx + 1}`
                              }
                            >
                              {isRoverDriving && driveTargetWaypointId === wp.id ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-space-400 font-mono pl-7">
                        <span>{wp.lat.toFixed(4)}°, {wp.lon.toFixed(4)}° • {wp.elevation}m</span>
                        {wp.slopeFromPrev !== undefined && (
                          <span className={wp.slopeFromPrev > 10 ? 'text-amber-400' : 'text-emerald-400'}>
                            {wp.slopeFromPrev}° grade
                          </span>
                        )}
                      </div>

                      {wp.reason && (
                        <p className="text-[10px] text-space-300 font-sans pl-7 line-clamp-1 italic">
                          "{wp.reason}"
                        </p>
                      )}

                      {/* Drive to station action button if selected */}
                      {isSelected && (
                        <div className="pt-2 mt-1 border-t border-space-700/80 flex items-center justify-between pl-7">
                          <span className="text-[10px] text-space-400 font-mono">
                            {idx === 0 ? '🏁 Traverse Origin' : `🎯 Station #${idx + 1}`}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (generatedRouteResult?.waypoints) {
                                const currentIds = (waypoints || []).map(w => w.id).join(',');
                                const genIds = generatedRouteResult.waypoints.map(w => w.id).join(',');
                                if (currentIds !== genIds) {
                                  setWaypoints(generatedRouteResult.waypoints);
                                }
                              }
                              handleSimulateToWaypoint(wp, idx, generatedRouteResult?.waypoints);
                            }}
                            className={`py-1.5 px-3 rounded-lg font-mono text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                              isRoverDriving && driveTargetWaypointId === wp.id
                                ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse' 
                                : 'bg-gradient-to-r from-amber-600 to-mars-600 hover:from-amber-500 hover:to-mars-500 text-white hover:scale-[1.02]'
                            }`}
                          >
                            {isRoverDriving && driveTargetWaypointId === wp.id ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3 fill-white" />
                            )}
                            <span>
                              {idx === 0 
                                ? 'Reset to Origin' 
                                : isRoverDriving && driveTargetWaypointId === wp.id 
                                ? 'Pause Rover' 
                                : 'Simulate Drive to This Station'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons Footer */}
      <div className="flex flex-col gap-2 pt-2 border-t border-space-700/80 mt-auto shrink-0">
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
                undoLastPoint();
                marsAudio.playQuindarTone(false);
              }}
              className="py-2 px-2.5 rounded-lg bg-space-800 hover:bg-amber-500/20 text-space-300 hover:text-amber-400 border border-space-700 transition-colors flex items-center gap-1.5 text-xs font-mono shrink-0"
              title="Undo last placed point (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}
          
          {waypoints && waypoints.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all waypoints?')) {
                  clearWaypoints();
                }
              }}
              className="p-2 rounded-lg bg-space-800 hover:bg-red-500/20 text-space-400 hover:text-red-400 border border-space-700 transition-colors shrink-0"
              title="Clear entire route"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Modal Triggers: Flight Brief & Contingency */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFlightPlanOpen(true)}
            className="py-1.5 px-2 bg-space-800 hover:bg-space-700 border border-space-700 rounded-lg text-[11px] font-mono flex items-center justify-center gap-1.5 text-space-200 transition-colors"
            title="Export Official NASA Flight Brief"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Flight Brief (PDF/MD)</span>
          </button>

          <button
            onClick={() => setContingencyModalOpen(true)}
            className={`py-1.5 px-2 border rounded-lg text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors ${
              activeContingency
                ? 'bg-red-950 text-red-200 border-red-500 animate-pulse'
                : 'bg-space-800 hover:bg-space-700 border-space-700 text-space-200'
            }`}
            title="Simulate Mars Contingency / Hazard Anomaly"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeContingency ? 'CONTINGENCY!' : 'What-If Sim'}</span>
          </button>
        </div>

        {/* Marswalk Simulator Launch Button */}
        {waypoints && waypoints.length > 1 && (
          <button
            onClick={() => setEVASimulating(true)}
            className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-mars-600 to-amber-600 hover:from-mars-500 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-mars-600/30 transition-all hover:scale-[1.01]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Marswalk Simulator (EVA HUD)</span>
          </button>
        )}
      </div>
    </div>
  );
}
