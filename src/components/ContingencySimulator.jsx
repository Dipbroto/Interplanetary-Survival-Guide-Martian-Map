import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, ShieldAlert, Radio, Wind, HeartPulse, 
  RotateCcw, Compass, ArrowRight, X, Activity, CheckCircle2 
} from 'lucide-react';
import useMapStore from '../store/useMapStore';
import ProvenanceBadge from './ProvenanceBadge';

const SCENARIO_BUTTONS = [
  {
    type: 'spe',
    title: 'Solar Flare (SPE)',
    icon: ShieldAlert,
    tag: 'RAD CRITICAL',
    desc: 'Coronal particle surge, 14.5 mSv/hr',
    color: 'from-purple-900/60 to-purple-800/40 hover:border-purple-400 text-purple-200 border-purple-600/50',
  },
  {
    type: 'dust_storm',
    title: 'Dust Storm Inflow',
    icon: Wind,
    tag: 'TAU > 2.8',
    desc: 'Vis < 40m, 28 m/s turbulent winds',
    color: 'from-amber-900/60 to-amber-800/40 hover:border-amber-400 text-amber-200 border-amber-600/50',
  },
  {
    type: 'o2_leak',
    title: 'Suit O₂ Regulator Anomaly',
    icon: HeartPulse,
    tag: 'LIFE SUPPORT',
    desc: 'Secondary tank decay, walkback cut 60%',
    color: 'from-red-900/60 to-red-800/40 hover:border-red-400 text-red-200 border-red-600/50',
  },
  {
    type: 'rockfall',
    title: 'Talus Rim Rockfall',
    icon: AlertTriangle,
    tag: 'SLOPE > 28°',
    desc: 'Crater pass impassable, boulder field',
    color: 'from-orange-900/60 to-orange-800/40 hover:border-orange-400 text-orange-200 border-orange-600/50',
  },
];

export default function ContingencySimulator() {
  const {
    activeContingency,
    contingencyDetails,
    isContingencyModalOpen,
    setContingencyModalOpen,
    triggerContingency,
    clearContingency,
    executeEmergencyReturn,
    waypoints
  } = useMapStore();

  return (
    <>
      {/* Floating Active Emergency Banner across Map */}
      <AnimatePresence>
        {activeContingency && contingencyDetails && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`fixed top-14 left-1/2 -translate-x-1/2 z-[1050] max-w-3xl w-[94%] px-4 py-2.5 rounded-xl border-2 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 ${contingencyDetails.bgColor} ${contingencyDetails.borderColor}`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-red-600/40 border border-red-500 flex items-center justify-center shrink-0 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-red-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider truncate">
                    CONTINGENCY: {contingencyDetails.title}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-red-500/20 text-red-300 border border-red-500/40 shrink-0">
                    {contingencyDetails.badge}
                  </span>
                </div>
                <p className="text-[10px] text-space-300 truncate">
                  {contingencyDetails.actionRequired}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={executeEmergencyReturn}
                className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5 transition-all hover:scale-105"
                title="Immediately route return to Basecamp"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ABORT TRAVERSE</span>
              </button>

              <button
                onClick={() => setContingencyModalOpen(true)}
                className="px-2.5 py-1.5 bg-space-800 hover:bg-space-700 text-space-200 text-xs rounded-lg border border-space-700 font-mono transition-colors"
                title="View Full Contingency Delta Analysis"
              >
                Inspect
              </button>

              <button
                onClick={clearContingency}
                className="p-1.5 text-space-400 hover:text-white rounded-lg hover:bg-space-800 transition-colors"
                title="Clear simulation alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contingency Modal & Control Panel */}
      <AnimatePresence>
        {isContingencyModalOpen && (
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setContingencyModalOpen(false);
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono text-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel-solid w-full max-w-2xl max-h-[92vh] rounded-2xl border-2 border-red-500/60 bg-space-950 shadow-2xl flex flex-col overflow-hidden text-primary"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-space-800 bg-space-900/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                      <span>NASA What-If Mission Simulator</span>
                      <ProvenanceBadge type="SIMULATED" size="xs" detail="Contingency Model" />
                    </h2>
                    <p className="text-[10px] text-space-400">
                      DYNAMIC MARSWALK RISK & ABORT DECISION SUPPORT
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setContingencyModalOpen(false)}
                  className="px-3 py-1.5 bg-space-800 hover:bg-space-700 text-white rounded-xl flex items-center gap-1.5 transition-all border border-space-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>CLOSE (ESC)</span>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-5">
                {/* Select Contingency Scenario */}
                <div>
                  <div className="text-[11px] font-bold text-space-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>1. Inject Operational Contingency Scenario</span>
                    <span className="text-[10px] text-space-500 font-normal">Select an anomaly to test traverse response</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {SCENARIO_BUTTONS.map((btn) => {
                      const Icon = btn.icon;
                      const isSelected = activeContingency === btn.type;
                      return (
                        <button
                          key={btn.type}
                          onClick={() => triggerContingency(btn.type)}
                          className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${btn.color} ${
                            isSelected ? 'ring-2 ring-red-400 border-red-400 shadow-lg' : 'bg-space-900/40'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-white">{btn.title}</span>
                              <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-black/50 border border-white/10 text-space-300">
                                {btn.tag}
                              </span>
                            </div>
                            <p className="text-[10px] text-space-300 mt-1 leading-tight">{btn.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Impact Delta Box */}
                {contingencyDetails ? (
                  <div className={`p-4 rounded-xl border ${contingencyDetails.bgColor} ${contingencyDetails.borderColor} space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white uppercase flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span>Active Telemetry Delta: {contingencyDetails.title}</span>
                      </span>
                      <span className="text-[10px] font-bold text-red-400 font-mono animate-pulse">
                        SHELTER DEADLINE: {contingencyDetails.deadlineMinutes} MIN
                      </span>
                    </div>

                    <p className="text-[11px] text-space-200 leading-relaxed">
                      {contingencyDetails.description}
                    </p>

                    {/* Operational Delta Matrix */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-space-800">
                      <div className="p-2 bg-black/40 rounded-lg">
                        <span className="text-[9px] text-space-400 block uppercase">Radiation Rate</span>
                        <span className="text-sm font-bold text-purple-400 font-mono">
                          {activeContingency === 'spe' ? '14.5 mSv/h (+250x)' : '0.028 mSv/h'}
                        </span>
                      </div>
                      <div className="p-2 bg-black/40 rounded-lg">
                        <span className="text-[9px] text-space-400 block uppercase">Dust Opacity (τ)</span>
                        <span className="text-sm font-bold text-amber-400 font-mono">
                          {activeContingency === 'dust_storm' ? 'τ 2.9 (Severe)' : 'τ 0.5 (Nominal)'}
                        </span>
                      </div>
                      <div className="p-2 bg-black/40 rounded-lg">
                        <span className="text-[9px] text-space-400 block uppercase">Walkback Margin</span>
                        <span className="text-sm font-bold text-red-400 font-mono">
                          {activeContingency === 'o2_leak' ? '1.8 km (Degraded)' : '5.0 km (Nominal)'}
                        </span>
                      </div>
                    </div>

                    {/* Action Execution Footer */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <div className="text-[10px] text-space-400">
                        Recommendation: <strong>Immediate Return to Basecamp</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={clearContingency}
                          className="px-3 py-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-space-300 text-xs border border-space-700"
                        >
                          Clear Alert
                        </button>
                        <button
                          onClick={executeEmergencyReturn}
                          className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/40"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Execute Abort & Safe Return</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-space-800 text-center text-space-400">
                    <CheckCircle2 className="w-8 h-8 text-green-500/60 mx-auto mb-2" />
                    <p className="font-bold text-white text-xs">Traverse Parameters Nominal</p>
                    <p className="text-[11px] mt-1 text-space-400">
                      Select one of the 4 contingency buttons above to inject simulated Martian anomalies.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
