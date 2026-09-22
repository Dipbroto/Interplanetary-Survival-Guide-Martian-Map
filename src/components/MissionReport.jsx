import React, { useState } from 'react';
import { FileText, CheckCircle, AlertTriangle, Download, Clipboard, Printer, FlaskConical } from 'lucide-react';
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
  const { 
    waypoints = [], 
    missionActivities = [], 
    weather = {}, 
    currentSol,
    setFlightPlanOpen,
    setScienceLabOpen
  } = useMapStore();
  
  const [copied, setCopied] = useState(false);

  const totalDuration = missionActivities.reduce((acc, curr) => acc + (curr.duration || 1), 0) || 0;
  
  // Calculate readiness score
  let score = 0;
  if (waypoints.length >= 2) score += 40;
  else if (waypoints.length === 1) score += 15;
  
  if (missionActivities.length > 0) score += 30;
  if (totalDuration > 0 && totalDuration <= 8) score += 20;
  if (weather && weather.sol) score += 10;
  score = Math.max(0, Math.min(100, score));

  const handleCopySummary = () => {
    const report = `
=== MARSWALK MISSION BRIEFING ===
Sol: ${currentSol || 1}
Waypoints Planned: ${waypoints.length}
Estimated Distance: ${(waypoints.length * 1.4).toFixed(1)} km
Scheduled Activities: ${missionActivities.length}
Estimated Duration: ${totalDuration} hrs
Readiness Score: ${score}/100
Status: ${score >= 80 ? 'GO FOR EVA' : (score >= 50 ? 'MARGINAL - REVIEW REQUIRED' : 'NO GO')}
=================================
    `.trim();
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel p-5 h-full flex flex-col relative overflow-hidden font-mono text-xs">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-mars-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4 pb-4 border-b border-space-800 relative z-10">
        <div>
          <h2 className="text-lg font-display font-bold text-white flex items-center mb-1">
            <FileText className="mr-2 text-mars-400" size={20} /> Flight Briefing
          </h2>
          <div className="inline-block bg-space-900 border border-space-700 px-2 py-0.5 rounded text-[10px] text-space-300">
            Sol {currentSol} Status Report
          </div>
        </div>
        <Gauge score={score} />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1 relative z-10">
        <section>
          <h3 className="text-[10px] font-bold text-space-400 uppercase tracking-widest mb-2 flex items-center">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span> Route Overview
          </h3>
          <div className="bg-space-900/40 rounded-xl p-3 border border-space-800/50 grid grid-cols-2 gap-3">
            <div>
              <div className="text-[9px] text-space-500 uppercase tracking-wider font-bold mb-0.5">Waypoints</div>
              <div className="font-mono text-lg text-white font-bold">{waypoints.length}</div>
            </div>
            <div>
              <div className="text-[9px] text-space-500 uppercase tracking-wider font-bold mb-0.5">Est. Traverse</div>
              <div className="font-mono text-lg text-white font-bold">{(waypoints.length * 1.4).toFixed(1)} <span className="text-xs text-space-400 font-sans">km</span></div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-space-400 uppercase tracking-widest mb-2 flex items-center">
             <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span> Timeline & Schedule
          </h3>
          <div className="bg-space-900/40 rounded-xl p-3 border border-space-800/50 grid grid-cols-2 gap-3">
            <div>
              <div className="text-[9px] text-space-500 uppercase tracking-wider font-bold mb-0.5">Activities</div>
              <div className="font-mono text-lg text-white font-bold">{missionActivities.length}</div>
            </div>
            <div>
              <div className="text-[9px] text-space-500 uppercase tracking-wider font-bold mb-0.5">Duration</div>
              <div className="font-mono text-lg text-white font-bold">{totalDuration} <span className="text-xs text-space-400 font-sans">h</span></div>
            </div>
          </div>
          {totalDuration > 8 && (
            <div className="mt-2 text-[10px] text-yellow-400 flex items-start bg-yellow-500/10 p-2.5 rounded-lg border border-yellow-500/20">
              <AlertTriangle size={14} className="mr-1.5 mt-0.5 shrink-0" />
              <span>Warning: Planned duration exceeds optimal 8h EVA limit. Fatigue risk high.</span>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-space-400 uppercase tracking-widest mb-2 flex items-center">
             <span className="w-1.5 h-1.5 bg-mars-500 rounded-full mr-2"></span> Risk Assessment
          </h3>
          <ul className="space-y-1.5">
            <li className="flex items-center text-[11px] bg-space-900/40 p-2.5 rounded-lg border border-space-800/50">
              <CheckCircle size={14} className="text-green-500 mr-2.5 shrink-0" /> 
              <span className="text-space-200">Atmospheric dust levels nominal (Tau 0.3)</span>
            </li>
            <li className="flex items-center text-[11px] bg-space-900/40 p-2.5 rounded-lg border border-space-800/50">
              <CheckCircle size={14} className="text-green-500 mr-2.5 shrink-0" /> 
              <span className="text-space-200">GCR radiation within NASA career threshold</span>
            </li>
            <li className="flex items-center text-[11px] bg-space-900/40 p-2.5 rounded-lg border border-space-800/50">
              <CheckCircle size={14} className="text-green-500 mr-2.5 shrink-0" /> 
              <span className="text-space-200">Walkback perimeter complies with flight rules</span>
            </li>
          </ul>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-space-800 relative z-10 flex flex-col gap-2">
        {/* Open In-Situ Science Laboratory Modal */}
        <button
          onClick={() => setScienceLabOpen(true)}
          className="w-full py-2.5 bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-800/25 transition-all text-xs cursor-pointer"
        >
          <FlaskConical size={15} className="text-purple-300" />
          <span>Launch In-Situ Science Laboratory</span>
        </button>

        {/* Open Official NASA Flight Plan Modal */}
        <button
          onClick={() => setFlightPlanOpen(true)}
          className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-700/25 transition-all text-xs cursor-pointer"
        >
          <Printer size={15} />
          <span>Official NASA Flight Plan & Checklist</span>
        </button>

        <button 
          onClick={handleCopySummary}
          className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-space-800 hover:bg-space-700 text-space-300 border border-space-700 transition-colors"
        >
          <Clipboard size={14} />
          <span>{copied ? 'Summary Copied to Clipboard!' : 'Copy Summary'}</span>
        </button>
      </div>
    </div>
  );
};

export default MissionReport;
