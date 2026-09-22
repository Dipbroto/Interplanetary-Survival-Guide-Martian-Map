import React, { useMemo } from 'react';
import useMapStore from '../store/useMapStore';
import { getElevationProfile, getProfileStats } from '../utils/elevationService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Mountain } from 'lucide-react';

export default function ElevationProfile() {
  const { waypoints } = useMapStore();

  const { data, stats } = useMemo(() => {
    if (!waypoints || waypoints.length < 2) return { data: null, stats: null };
    const profile = getElevationProfile(waypoints, 100);
    const profileStats = getProfileStats(profile);
    return { data: profile, stats: profileStats };
  }, [waypoints]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel p-3 border border-space-700 rounded-lg text-xs font-mono shadow-xl bg-space-900/95 backdrop-blur-md">
          <div className="text-mars-400 font-bold mb-1.5 border-b border-space-700/80 pb-1.5">
            {data.distance.toFixed(2)} km along route
          </div>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-space-400">Elevation:</span>
            <span className="text-primary font-semibold">{data.elevation.toFixed(1)} m</span>
          </div>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-space-400">Slope:</span>
            <span className={`${Math.abs(data.slope) > 15 ? 'text-red-400' : 'text-primary'} font-semibold`}>
              {data.slope?.toFixed(1) || 0}°
            </span>
          </div>
          <div className="text-space-500 text-[10px] mt-2 pt-1.5 border-t border-space-800">
            {data.lat?.toFixed(5)}°, {data.lng?.toFixed(5)}°
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-secondary bg-space-900/40 rounded-xl border border-space-800">
        <Mountain className="w-12 h-12 mb-3 text-space-700" strokeWidth={1} />
        <p className="text-sm font-medium">No route planned</p>
        <p className="text-xs text-space-500 mt-1 max-w-xs text-center">Add at least two waypoints in the Route Planner to view the elevation cross-section.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-3 text-primary bg-space-900/40 rounded-xl border border-space-800">
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className="text-sm font-display text-primary flex items-center gap-2">
          <Mountain className="w-4 h-4 text-mars-400" />
          Elevation Cross-Section
        </h3>
      </div>
      
      <div className="flex-1 min-h-0 w-full relative pl-2 pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4c2e" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#ec4c2e" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="distance" 
              type="number"
              tickFormatter={(val) => val.toFixed(1)} 
              stroke="#64748b"
              fontSize={10}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={['dataMin - 20', 'dataMax + 20']} 
              tickFormatter={(val) => val.toFixed(0)}
              stroke="#64748b"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tick={{ dx: -5 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
            {stats && (
              <>
                <ReferenceLine y={stats.maxElevation} stroke="#f87171" strokeDasharray="3 3" opacity={0.4}>
                </ReferenceLine>
                <ReferenceLine y={stats.minElevation} stroke="#38bdf8" strokeDasharray="3 3" opacity={0.4}>
                </ReferenceLine>
              </>
            )}
            <Area 
              type="monotone" 
              dataKey="elevation" 
              stroke="#f47050" 
              fillOpacity={1} 
              fill="url(#colorElevation)" 
              strokeWidth={2}
              activeDot={{ r: 4, fill: '#f0f2f7', stroke: '#ec4c2e', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {stats && (
        <div className="grid grid-cols-5 gap-2 mt-4 px-4 py-2.5 bg-space-800/50 rounded-lg border border-space-700/50 text-center">
          <div className="border-r border-space-700/50 pr-2">
            <div className="text-[10px] text-space-400 uppercase tracking-wider mb-0.5">Total Dist</div>
            <div className="font-mono text-sm text-primary">{stats.distance.toFixed(2)} <span className="text-[10px] text-space-500 font-sans">km</span></div>
          </div>
          <div className="border-r border-space-700/50 pr-2">
            <div className="text-[10px] text-space-400 uppercase tracking-wider mb-0.5">Elev Gain</div>
            <div className="font-mono text-sm text-green-400">+{stats.gain.toFixed(0)} <span className="text-[10px] text-green-700 font-sans">m</span></div>
          </div>
          <div className="border-r border-space-700/50 pr-2">
            <div className="text-[10px] text-space-400 uppercase tracking-wider mb-0.5">Elev Loss</div>
            <div className="font-mono text-sm text-red-400">-{stats.loss.toFixed(0)} <span className="text-[10px] text-red-700 font-sans">m</span></div>
          </div>
          <div className="border-r border-space-700/50 pr-2">
            <div className="text-[10px] text-space-400 uppercase tracking-wider mb-0.5">Max Slope</div>
            <div className="font-mono text-sm text-mars-400">{stats.maxSlope.toFixed(1)}°</div>
          </div>
          <div>
            <div className="text-[10px] text-space-400 uppercase tracking-wider mb-0.5">Avg Slope</div>
            <div className="font-mono text-sm text-primary">{stats.avgSlope.toFixed(1)}°</div>
          </div>
        </div>
      )}
    </div>
  );
}
