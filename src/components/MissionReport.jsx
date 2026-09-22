import React from 'react';
import { FileText, CheckCircle, AlertTriangle, Download, Clipboard } from 'lucide-react';
import useMapStore from '../store/useMapStore';

const Gauge = ({ score }) => {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let color = '#ef4444'; // red
  if (score >= 50) color = '#eab308'; // yellow
  if (score >= 80) color = '#22c55e'; // green

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle
          cx="48" cy="48" r={radius}
          stroke="currentColor" strokeWidth="8" fill="transparent"
          className="text-space-800"
        />
        <circle
          cx="48" cy="48" r={radius}
          stroke={color} strokeWidth="8" fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center mt-1">
        <span className="text-2xl font-bold font-mono text-primary leading-none">{score}</span>
        <span className="text-[9px] text-space-400 uppercase tracking-widest mt-1">Score</span>
      </div>
    </div>
  );
};

const MissionReport = () => {
  const { waypoints = [], missionActivities = [], weather = {} } = useMapStore();

  const totalDuration = missionActivities.reduce((acc, curr) => acc + curr.duration, 0) || 0;
  const isReady = waypoints.length >= 1 && totalDuration > 0;
  
  // Calculate fake readiness score
  let score = 0;
  if (waypoints.length >= 2) score += 30;
  else if (waypoints.length === 1) score += 10;
  
  if (missionActivities.length > 0) score += 30;
  
  if (totalDuration > 0 && totalDuration <= 8) score += 20;
  else if (totalDuration > 8) score -= 15;
  
  if (weather.sol) score += 20;

  score = Math.max(0, Math.min(100, score));

  const handleExport = () => {
    const report = `
=== MARSWALK MISSION BRIEFING ===
Date: Sol ${weather.sol || 1}
Waypoints: ${waypoints.length}
Est Distance: ${(waypoints.length * 1.2).toFixed(1)} km
Activities: ${missionActivities.length}
Total Duration: ${totalDuration} hrs
Readiness Score: ${score}/100
Status: ${score >= 80 ? 'GO FOR EVA' : (score >= 50 ? 'MARGINAL - REVIEW REQUIRED' : 'NO GO')}
=================================
    `.trim();
    navigator.clipboard.writeText(report);
  };

  return (
    <div className="glass-panel p-6 h-full flex flex-col relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-mars-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-6 pb-6 border-b border-space-800 relative z-10">
        <div>
          <h2 className="text-2xl font-display font-bold text-primary flex items-center mb-1">
            <FileText className="mr-2 text-mars-400" size={24} /> Briefing
          </h2>
          <div className="inline-block bg-space-900 border border-space-700 px-2 py-1 rounded text-xs text-space-300 font-mono mt-1">
            Sol {weather.sol || 1} Report
          </div>
        </div>
        <Gauge score={score} />
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2 relative z-10">
        <section>
          <h3 className="text-[11px] font-bold text-space-400 uppercase tracking-widest mb-3 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Route Overview
          </h3>
          <div className="bg-space-900/40 rounded-xl p-4 border border-space-800/50 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-space-500 uppercase tracking-wider font-bold mb-1">Waypoints</div>
              <div className="font-mono text-xl text-primary">{waypoints.length}</div>
            </div>
            <div>
              <div className="text-[10px] text-space-500 uppercase tracking-wider font-bold mb-1">Est. Distance</div>
              <div className="font-mono text-xl text-primary">{(waypoints.length * 1.2).toFixed(1)} <span className="text-sm text-space-400 font-sans">km</span></div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[11px] font-bold text-space-400 uppercase tracking-widest mb-3 flex items-center">
             <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span> Timeline
          </h3>
          <div className="bg-space-900/40 rounded-xl p-4 border border-space-800/50 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-space-500 uppercase tracking-wider font-bold mb-1">Activities</div>
              <div className="font-mono text-xl text-primary">{missionActivities.length}</div>
            </div>
            <div>
              <div className="text-[10px] text-space-500 uppercase tracking-wider font-bold mb-1">Duration</div>
              <div className="font-mono text-xl text-primary">{totalDuration} <span className="text-sm text-space-400 font-sans">h</span></div>
            </div>
          </div>
          {totalDuration > 8 && (
            <div className="mt-3 text-[11px] text-yellow-400 flex items-start bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
              <AlertTriangle size={14} className="mr-2 mt-0.5 shrink-0" />
              <span>Warning: Planned duration exceeds optimal 8h EVA limit. Fatigue risk high.</span>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-[11px] font-bold text-space-400 uppercase tracking-widest mb-3 flex items-center">
             <span className="w-2 h-2 bg-mars-500 rounded-full mr-2"></span> Risk Assessment
          </h3>
          <ul className="space-y-2">
            <li className="flex items-center text-xs bg-space-900/40 p-3 rounded-lg border border-space-800/50">
              <CheckCircle size={16} className="text-green-500 mr-3" /> 
              <span className="text-space-200">Dust levels nominal (Tau 0.3)</span>
            </li>
            <li className="flex items-center text-xs bg-space-900/40 p-3 rounded-lg border border-space-800/50">
              <CheckCircle size={16} className="text-green-500 mr-3" /> 
              <span className="text-space-200">Radiation within safe limits</span>
            </li>
            <li className="flex items-center text-xs bg-space-900/40 p-3 rounded-lg border border-space-800/50">
              <AlertTriangle size={16} className="text-yellow-500 mr-3" /> 
              <span className="text-space-200">Moderate slope near WP2</span>
            </li>
          </ul>
        </section>
      </div>

      <div className="mt-6 pt-5 border-t border-space-800 relative z-10">
        <button 
          onClick={handleExport}
          disabled={!isReady}
          className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center transition-all duration-300 ${
            isReady 
              ? 'bg-mars-600 hover:bg-mars-500 text-white shadow-lg shadow-mars-600/25 hover:shadow-mars-500/40' 
              : 'bg-space-800 text-space-500 cursor-not-allowed'
          }`}
        >
          <Clipboard size={18} className="mr-2" />
          Copy Mission Summary
        </button>
      </div>
    </div>
  );
};

export default MissionReport;
