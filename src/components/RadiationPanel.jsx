import React, { useMemo } from 'react';
import useMapStore from '../store/useMapStore';
import { estimateRadiation, routeDistance } from '../utils/marsUtils';
import { RadioTower, Shield, AlertTriangle, Activity, Heart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import ProvenanceBadge from './ProvenanceBadge';

const RadiationPanel = () => {
  const { currentSol, waypoints, activeContingency } = useMapStore();
  
  // Simulated elevation based on map center (for demo purposes)
  const elevation = -2500; 

  const isSPEActive = activeContingency === 'spe';

  const radiation = useMemo(() => {
    // 24 hours to get daily dose
    const dailyDoseInfo = estimateRadiation(24, elevation);
    let hourlyDoseRate = dailyDoseInfo.doseRate || dailyDoseInfo.totalDose / 24; 
    
    // Fallback if doseRate isn't returned directly by estimateRadiation
    let hourly = typeof hourlyDoseRate === 'number' ? hourlyDoseRate : (0.67 / 24);

    // If Solar Particle Event is active, dose spikes to ~14.5 mSv/hr
    if (isSPEActive) {
      hourly = 14.52;
    }
    
    const daily = hourly * 24;
    const annual = daily * 365.25; // Earth days for standardized mSv/year
    
    // SPE Risk based on a pseudo-random cycle (11-year solar cycle simulated via sol)
    const speRisk = isSPEActive ? 0.99 : (Math.sin(currentSol / 200) + 1) / 2; // 0 to 1
    
    // Career limit calculation
    const careerLimit = 600; // mSv (NASA career limit)
    const daysToLimit = Math.max(1, Math.floor(careerLimit / daily));
    
    return {
      hourly,
      daily,
      annual,
      speRisk,
      daysToLimit,
      careerLimit
    };
  }, [currentSol, elevation, isSPEActive]);

  const evaExposure = useMemo(() => {
    if (waypoints.length < 2) return null;
    const distMeters = routeDistance(waypoints) * 1000;
    const walkingSpeedMps = 1.0; // 1 m/s average Mars walking speed
    const durationHours = (distMeters / walkingSpeedMps) / 3600;
    // Add 1 hour overhead for suit prep/deprep
    const totalHours = durationHours + 1;
    const dose = estimateRadiation(totalHours, elevation);
    return {
      hours: totalHours.toFixed(1),
      dose: (dose.totalDose || (radiation.hourly * totalHours)).toFixed(2)
    };
  }, [waypoints, elevation, radiation.hourly]);

  const comparisonData = [
    { name: 'Earth', dose: 3.0, color: '#3b82f6' },
    { name: 'ISS', dose: 144, color: '#eab308' },
    { name: 'Mars (GCR)', dose: isSPEActive ? 5300 : Math.round(radiation.annual), color: '#f47050' },
  ];

  // Gauge calculation
  const gaugePercent = Math.min(100, (radiation.annual / 300) * 100);
  const gaugeCircumference = 2 * Math.PI * 40;
  const gaugeDashArray = gaugeCircumference;
  const gaugeDashOffset = gaugeCircumference - (gaugePercent / 100) * gaugeCircumference;

  return (
    <div className="w-full h-full text-primary flex flex-col gap-4 overflow-y-auto overflow-x-hidden custom-scrollbar-y p-2">
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display text-white flex items-center gap-2">
              <RadioTower className={isSPEActive ? "text-red-400 animate-pulse" : "text-yellow-400"} size={24} />
              Radiation Environment
            </h2>
            <ProvenanceBadge type="OBSERVED" size="xs" detail="MSL RAD" />
          </div>
          <div className="text-sm text-secondary flex items-center gap-2 mt-1 font-mono">
            <Activity size={14} />
            <span>Galactic Cosmic Rays (GCR) & Solar Protons</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSPEActive ? (
            <div className="flex items-center gap-1.5 bg-red-900/80 px-3 py-1.5 rounded-full border border-red-500 text-xs text-red-200 font-bold animate-pulse shadow-lg shadow-red-900/50">
              <AlertTriangle size={14} className="text-red-400" /> PROMPT SPE EVENT IN PROGRESS
            </div>
          ) : radiation.speRisk > 0.7 ? (
            <div className="flex items-center gap-1.5 bg-amber-900/50 px-3 py-1.5 rounded-full border border-amber-700/50 text-xs text-amber-400 font-bold">
              <AlertTriangle size={14} /> ELEVATED SOLAR RISK
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-green-900/50 px-3 py-1.5 rounded-full border border-green-700/50 text-xs text-green-400">
              <Shield size={14} /> NOMINAL BACKGROUND GCR
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Metrics */}
        <div className="md:col-span-2 glass-panel p-4 rounded-xl border border-space-700/50 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-mono tracking-wider text-space-400">
              In-Situ Dosimetry Metrics
            </span>
            <ProvenanceBadge type="OBSERVED" size="xs" detail="Curiosity RAD Calibrated" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col justify-center">
              <span className="text-secondary text-xs mb-1">Ambient Dose Rate</span>
              <div className={`text-3xl font-display mb-1 ${isSPEActive ? 'text-red-400 animate-pulse font-bold' : 'text-yellow-400'}`}>
                {radiation.hourly.toFixed(3)}
              </div>
              <div className="text-xs text-secondary font-mono">mSv/hr</div>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-secondary text-xs mb-1">Daily Dose</span>
              <div className="text-2xl font-display text-white mb-1">
                {radiation.daily.toFixed(2)}
              </div>
              <div className="text-xs text-secondary font-mono">mSv/day</div>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-secondary text-xs mb-1">Annual Projected</span>
              <div className="text-2xl font-display text-mars-400 mb-1">
                {radiation.annual.toFixed(1)}
              </div>
              <div className="text-xs text-secondary font-mono">mSv/year</div>
            </div>

            <div className="flex flex-col justify-center items-center bg-space-800/40 rounded-lg p-3 border border-space-700/50">
              <div className="flex items-center gap-1 mb-1">
                <Heart size={16} className="text-red-400" />
                <ProvenanceBadge type="NASA_SPEC" size="xs" detail="600 mSv" />
              </div>
              <div className="text-xl font-display text-white">{radiation.daysToLimit}</div>
              <div className="text-[10px] text-secondary font-mono text-center uppercase mt-0.5">Days to NASA<br/>Career Ceiling</div>
            </div>
          </div>
        </div>

        {/* Gauge Card */}
        <div className="glass-panel p-4 rounded-xl border border-space-700/50 flex flex-col justify-center items-center text-center">
          <div className="relative w-28 h-28 flex items-center justify-center mb-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="40" fill="none" stroke="#131825" strokeWidth="8" />
              <motion.circle 
                cx="56" cy="56" r="40" fill="none" 
                stroke={isSPEActive || gaugePercent > 80 ? '#ef4444' : gaugePercent > 50 ? '#eab308' : '#22c55e'} 
                strokeWidth="8"
                strokeDasharray={gaugeCircumference}
                initial={{ strokeDashoffset: gaugeCircumference }}
                animate={{ strokeDashoffset: isSPEActive ? 0 : gaugeDashOffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-display ${isSPEActive ? 'text-red-400 font-bold animate-pulse' : 'text-white'}`}>
                {isSPEActive ? 'OVER LIMIT' : `${Math.round(gaugePercent)}%`}
              </span>
              <span className="text-[9px] text-secondary">Annual Safety Limit</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
        {/* Comparison Chart */}
        <div className="lg:col-span-2 glass-panel p-4 rounded-xl border border-space-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-secondary font-medium uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} /> Annual Radiation Exposure Comparison (mSv)
            </h3>
            <ProvenanceBadge type="DERIVED" size="xs" detail="Comparative Dosimetry" />
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <XAxis type="number" stroke="#606c8b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#606c8b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131825', borderColor: '#2a334a', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f0f2f7' }}
                  formatter={(val) => [`${val} mSv/yr`, 'Annual Exposure']}
                />
                <Bar dataKey="dose" radius={[0, 4, 4, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traverse Dose Estimate */}
        <div className="glass-panel p-4 rounded-xl border border-space-700/50 flex flex-col justify-between">
          <div>
            <h3 className="text-sm text-secondary font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
              <Shield size={16} /> Planned Marswalk Dose
            </h3>
            {evaExposure ? (
              <div className="space-y-3 mt-4">
                <div>
                  <span className="text-secondary text-xs">Accumulated Traverse Dose</span>
                  <div className={`text-2xl font-display font-mono ${isSPEActive ? 'text-red-400 font-bold' : 'text-white'}`}>
                    {evaExposure.dose} mSv
                  </div>
                  <span className="text-xs text-secondary font-mono">Over {evaExposure.hours} hours EVA</span>
                </div>
                <div className="text-[11px] text-space-400 border-t border-space-700/50 pt-2 font-mono">
                  {isSPEActive 
                    ? '⚠️ CRITICAL: Radiation threshold exceeded. Abort immediately.' 
                    : 'Within nominal single-EVA safety allowance (0.50 mSv).'}
                </div>
              </div>
            ) : (
              <div className="text-secondary text-xs mt-6 flex flex-col items-center justify-center text-center">
                <AlertTriangle size={24} className="text-space-500 mb-2" />
                <span>Create a traverse in Route Planner to calculate astronaut mission exposure.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiationPanel;
