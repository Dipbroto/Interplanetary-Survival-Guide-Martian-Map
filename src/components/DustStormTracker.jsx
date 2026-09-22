import React, { useMemo } from 'react';
import useMapStore from '../store/useMapStore';
import { dustStormSeasons, getSolarLongitude } from '../data/weatherSimulation';
import { CloudFog, AlertTriangle, Wind, Eye, ShieldAlert, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const DustStormTracker = () => {
  const { currentSol } = useMapStore();
  
  const { ls, currentSeason, chartData, currentRiskLevel, riskColor, riskText } = useMemo(() => {
    const currentLs = getSolarLongitude(currentSol);
    
    let currentSsn = null;
    let riskLvl = 0;
    
    const data = dustStormSeasons.map((season) => {
      const isCurrent = currentLs >= season.ls[0] && currentLs < season.ls[1];
      if (isCurrent) {
        currentSsn = season;
        riskLvl = season.risk;
      }
      return {
        name: `${season.ls[0]}-${season.ls[1]}°`,
        riskPercent: Math.round(season.risk * 100),
        label: season.label,
        isCurrent
      };
    });
    
    // Fallback if exactly 360
    if (!currentSsn) {
      currentSsn = dustStormSeasons[dustStormSeasons.length - 1];
      riskLvl = currentSsn.risk;
      data[data.length - 1].isCurrent = true;
    }

    let color = '#22c55e';
    let text = 'LOW';
    if (riskLvl > 0.6) {
      color = '#ef4444';
      text = 'SEVERE';
    } else if (riskLvl > 0.4) {
      color = '#f97316';
      text = 'HIGH';
    } else if (riskLvl > 0.2) {
      color = '#eab308';
      text = 'MODERATE';
    }

    return { 
      ls: currentLs, 
      currentSeason: currentSsn, 
      chartData: data,
      currentRiskLevel: riskLvl,
      riskColor: color,
      riskText: text
    };
  }, [currentSol]);

  return (
    <div className="w-full h-full text-primary flex flex-col gap-4 overflow-y-auto custom-scrollbar p-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-display text-white flex items-center gap-2">
            <Wind className="text-mars-400" size={24} />
            Dust Storm Tracker
          </h2>
          <div className="text-sm text-secondary flex items-center gap-2 mt-1 font-mono">
            <Eye size={14} />
            <span>Global Monitoring Network</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-space-800/80 px-3 py-1.5 rounded-full border border-space-700 text-xs text-secondary font-mono">
          <span>Ls: {Math.round(ls)}°</span>
          <span className="text-space-600">•</span>
          <span>{currentSeason.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Risk Badge */}
        <div className="md:col-span-1 glass-panel p-6 rounded-xl border border-space-700/50 flex flex-col items-center justify-center relative overflow-hidden">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: riskColor }}
          ></div>
          
          <h3 className="text-sm text-secondary font-medium uppercase tracking-wider mb-2">Current Risk Level</h3>
          
          <div 
            className="text-4xl font-display mt-2 mb-4 tracking-wider animate-pulse"
            style={{ color: riskColor, textShadow: `0 0 20px ${riskColor}80` }}
          >
            {riskText}
          </div>
          
          <div className="text-4xl font-display text-white flex items-baseline gap-1">
            {Math.round(currentRiskLevel * 100)}<span className="text-xl text-secondary">%</span>
          </div>
          <div className="text-xs text-secondary font-mono mt-1">Probability</div>
        </div>

        {/* Probability Chart */}
        <div className="md:col-span-2 glass-panel p-4 rounded-xl border border-space-700/50">
          <h3 className="text-sm text-secondary font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock size={16} /> Annual Dust Storm Probability (Ls)
          </h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#606c8b" fontSize={10} tickLine={false} axisLine={false} interval={1} />
                <YAxis stroke="#606c8b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#2a334a' }}
                  contentStyle={{ backgroundColor: '#131825', borderColor: '#2a334a', borderRadius: '8px' }}
                  itemStyle={{ color: '#f0f2f7' }}
                  labelStyle={{ color: '#97a3c5', marginBottom: '4px' }}
                />
                <Bar dataKey="riskPercent" name="Probability %" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isCurrent ? '#f47050' : '#394663'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
        {/* Historical Storms */}
        <div className="glass-panel p-4 rounded-xl border border-space-700/50">
          <h3 className="text-sm text-secondary font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
            <CloudFog size={16} /> Notable Historical Storms
          </h3>
          <div className="flex flex-col gap-2">
            <div className="bg-space-800/40 p-3 rounded-lg border border-space-700/50 flex justify-between items-center">
              <div>
                <div className="text-white text-sm font-medium">2018 Global Dust Storm</div>
                <div className="text-xs text-secondary mt-1">Ended the Opportunity rover mission.</div>
              </div>
              <div className="text-mars-400 font-mono text-xs bg-mars-900/30 px-2 py-1 rounded">Ls 185-250</div>
            </div>
            <div className="bg-space-800/40 p-3 rounded-lg border border-space-700/50 flex justify-between items-center">
              <div>
                <div className="text-white text-sm font-medium">2007 Global Storm</div>
                <div className="text-xs text-secondary mt-1">Significant tau levels at Spirit/Opportunity.</div>
              </div>
              <div className="text-yellow-400 font-mono text-xs bg-yellow-900/30 px-2 py-1 rounded">Ls 265-310</div>
            </div>
            <div className="bg-space-800/40 p-3 rounded-lg border border-space-700/50 flex justify-between items-center">
              <div>
                <div className="text-white text-sm font-medium">2001 Global Storm</div>
                <div className="text-xs text-secondary mt-1">Observed extensively by Mars Global Surveyor.</div>
              </div>
              <div className="text-yellow-400 font-mono text-xs bg-yellow-900/30 px-2 py-1 rounded">Ls 185-220</div>
            </div>
          </div>
        </div>

        {/* Safety Guidelines */}
        <div className="glass-panel p-4 rounded-xl border border-space-700/50 bg-gradient-to-br from-space-900 to-space-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm text-secondary font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldAlert size={16} /> EVA Safety Recommendations
            </h3>
            <ul className="space-y-3 text-sm text-primary">
              <li className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                <span><strong className="text-white">Visibility Drop:</strong> Expect sudden decreases in visibility. Ensure suit beacons are active during excursions.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                <span><strong className="text-white">Solar Power:</strong> Solar array efficiency will drop by up to 90%. Maintain critical battery reserves.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                <span><strong className="text-white">Thermal Control:</strong> Lower daytime temperatures and higher nighttime temperatures. Adjust suit thermal loops.</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-space-700 text-xs text-secondary italic text-center">
            Standard Operating Procedure MSFC-EVA-09A
          </div>
        </div>
      </div>
    </div>
  );
};

export default DustStormTracker;
