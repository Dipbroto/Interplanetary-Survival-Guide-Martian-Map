import React, { useMemo } from 'react';
import useMapStore from '../store/useMapStore';
import { getElevationProfile, getProfileStats } from '../utils/elevationService';
import { routeDistance, estimateEVATime, estimateRadiation, estimateO2Consumption, estimateWaterConsumption, estimatePowerConsumption } from '../utils/marsUtils';
import { Mountain, TrendingUp, TrendingDown, AlertTriangle, Clock, Zap, Droplets, Wind, Shield } from 'lucide-react';

export default function RouteAnalysis() {
  const { waypoints } = useMapStore();

  const analysis = useMemo(() => {
    if (!waypoints || waypoints.length < 2) return null;
    
    const dist = routeDistance(waypoints) || 0;
    // calculate average slope for ETA
    const profile = getElevationProfile(waypoints, 100);
    const stats = getProfileStats(profile);
    
    const evaEstimate = estimateEVATime(dist, stats ? stats.avgSlope : 0);
    const evaHours = typeof evaEstimate === 'object' ? (evaEstimate.totalHours || 0) : (evaEstimate || 0);
    
    // Safely call util functions
    const radEstimate = estimateRadiation(evaHours, stats ? stats.avgElevation : 0);
    const radiation = radEstimate ? (radEstimate.totalDose || 0) : 0; 
    
    const o2Estimate = estimateO2Consumption(evaHours);
    const waterEstimate = estimateWaterConsumption(evaHours);
    const powerEstimate = estimatePowerConsumption(evaHours, -60);
    
    const consumables = { 
        o2: o2Estimate ? (o2Estimate.totalKg || 0) : 0, 
        water: waterEstimate ? (waterEstimate.totalLiters || 0) : 0, 
        power: powerEstimate ? (powerEstimate.energyWh || 0) : 0 
    };
    
    const maxSlope = stats ? (stats.maxSlope || 0) : 0;
    const hazards = { 
        dustRisk: 'Medium', 
        slopeWarning: maxSlope > 15 
    };

    return {
      distance: dist,
      evaTime: evaHours,
      stats: stats || { gain: 0, loss: 0, elevationGain: 0, elevationLoss: 0, maxSlope: 0, avgSlope: 0, distance: dist, totalDistance: dist },
      radiation,
      consumables,
      hazards
    };
  }, [waypoints]);

  if (!analysis) {
    return (
      <div className="p-6 glass-panel rounded-xl text-center flex flex-col items-center justify-center">
        <TrendingUp className="w-8 h-8 text-space-600 mb-3" strokeWidth={1.5} />
        <p className="text-sm text-secondary font-medium">Add waypoints to see analysis</p>
        <p className="text-xs text-space-500 mt-1">Route statistics and logistics will appear here.</p>
      </div>
    );
  }

  const { stats, evaTime, radiation, consumables, hazards } = analysis;

  const getSlopeDifficulty = (slope = 0) => {
    if (slope < 5) return { label: 'Easy', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
    if (slope < 15) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    return { label: 'Steep', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
  };

  const slopeVal = stats?.maxSlope ?? 0;
  const slopeDiff = getSlopeDifficulty(slopeVal);
  const gainVal = stats?.gain ?? stats?.elevationGain ?? 0;
  const lossVal = stats?.loss ?? stats?.elevationLoss ?? 0;

  return (
    <div className="flex flex-col space-y-5 p-4 glass-panel rounded-xl text-primary mt-4 w-full">
      <h2 className="text-xl font-display text-mars-400 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Route Analysis
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Distance & Time */}
        <div className="bg-space-800/40 p-3.5 rounded-xl border border-space-700/50 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <Mountain className="w-4 h-4 text-space-400" />
            <span className="text-xs text-secondary font-medium tracking-wide">Total Distance</span>
          </div>
          <div className="text-xl font-mono font-bold mt-1">{(analysis.distance || 0).toFixed(2)} <span className="text-xs text-space-500 font-sans font-normal">km</span></div>
        </div>

        <div className="bg-space-800/40 p-3.5 rounded-xl border border-space-700/50 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-mars-400" />
            <span className="text-xs text-secondary font-medium tracking-wide">Est. Duration</span>
          </div>
          <div className="text-xl font-mono font-bold text-mars-400 mt-1">{(evaTime || 0).toFixed(1)} <span className="text-xs text-space-500 font-sans font-normal">hrs</span></div>
        </div>

        {/* Elevation Stats */}
        <div className="bg-space-800/40 p-3.5 rounded-xl border border-space-700/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-secondary font-medium">Elev Gain</span>
          </div>
          <div className="text-lg font-mono text-green-400 mt-1 font-semibold">+{gainVal.toFixed(0)} m</div>
        </div>

        <div className="bg-space-800/40 p-3.5 rounded-xl border border-space-700/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-secondary font-medium">Elev Loss</span>
          </div>
          <div className="text-lg font-mono text-red-400 mt-1 font-semibold">-{lossVal.toFixed(0)} m</div>
        </div>

        {/* Max Slope */}
        <div className="col-span-2 bg-space-800/40 p-4 rounded-xl border border-space-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${slopeDiff.bg} border`}>
              <AlertTriangle className={`w-5 h-5 ${slopeDiff.color}`} />
            </div>
            <div>
              <div className="text-xs text-secondary font-medium mb-0.5">Maximum Slope</div>
              <div className="text-xl font-mono font-bold">{slopeVal.toFixed(1)}°</div>
            </div>
          </div>
          <span className={`px-2.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider border ${slopeDiff.bg} ${slopeDiff.color}`}>
            {slopeDiff.label}
          </span>
        </div>
      </div>

      <div className="h-px w-full bg-space-700/50" />

      {/* Logistics / Consumables */}
      <div>
        <h3 className="text-[11px] font-bold text-space-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5" /> Logistics Requirement
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-space-800/30 p-2.5 rounded-lg border border-space-700/30 flex flex-col items-center text-center">
            <Wind className="w-5 h-5 text-blue-300 mb-1.5 opacity-80" />
            <div className="text-[10px] text-space-400 uppercase tracking-wider mb-0.5">O₂</div>
            <div className="font-mono text-sm font-semibold">{consumables.o2.toFixed(1)} <span className="text-[10px] font-sans font-normal text-space-500">kg</span></div>
          </div>
          <div className="bg-space-800/30 p-2.5 rounded-lg border border-space-700/30 flex flex-col items-center text-center">
            <Droplets className="w-5 h-5 text-blue-500 mb-1.5 opacity-80" />
            <div className="text-[10px] text-space-400 uppercase tracking-wider mb-0.5">Water</div>
            <div className="font-mono text-sm font-semibold">{consumables.water.toFixed(1)} <span className="text-[10px] font-sans font-normal text-space-500">L</span></div>
          </div>
          <div className="bg-space-800/30 p-2.5 rounded-lg border border-space-700/30 flex flex-col items-center text-center">
            <Zap className="w-5 h-5 text-yellow-400 mb-1.5 opacity-80" />
            <div className="text-[10px] text-space-400 uppercase tracking-wider mb-0.5">Power</div>
            <div className="font-mono text-sm font-semibold">{consumables.power.toFixed(0)} <span className="text-[10px] font-sans font-normal text-space-500">Wh</span></div>
          </div>
        </div>
      </div>

      {/* Radiation & Hazards */}
      <div className="space-y-2 mt-2">
        <div className="flex items-center justify-between bg-purple-900/10 p-3 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-100">Est. Radiation Dose</span>
          </div>
          <span className="font-mono text-purple-400 font-bold">{radiation.toFixed(2)} mSv</span>
        </div>
        
        {hazards.slopeWarning && (
          <div className="flex items-start gap-2 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-red-200 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <p><strong>Hazard Warning:</strong> Route contains steep sections exceeding 15°. Rover navigation may be compromised or require detour routing.</p>
          </div>
        )}
      </div>

    </div>
  );
}
