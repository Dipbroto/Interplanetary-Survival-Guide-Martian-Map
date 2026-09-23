import React, { useState } from 'react';
import { Database, Satellite, Cpu, Calculator, ShieldAlert, Info } from 'lucide-react';

export const PROVENANCE_DEFINITIONS = {
  OBSERVED: {
    label: 'OBSERVED',
    fullName: 'Direct Satellite / In-Situ Observation',
    description: 'Empirical data directly recorded by NASA/ESA instruments (e.g. MGS MOLA laser altimetry, Viking VIS camera, Mars Odyssey THEMIS IR).',
    bgColor: 'bg-emerald-950/70',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    dotColor: 'bg-emerald-400',
    icon: Satellite,
  },
  HISTORICAL: {
    label: 'HISTORICAL',
    fullName: 'Archival Mission Record',
    description: 'Historical records compiled across multi-year Martian surface operations (e.g. Curiosity REMS weather, Perseverance MEDA environmental logs).',
    bgColor: 'bg-cyan-950/70',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    dotColor: 'bg-cyan-400',
    icon: Database,
  },
  DERIVED: {
    label: 'DERIVED',
    fullName: 'Mathematical Geodesic Derivation',
    description: 'Scientifically derived using IAU 2000 planetocentric constants, Haversine spherical math, and Inverse Distance Weighting (IDW) interpolation.',
    bgColor: 'bg-purple-950/70',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    dotColor: 'bg-purple-400',
    icon: Calculator,
  },
  SIMULATED: {
    label: 'SIMULATED',
    fullName: 'Dynamic Physics Simulation',
    description: 'Real-time bioenergetic, radiation shielding, or diurnal atmospheric model based on peer-reviewed planetary formulas.',
    bgColor: 'bg-amber-950/70',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    dotColor: 'bg-amber-400',
    icon: Cpu,
  },
  NASA_SPEC: {
    label: 'NASA SPEC',
    fullName: 'Official NASA Flight Baseline',
    description: 'Formal NASA flight rule requirement, astronaut career radiation exposure ceiling, or life-support consumables budget standard.',
    bgColor: 'bg-red-950/70',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/40',
    dotColor: 'bg-red-400',
    icon: ShieldAlert,
  },
};

export default function ProvenanceBadge({ type = 'OBSERVED', size = 'sm', detail = '', className = '' }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = PROVENANCE_DEFINITIONS[type] || PROVENANCE_DEFINITIONS.OBSERVED;
  const Icon = config.icon;

  const sizeClasses = size === 'xs'
    ? 'text-[9px] px-1.5 py-0.5 gap-1'
    : size === 'md'
    ? 'text-xs px-2.5 py-1 gap-1.5'
    : 'text-[10px] px-2 py-0.5 gap-1.2';

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`inline-flex items-center font-mono font-bold tracking-wider rounded border cursor-help select-none transition-all ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses} shadow-sm hover:brightness-125`}
        title={config.fullName}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`} />
        <Icon className="w-2.5 h-2.5 opacity-80" />
        <span>{config.label}</span>
        {detail && <span className="opacity-75 font-normal">| {detail}</span>}
      </span>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-space-950/95 border border-space-700 rounded-lg shadow-xl text-[11px] text-space-200 z-[9999] pointer-events-none backdrop-blur-md">
          <div className={`font-bold flex items-center gap-1.5 mb-1 ${config.textColor}`}>
            <Icon className="w-3 h-3" />
            <span>{config.fullName}</span>
          </div>
          <p className="text-[10px] leading-tight text-space-300">
            {detail ? `${detail}: ` : ''}{config.description}
          </p>
          <div className="mt-1.5 pt-1 border-t border-space-800 text-[9px] text-space-500 font-mono flex justify-between">
            <span>NASA Space Apps 2026</span>
            <span>Provenance Metric</span>
          </div>
        </div>
      )}
    </div>
  );
}
