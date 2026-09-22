import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, ShieldCheck, AlertTriangle, FileText, CheckCircle2, Bookmark, Layers } from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { routeDistance, estimateEVATime, estimateO2Consumption, estimateWaterConsumption, estimatePowerConsumption } from '../utils/marsUtils';
import { getElevationProfile, getProfileStats } from '../utils/elevationService';

export default function FlightPlanModal() {
  const { 
    isFlightPlanOpen, 
    setFlightPlanOpen, 
    waypoints, 
    missionActivities, 
    collectedSamples,
    weather,
    currentSol
  } = useMapStore();

  // Escape key to close (called unconditionally at top level)
  React.useEffect(() => {
    if (!isFlightPlanOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setFlightPlanOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlightPlanOpen, setFlightPlanOpen]);

  if (!isFlightPlanOpen) return null;

  const totalDist = routeDistance(waypoints || []);
  const profile = getElevationProfile(waypoints || [], 100);
  const stats = getProfileStats(profile);
  const evaEst = estimateEVATime(totalDist, stats ? stats.avgSlope : 0);
  const evaHours = typeof evaEst === 'object' ? evaEst.totalHours : evaEst;

  const o2 = estimateO2Consumption(evaHours);
  const h2o = estimateWaterConsumption(evaHours);
  const pwr = estimatePowerConsumption(evaHours, -60);

  const handleDownloadJSON = () => {
    const flightPackage = {
      missionTitle: 'MARSWALK EXPLORER EXPEDITION EVA-2026',
      sol: currentSol,
      generatedAt: new Date().toISOString(),
      weatherConditions: {
        season: weather?.season,
        temperatureC: weather?.temperature?.avg,
        pressurePa: weather?.pressure?.value,
        windSpeedMs: weather?.wind?.speed,
        dustOpacityTau: weather?.dustOpacity
      },
      routeSummary: {
        totalDistanceKm: totalDist,
        estimatedDurationHours: evaHours,
        elevationGainM: stats?.gain,
        elevationLossM: stats?.loss,
        maxSlopeDeg: stats?.maxSlope
      },
      waypoints: (waypoints || []).map((wp, i) => ({
        sequence: i + 1,
        id: wp.id,
        name: wp.name,
        latitude: wp.lat,
        longitude: wp.lon !== undefined ? wp.lon : wp.lng,
        elevationMeters: wp.elevation
      })),
      consumablesBudget: {
        oxygenKg: o2.totalKg,
        oxygenLiters: o2.totalLiters,
        waterLiters: h2o.totalLiters,
        batteryPowerKwh: pwr.energyKWh
      },
      scientificSampleManifest: collectedSamples,
      flightRules: [
        'EVA-FR-01: Maximum walkback limit fixed at 5.0 km radius from primary pressurized shelter.',
        'EVA-FR-02: Terrain slope sections > 15 degrees require safety tether and CapCom abort check.',
        'EVA-FR-03: Solar particle event (SPE) alarms require immediate abort within 20 minutes.',
        'EVA-FR-04: Dust opacity exceeding tau 1.8 grounds rover travel and triggers suit beacon tracking.'
      ]
    };

    const blob = new Blob([JSON.stringify(flightPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NASA_MARSWALK_EVA_PLAN_SOL_${currentSol}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) setFlightPlanOpen(false);
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono text-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel-solid w-full max-w-4xl max-h-[92vh] rounded-2xl border-2 border-mars-500/60 bg-space-950 shadow-2xl flex flex-col overflow-hidden text-primary relative z-10"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-space-800 bg-space-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-display font-bold text-white text-xs border border-white/40 shadow-sm">
              NASA
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-widest uppercase">
                OFFICIAL NASA EVA FLIGHT PLAN & CHECKLIST
              </h2>
              <p className="text-[10px] text-space-400">
                DOCUMENT CODE: JPL-EVA-2026-MARS • SOL {currentSol}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-space-800 hover:bg-space-700 text-white rounded-lg flex items-center gap-1.5 transition-colors border border-space-700"
              title="Print Official Document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Plan</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 bg-mars-600 hover:bg-mars-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-mars-600/30 transition-all"
              title="Download JSON for Rover Navigation Computer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => setFlightPlanOpen(false)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg transition-all border border-white/40 cursor-pointer ml-1"
              title="Close Flight Plan (ESC)"
            >
              <X className="w-4 h-4" />
              <span>← BACK (ESC)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Plan Body */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Mission Executive Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-space-900/50 p-4 rounded-xl border border-space-800">
            <div>
              <span className="text-[10px] text-space-500 uppercase block">TOTAL DISTANCE</span>
              <span className="text-base font-bold text-white">{totalDist.toFixed(2)} km</span>
            </div>
            <div>
              <span className="text-[10px] text-space-500 uppercase block">ESTIMATED DURATION</span>
              <span className="text-base font-bold text-mars-400">{evaHours.toFixed(1)} hrs</span>
            </div>
            <div>
              <span className="text-[10px] text-space-500 uppercase block">WAYPOINTS COUNT</span>
              <span className="text-base font-bold text-cyan-400">{waypoints?.length || 0} Points</span>
            </div>
            <div>
              <span className="text-[10px] text-space-500 uppercase block">MAX TERRAIN SLOPE</span>
              <span className="text-base font-bold text-green-400">{stats?.maxSlope?.toFixed(1) || 0}°</span>
            </div>
          </div>

          {/* Flight Rules & Contingency Abort Limits */}
          <div className="bg-space-900/40 p-4 rounded-xl border border-amber-500/30 space-y-2">
            <h3 className="font-bold text-amber-400 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>NASA Flight Rules & Contingency Abort Matrix</span>
            </h3>
            <ul className="space-y-1.5 text-[11px] text-space-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">FR-01:</span>
                <span><strong>Walkback Limit:</strong> Distance to primary pressurized shelter must not exceed 5.0 km radius under any operational conditions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">FR-02:</span>
                <span><strong>Slope Abort:</strong> Slopes &gt; 15° require tether anchors. Any slope &gt; 25° is designated an absolute no-go traverse zone.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">FR-03:</span>
                <span><strong>Environmental Hazard:</strong> Immediate abort required if atmospheric dust opacity exceeds τ 1.8 or UV index spikes above 14.</span>
              </li>
            </ul>
          </div>

          {/* Consumables Budget Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Life Support & Consumables Allocation (1 Astronaut)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-space-900/60 rounded-xl border border-space-800">
                <span className="text-space-400 text-[10px] block">O₂ REQUIREMENTS</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">{o2.totalKg} kg</span>
                <span className="text-[10px] text-space-500 block">({o2.totalLiters} L at STP)</span>
              </div>
              <div className="p-3 bg-space-900/60 rounded-xl border border-space-800">
                <span className="text-space-400 text-[10px] block">SUIT DRINKING WATER</span>
                <span className="text-lg font-bold text-blue-400 font-mono">{h2o.totalLiters} L</span>
                <span className="text-[10px] text-space-500 block">Drink loop nominal</span>
              </div>
              <div className="p-3 bg-space-900/60 rounded-xl border border-space-800">
                <span className="text-space-400 text-[10px] block">SUIT POWER / HEATING</span>
                <span className="text-lg font-bold text-yellow-400 font-mono">{pwr.energyKWh} kWh</span>
                <span className="text-[10px] text-space-500 block">({pwr.powerWatts} W draw)</span>
              </div>
            </div>
          </div>

          {/* Waypoints Sequence Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Traverse Waypoints Manifest
            </h3>
            <div className="overflow-x-auto rounded-xl border border-space-800">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-space-900/80 border-b border-space-800 text-space-400">
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Waypoint Designation</th>
                    <th className="p-2.5">Latitude</th>
                    <th className="p-2.5">Longitude</th>
                    <th className="p-2.5">Elevation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-space-800/60 font-mono">
                  {(waypoints || []).map((wp, i) => (
                    <tr key={wp.id} className="hover:bg-space-800/30">
                      <td className="p-2.5 text-mars-400 font-bold">{i + 1}</td>
                      <td className="p-2.5 text-white font-sans font-medium">{wp.name}</td>
                      <td className="p-2.5 text-space-300">{wp.lat.toFixed(4)}°</td>
                      <td className="p-2.5 text-space-300">{(wp.lon !== undefined ? wp.lon : wp.lng || 0).toFixed(4)}°</td>
                      <td className="p-2.5 text-space-300">{wp.elevation ? wp.elevation.toFixed(0) : 0} m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Cache Inventory */}
          <div className="space-y-2">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Sealed Sample Tubes In Custody</span>
              <span className="text-mars-400 font-mono text-[10px]">{collectedSamples?.length || 0} Tubes</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(collectedSamples || []).map((s) => (
                <div key={s.id} className="p-2.5 bg-space-900/50 rounded-lg border border-space-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-[11px] block">{s.name}</span>
                    <span className="text-[10px] text-space-400">{s.rockType} • Sol {s.sol}</span>
                  </div>
                  <span className="text-[10px] font-bold text-green-400 bg-green-950/60 px-2 py-0.5 rounded border border-green-500/30">
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
