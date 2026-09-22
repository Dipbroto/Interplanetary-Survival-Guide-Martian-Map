import React, { useMemo } from 'react';
import useMapStore from '../store/useMapStore';
import { estimateRadiation, routeDistance } from '../utils/marsUtils';
import { RadioTower, Shield, AlertTriangle, Activity, Heart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const RadiationPanel = () => {
  const { currentSol, waypoints } = useMapStore();
  
  // Simulated elevation based on map center (for demo purposes)
  const elevation = -2500; 

  const radiation = useMemo(() => {
    // 24 hours to get daily dose
    const dailyDoseInfo = estimateRadiation(24, elevation);
    const hourlyDoseRate = dailyDoseInfo.doseRate || dailyDoseInfo.totalDose / 24; 
    
    // Fallback if doseRate isn't returned directly by estimateRadiation
    const hourly = typeof hourlyDoseRate === 'number' ? hourlyDoseRate : (0.67 / 24);
    
    const daily = hourly * 24;
    const annual = daily * 365.25; // Earth days for standardized mSv/year
    
    // SPE Risk based on a pseudo-random cycle (11-year solar cycle simulated via sol)
    const speRisk = (Math.sin(currentSol / 200) + 1) / 2; // 0 to 1
    
    // Career limit calculation
    const careerLimit = 600; // mSv
    const daysToLimit = Math.floor(careerLimit / daily);
    
    return {
      hourly,
      daily,
      annual,
      speRisk,
      daysToLimit,
      careerLimit
    };
  }, [currentSol, elevation]);

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
    { name: 'Mars', dose: Math.round(radiation.annual), color: '#f47050' },
  ];

  // Gauge calculation
  const gaugePercent = Math.min(100, (radiation.annual / 300) * 100);
  const gaugeCircumference = 2 * Math.PI * 40;
  const gaugeDashArray = gaugeCircumference;
  const gaugeDashOffset = gaugeCircumference - (gaugePercent / 100) * gaugeCircumference;

  return (
    <div className="w-full h-full text-primary flex flex-col gap-4 overflow-y-auto custom-scrollbar p-2">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-display text-white flex items-center gap-2">
            <RadioTower className="text-yellow-400" size={24} />
            Radiation Environment
          </h2>
          <div className="text-sm text-secondary flex items-center gap-2 mt-1 font-mono">
            <Activity size={14} />
            <span>Active Monitoring</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {radiation.speRisk > 0.7 ? (
            <div className="flex items-center gap-1.5 bg-red-900/50 px-3 py-1.5 rounded-full border border-red-700/50 text-xs text-red-400 font-bold animate-pulse">
              <AlertTriangle size={14} /> SPE WARNING
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-green-900/50 px-3 py-1.5 rounded-full border border-green-700/50 text-xs text-green-400">
              <Shield size={14} /> NORMAL GCR
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Metrics */}
        <div className="md:col-span-2 glass-panel p-4 rounded-xl border border-space-700/50 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col justify-center">
              <span className="text-secondary text-xs mb-1">GCR Dose Rate</span>
              <div className="text-3xl font-display text-yellow-400 mb-1">
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
              <span className="text-secondary text-xs mb-1">Annual Dose</span>
              <div className="text-2xl font-display text-mars-400 mb-1">
                {radiation.annual.toFixed(1)}
              </div>
              <div className="text-xs text-secondary font-mono">mSv/year</div>
            </div>

            <div className="flex flex-col justify-center items-center bg-space-800/40 rounded-lg p-3 border border-space-700/50">
              <Heart size={20} className="text-red-400 mb-2" />
              <div className="text-xl font-display text-white">{radiation.daysToLimit}</div>
              <div className="text-[10px] text-secondary font-mono text-center uppercase mt-1">Days to NASA<br/>Career Limit</div>
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
                stroke={gaugePercent > 80 ? '#ef4444' : gaugePercent > 50 ? '#eab308' : '#22c55e'} 
                strokeWidth="8"
                strokeDasharray={gaugeDashArray}
                initial={{ strokeDashoffset: gaugeDashArray }}
                animate={{ strokeDashoffset: gaugeDashOffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-display text-white">{Math.round(gaugePercent)}%</span>
              <span className="text-[9px] text-secondary">Annual Limit</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
        {/* Comparison Chart */}
        <div className="lg:col-span-2 glass-panel p-4 rounded-xl border border-space-700/50">
          <h3 className="text-sm text-secondary font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity size={16} /> Annual Exposure Comparison (mSv)
          </h3>
          <div className="h-40 w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke="#606c8b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#f0f2f7" fontSize={12} tickLine={false} axisLine={false} width={50} />
                <Tooltip 
                  cursor={{ fill: '#2a334a' }}
                  contentStyle={{ backgroundColor: '#131825', borderColor: '#2a334a', borderRadius: '8px' }}
                  itemStyle={{ color: '#f0f2f7' }}
                />
                <Bar dataKey="dose" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#97a3c5', fontSize: 10 }}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* EVA Exposure / Tips */}
        <div className="glass-panel p-4 rounded-xl border border-space-700/50 flex flex-col gap-4">
          <div>
            <h3 className="text-sm text-secondary font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield size={16} /> EVA Exposure
            </h3>
            {evaExposure ? (
              <div className="bg-space-800/60 p-3 rounded-lg border border-space-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-secondary">Est. Duration</span>
                  <span className="text-white font-mono">{evaExposure.hours} hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">Est. Dose</span>
                  <span className="text-mars-400 font-mono font-bold">{evaExposure.dose} mSv</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-secondary italic text-center p-4 bg-space-800/30 rounded-lg">
                Plan a route to estimate EVA radiation exposure.
              </div>
            )}
          </div>
          
          <div className="flex-1 bg-space-900/50 p-3 rounded-lg border border-space-800">
            <h4 className="text-xs text-white font-medium mb-2 flex items-center gap-1">
              <AlertTriangle size={12} className="text-yellow-500" /> SPE Shielding
            </h4>
            <p className="text-[11px] text-secondary leading-relaxed">
              In the event of a Solar Particle Event, seek shelter in lava tubes or under 3+ meters of regolith. Current SPE probability is <span className={radiation.speRisk > 0.5 ? 'text-red-400 font-bold' : 'text-green-400'}>{(radiation.speRisk * 100).toFixed(1)}%</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiationPanel;
