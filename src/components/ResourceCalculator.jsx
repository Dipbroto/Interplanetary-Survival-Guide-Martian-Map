import React from 'react';
import { Droplets, Wind, Zap, Battery, Package, ShieldCheck } from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { estimateO2Consumption, estimateWaterConsumption, estimatePowerConsumption } from '../utils/marsUtils';

const ProgressBar = ({ value, max, color }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  let bgClass = 'bg-green-500';
  let shadowClass = 'shadow-[0_0_10px_#22c55e]';
  
  if (percentage > 70) {
    bgClass = 'bg-yellow-500';
    shadowClass = 'shadow-[0_0_10px_#eab308]';
  }
  if (percentage > 90) {
    bgClass = 'bg-red-500';
    shadowClass = 'shadow-[0_0_10px_#ef4444]';
  }

  const finalColor = color || bgClass;
  const shadow = color ? `shadow-[0_0_10px_${color.replace('bg-', '#').replace('-500', '')}]` : shadowClass;

  return (
    <div className="h-2.5 w-full bg-space-950 rounded-full overflow-hidden border border-space-800">
      <div 
        className={`h-full ${finalColor} ${shadow} transition-all duration-700 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const ResourceCalculator = () => {
  const { missionActivities = [] } = useMapStore();
  
  const totalDuration = missionActivities.reduce((acc, curr) => acc + curr.duration, 0) || 0;
  
  // Base calculations (fallback if utils not found)
  const getO2 = () => { try { return estimateO2Consumption(totalDuration); } catch(e) { return totalDuration * 0.04; } };
  const getWater = () => { try { return estimateWaterConsumption(totalDuration); } catch(e) { return totalDuration * 0.15; } };
  const getPower = () => { try { return estimatePowerConsumption(totalDuration); } catch(e) { return totalDuration * 150; } };

  const o2Kg = getO2();
  const waterLiters = getWater();
  const powerWh = getPower();

  // With safety margin (1.5x)
  const margin = 1.5;
  const safeO2 = o2Kg * margin;
  const safeWater = waterLiters * margin;
  const safePower = powerWh * margin;

  // Typical EVA capacity limits 
  const maxO2 = 1.0; // kg
  const maxWater = 4.0; // L
  const maxPower = 3000; // Wh

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-primary flex items-center">
          <ShieldCheck size={18} className="mr-2 text-green-400" />
          Life Support
        </h3>
        <span className="text-[10px] font-mono bg-space-900 border border-space-700 px-2 py-1 rounded text-space-300">
          DUR: {totalDuration}h
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Oxygen */}
        <div className="bg-space-900/40 rounded-xl p-4 border border-space-800/50 hover:border-blue-500/30 transition-colors">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center text-blue-400">
              <div className="p-1.5 bg-blue-500/10 rounded-lg mr-2">
                <Wind size={16} />
              </div>
              <span className="font-bold text-sm tracking-wide">Oxygen (O₂)</span>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm text-primary font-bold">{safeO2.toFixed(2)} <span className="text-[10px] text-space-400 font-sans">kg</span></div>
            </div>
          </div>
          <ProgressBar value={safeO2} max={maxO2} color="bg-blue-500" />
          <div className="flex justify-between mt-2 text-[10px] text-space-400 font-bold uppercase tracking-wider">
            <span>0.04 kg/h</span>
            <span className="flex items-center text-blue-300">
              <Package size={10} className="mr-1" />
              {Math.ceil(safeO2 / 0.5)} tanks
            </span>
          </div>
        </div>

        {/* Water */}
        <div className="bg-space-900/40 rounded-xl p-4 border border-space-800/50 hover:border-cyan-500/30 transition-colors">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center text-cyan-400">
              <div className="p-1.5 bg-cyan-500/10 rounded-lg mr-2">
                <Droplets size={16} />
              </div>
              <span className="font-bold text-sm tracking-wide">Water (H₂O)</span>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm text-primary font-bold">{safeWater.toFixed(1)} <span className="text-[10px] text-space-400 font-sans">L</span></div>
            </div>
          </div>
          <ProgressBar value={safeWater} max={maxWater} color="bg-cyan-500" />
          <div className="flex justify-between mt-2 text-[10px] text-space-400 font-bold uppercase tracking-wider">
            <span>0.15 L/h</span>
            <span className="flex items-center text-cyan-300">
              <Package size={10} className="mr-1" />
              {Math.ceil(safeWater / 2)} cont.
            </span>
          </div>
        </div>

        {/* Power */}
        <div className="bg-space-900/40 rounded-xl p-4 border border-space-800/50 hover:border-yellow-500/30 transition-colors">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center text-yellow-400">
              <div className="p-1.5 bg-yellow-500/10 rounded-lg mr-2">
                <Zap size={16} />
              </div>
              <span className="font-bold text-sm tracking-wide">Suit Power</span>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm text-primary font-bold">{(safePower / 1000).toFixed(2)} <span className="text-[10px] text-space-400 font-sans">kWh</span></div>
            </div>
          </div>
          <ProgressBar value={safePower} max={maxPower} color="bg-yellow-500" />
          <div className="flex justify-between mt-2 text-[10px] text-space-400 font-bold uppercase tracking-wider">
            <span>150 W avg</span>
            <span className="flex items-center text-yellow-300">
              <Battery size={10} className="mr-1" />
              {Math.ceil(safePower / 500)} bat.
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-[10px] text-space-400 text-center flex items-center justify-center bg-space-900/50 py-2.5 rounded-lg border border-space-800">
        <ShieldCheck size={12} className="mr-1.5 text-green-400" />
        Totals include 1.5x standard NASA safety margin.
      </div>
    </div>
  );
};

export default ResourceCalculator;
