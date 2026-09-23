import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Printer, Download, ShieldCheck, AlertTriangle, FileText, 
  CheckCircle2, Copy, Check, ExternalLink, Compass, ShieldAlert 
} from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { routeDistance, estimateEVATime, estimateO2Consumption, estimateWaterConsumption, estimatePowerConsumption } from '../utils/marsUtils';
import { getElevationProfile, getProfileStats } from '../utils/elevationService';
import ProvenanceBadge from './ProvenanceBadge';

export default function FlightPlanModal() {
  const { 
    isFlightPlanOpen, 
    setFlightPlanOpen, 
    waypoints, 
    missionActivities, 
    collectedSamples,
    weather,
    currentSol,
    activeContingency,
    contingencyDetails,
  } = useMapStore();

  const [copied, setCopied] = useState(false);

  // Escape key to close (called unconditionally at top level)
  React.useEffect(() => {
    if (!isFlightPlanOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setFlightPlanOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlightPlanOpen, setFlightPlanOpen]);

  if (!isFlightPlanOpen) return null;

  const totalDist = routeDistance(waypoints || []);
  const profile = getElevationProfile(waypoints || [], 100);
  const stats = getProfileStats(profile);
  const evaEst = estimateEVATime(totalDist, stats ? stats.avgSlope : 0);
  const evaHours = typeof evaEst === 'object' ? evaEst.totalHours : evaEst;

  const o2 = estimateO2Consumption(evaHours);
  const h2o = estimateWaterConsumption(evaHours);
  const pwr = estimatePowerConsumption(evaHours, -60);

  const handleDownloadJSON = () => {
    const flightPackage = {
      missionTitle: 'MARSWALK EXPLORER EXPEDITION EVA-2026',
      sol: currentSol,
      generatedAt: new Date().toISOString(),
      weatherConditions: {
        season: weather?.season,
        temperatureC: weather?.temperature?.avg,
        pressurePa: weather?.pressure?.value,
        windSpeedMs: weather?.wind?.speed,
        dustOpacityTau: weather?.dustOpacity
      },
      routeSummary: {
        totalDistanceKm: totalDist,
        estimatedDurationHours: evaHours,
        elevationGainM: stats?.elevationGain ?? stats?.gain ?? 0,
        elevationLossM: stats?.elevationLoss ?? stats?.loss ?? 0,
        maxSlopeDeg: stats?.maxSlope ?? 0
      },
      waypoints: (waypoints || []).map((wp, i) => ({
        sequence: i + 1,
        id: wp.id,
        name: wp.name,
        latitude: wp.lat,
        longitude: wp.lon !== undefined ? wp.lon : wp.lng,
        elevationMeters: wp.elevation
      })),
      consumablesBudget: {
        oxygenKg: o2.totalKg,
        oxygenLiters: o2.totalLiters,
        waterLiters: h2o.totalLiters,
        batteryPowerKwh: pwr.energyKWh
      },
      scientificSampleManifest: collectedSamples,
      dataProvenance: [
        { domain: 'Topography & Relief', source: 'NASA MGS MOLA MEGDR', type: 'OBSERVED' },
        { domain: 'True Color Imagery', source: 'NASA Viking Orbiter MDIM21', type: 'OBSERVED' },
        { domain: 'Thermal Surface Inertia', source: 'NASA Mars Odyssey THEMIS', type: 'OBSERVED' },
        { domain: 'Weather Climatology', source: 'Perseverance MEDA / Curiosity REMS', type: 'HISTORICAL' },
        { domain: 'Geodesic Navigation', source: 'IAU 2000 Spherical Planetocentric Math', type: 'DERIVED' },
        { domain: 'Bioenergetics & Shielding', source: 'Margaria-Minetti / Curiosity RAD', type: 'SIMULATED' },
      ],
      flightRules: [
        'EVA-FR-01: Maximum walkback limit fixed at 5.0 km radius from primary pressurized shelter.',
        'EVA-FR-02: Terrain slope sections > 15 degrees require safety tether and CapCom abort check.',
        'EVA-FR-03: Solar particle event (SPE) alarms require immediate abort within 20 minutes.',
        'EVA-FR-04: Dust opacity exceeding tau 1.8 grounds rover travel and triggers suit beacon tracking.'
      ]
    };

    const blob = new Blob([JSON.stringify(flightPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NASA_MARSWALK_EVA_PLAN_SOL_${currentSol}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    let md = `# NASA MARSWALK OPERATIONAL MISSION BRIEF\n`;
    md += `**Document Code:** JPL-EVA-2026-MARS | **Mission Sol:** ${currentSol}\n`;
    md += `**Generated:** ${new Date().toISOString()} | **Challenge:** NASA Space Apps Challenge 2026\n\n`;
    
    md += `## 1. Executive Traverse Summary\n`;
    md += `- **Total Traverse Distance:** ${totalDist.toFixed(2)} km\n`;
    md += `- **Estimated Duration:** ${evaHours.toFixed(1)} hrs\n`;
    md += `- **Waypoints Count:** ${waypoints?.length || 0} stations\n`;
    md += `- **Maximum Terrain Slope:** ${stats?.maxSlope?.toFixed(1) || 0}°\n`;
    md += `- **Elevation Profile:** +${(stats?.elevationGain ?? stats?.gain ?? 0).toFixed(0)}m / -${(stats?.elevationLoss ?? stats?.loss ?? 0).toFixed(0)}m\n\n`;

    md += `## 2. Consumables & Life Support Budget\n`;
    md += `| Consumable | Quantity | Baseline Standard |\n`;
    md += `| :--- | :--- | :--- |\n`;
    md += `| **Metabolic Oxygen (O₂)** | ${o2.totalKg} kg (${o2.totalLiters} L) | NASA STD-3001 EVA Human Rating |\n`;
    md += `| **Potable Water (H₂O)** | ${h2o.totalLiters} L | Sublimator & Astronaut Hydration Loop |\n`;
    md += `| **Power Draw & Heating** | ${pwr.energyKWh} kWh (${pwr.powerWatts} W) | Active Thermal Control System (ATCS) |\n\n`;

    md += `## 3. Traverse Waypoints Manifest\n`;
    md += `| # | Waypoint Designation | Latitude | Longitude | Elevation | Function |\n`;
    md += `| :-: | :--- | :--- | :--- | :--- | :--- |\n`;
    (waypoints || []).forEach((wp, i) => {
      const lon = (wp.lon !== undefined ? wp.lon : wp.lng || 0).toFixed(4);
      md += `| ${i + 1} | ${wp.name || `Waypoint ${i + 1}`} | ${wp.lat.toFixed(4)}° | ${lon}° | ${wp.elevation ? wp.elevation.toFixed(0) : 0} m | ${wp.reason || 'Navigation Contour'} |\n`;
    });
    md += `\n`;

    md += `## 4. Scientific Data Provenance Matrix\n`;
    md += `| Domain | Source Instrument | Classification | Reliability |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    md += `| Surface Topography | Mars Global Surveyor (MGS) MOLA | [OBSERVED] | 100% Calibrated Orbit |\n`;
    md += `| Global Color Imagery | Viking Orbiter VIS Camera | [OBSERVED] | True-Color Mosaic |\n`;
    md += `| Thermal Surface Inertia | Mars Odyssey THEMIS IR | [OBSERVED] | Rock vs Dust Discriminating |\n`;
    md += `| Surface Climatology | Perseverance MEDA / Curiosity REMS | [HISTORICAL] | Empirical In-Situ Logs |\n`;
    md += `| Planetary Geodesy | IAU 2000 Mars Constants (R=3389.5km) | [DERIVED] | Spherical Trigonometry |\n`;
    md += `| Radiation & Bioenergetics | MSL RAD Detector & Margaria-Minetti Model | [SIMULATED] | 0.38g Human Suited Math |\n\n`;

    md += `## 5. Contingency Flight Rules & Abort Limits\n`;
    md += `1. **EVA-FR-01 (Walkback Perimeter):** Distance to primary pressurized refuge must not exceed 5.0 km radius.\n`;
    md += `2. **EVA-FR-02 (Slope Hazard):** Traversing slopes > 15° requires CapCom clearance. Slopes > 25° are strictly prohibited.\n`;
    md += `3. **EVA-FR-03 (Solar Proton Event):** Immediate traverse abort required within 25 minutes of SPE telemetry alert.\n`;
    md += `4. **EVA-FR-04 (Dust Storm Inflow):** Ambient dust opacity (tau) > 1.8 grounds rover and engages emergency homing transponder.\n\n`;

    md += `## 6. Official Sign-Off & Flight Clearance\n`;
    md += `- **Lead Astronaut (EVA-1):** _____________________ [APPROVED]\n`;
    md += `- **CapCom (JPL / Houston):** _____________________ [CLEARED]\n`;
    md += `- **Flight Director:** _____________________ [DISPATCHED]\n`;

    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) setFlightPlanOpen(false);
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono text-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel-solid w-full max-w-4xl max-h-[92vh] rounded-2xl border-2 border-mars-500/60 bg-space-950 shadow-2xl flex flex-col overflow-hidden text-primary relative z-10 print:m-0 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black print:max-h-none print:w-full print:h-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-space-800 bg-space-900/60 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-display font-bold text-white text-xs border border-white/40 shadow-sm">
              NASA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-widest uppercase">
                  OFFICIAL NASA EVA FLIGHT PLAN & BRIEF
                </h2>
                <ProvenanceBadge type="NASA_SPEC" size="xs" detail="Flight Rating" />
              </div>
              <p className="text-[10px] text-space-400">
                DOCUMENT CODE: JPL-EVA-2026-MARS • SOL {currentSol} • EXPEDITION CLEARANCE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border ${
                copied 
                  ? 'bg-green-600 text-white border-green-500' 
                  : 'bg-space-800 hover:bg-space-700 text-space-200 border-space-700'
              }`}
              title="Copy Complete Flight Brief as Markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Brief!' : 'Copy Brief (MD)'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-space-800 hover:bg-space-700 text-white rounded-lg flex items-center gap-1.5 transition-colors border border-space-700"
              title="Print Official Document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Brief</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 bg-mars-600 hover:bg-mars-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-mars-600/30 transition-all"
              title="Download JSON for Rover Navigation Computer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => setFlightPlanOpen(false)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg transition-all border border-white/40 cursor-pointer ml-1"
              title="Close Flight Plan (ESC)"
            >
              <X className="w-4 h-4" />
              <span>← BACK (ESC)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Plan Body */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6 print:p-0 print:space-y-4 print:text-black">
          {/* Printable Header (Visible only in Print / PDF export) */}
          <div className="hidden print:block border-b-2 border-black pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold tracking-widest uppercase">NATIONAL AERONAUTICS AND SPACE ADMINISTRATION</h1>
                <h2 className="text-lg font-semibold mt-1">HUMAN MARSWALK EXPLORATION TRAVERSE BRIEFING (EVA-2026)</h2>
                <p className="text-sm font-mono text-gray-700">MISSION SOL: {currentSol} | SERIAL: JPL-EVA-2026-MARS | DSN REF: MARSWAY-01</p>
              </div>
              <div className="border-2 border-black px-3 py-1 text-center font-bold text-xs uppercase">
                OFFICIAL FLIGHT DISPATCH
              </div>
            </div>
          </div>

          {/* Mission Executive Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-space-900/50 p-4 rounded-xl border border-space-800 print:bg-gray-100 print:border-gray-400 print:text-black">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-space-400 uppercase block print:text-gray-600">TOTAL DISTANCE</span>
                <ProvenanceBadge type="DERIVED" size="xs" detail="IAU Geodesy" />
              </div>
              <span className="text-base font-bold text-white print:text-black">{totalDist.toFixed(2)} km</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-space-400 uppercase block print:text-gray-600">ESTIMATED DURATION</span>
                <ProvenanceBadge type="SIMULATED" size="xs" detail="0.38g Walk" />
              </div>
              <span className="text-base font-bold text-mars-400 print:text-black">{evaHours.toFixed(1)} hrs</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-space-400 uppercase block print:text-gray-600">WAYPOINTS COUNT</span>
              </div>
              <span className="text-base font-bold text-cyan-400 print:text-black">{waypoints?.length || 0} Stations</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-space-400 uppercase block print:text-gray-600">MAX TERRAIN SLOPE</span>
                <ProvenanceBadge type="OBSERVED" size="xs" detail="MOLA DEM" />
              </div>
              <span className="text-base font-bold text-green-400 print:text-black">{stats?.maxSlope?.toFixed(1) || 0}°</span>
            </div>
          </div>

          {/* Flight Rules & Contingency Abort Limits */}
          <div className="bg-space-900/40 p-4 rounded-xl border border-amber-500/30 space-y-2 print:border-gray-400 print:bg-white print:text-black">
            <h3 className="font-bold text-amber-400 flex items-center justify-between text-xs uppercase tracking-wider print:text-black">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 print:text-black" />
                <span>NASA Flight Rules & Contingency Abort Matrix</span>
              </span>
              <ProvenanceBadge type="NASA_SPEC" size="xs" detail="NASA-STD-3001" />
            </h3>
            <ul className="space-y-1.5 text-[11px] text-space-300 print:text-black">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold print:text-black">FR-01:</span>
                <span><strong>Walkback Limit:</strong> Distance to primary pressurized shelter must not exceed 5.0 km radius under any operational conditions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold print:text-black">FR-02:</span>
                <span><strong>Slope Abort:</strong> Slopes &gt; 15° require tether anchors. Any slope &gt; 25° is designated an absolute no-go traverse zone.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold print:text-black">FR-03:</span>
                <span><strong>Environmental Hazard:</strong> Immediate abort required if atmospheric dust opacity exceeds τ 1.8 or UV index spikes above 14.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold print:text-black">FR-04:</span>
                <span><strong>Solar Particle Alert:</strong> Ground teams must seek regolith-shielded cavern within 25 minutes of SPE notification.</span>
              </li>
            </ul>
          </div>

          {/* Consumables Budget Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider print:text-black">
                Life Support & Consumables Allocation (1 Astronaut)
              </h3>
              <ProvenanceBadge type="SIMULATED" size="xs" detail="Margaria-Minetti Model" />
            </div>
            <div className="grid grid-cols-3 gap-3 print:border print:border-black">
              <div className="p-3 bg-space-900/60 rounded-xl border border-space-800 print:bg-white print:border-r print:border-black">
                <span className="text-space-400 text-[10px] block print:text-gray-600">O₂ REQUIREMENTS</span>
                <span className="text-lg font-bold text-cyan-400 font-mono print:text-black">{o2.totalKg} kg</span>
                <span className="text-[10px] text-space-500 block print:text-gray-600">({o2.totalLiters} L at STP)</span>
              </div>
              <div className="p-3 bg-space-900/60 rounded-xl border border-space-800 print:bg-white print:border-r print:border-black">
                <span className="text-space-400 text-[10px] block print:text-gray-600">SUIT DRINKING WATER</span>
                <span className="text-lg font-bold text-blue-400 font-mono print:text-black">{h2o.totalLiters} L</span>
                <span className="text-[10px] text-space-500 block print:text-gray-600">Drink loop nominal</span>
              </div>
              <div className="p-3 bg-space-900/60 rounded-xl border border-space-800 print:bg-white">
                <span className="text-space-400 text-[10px] block print:text-gray-600">SUIT POWER / HEATING</span>
                <span className="text-lg font-bold text-yellow-400 font-mono print:text-black">{pwr.energyKWh} kWh</span>
                <span className="text-[10px] text-space-500 block print:text-gray-600">({pwr.powerWatts} W draw)</span>
              </div>
            </div>
          </div>

          {/* Waypoints Sequence Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider print:text-black">
              Traverse Waypoints Manifest
            </h3>
            <div className="overflow-x-auto rounded-xl border border-space-800 print:border-black">
              <table className="w-full text-left border-collapse text-[11px] print:text-black">
                <thead>
                  <tr className="bg-space-900/80 border-b border-space-800 text-space-400 print:bg-gray-200 print:border-black print:text-black">
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Waypoint Designation</th>
                    <th className="p-2.5">Latitude</th>
                    <th className="p-2.5">Longitude</th>
                    <th className="p-2.5">Elevation</th>
                    <th className="p-2.5">Traverse Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-space-800/60 font-mono print:divide-black">
                  {(waypoints || []).map((wp, i) => (
                    <tr key={wp.id} className="hover:bg-space-800/30 print:border-b print:border-gray-300">
                      <td className="p-2.5 text-mars-400 font-bold print:text-black">{i + 1}</td>
                      <td className="p-2.5 text-white font-sans font-medium print:text-black">{wp.name}</td>
                      <td className="p-2.5 text-space-300 print:text-black">{wp.lat.toFixed(4)}°</td>
                      <td className="p-2.5 text-space-300 print:text-black">{(wp.lon !== undefined ? wp.lon : wp.lng || 0).toFixed(4)}°</td>
                      <td className="p-2.5 text-space-300 print:text-black">{wp.elevation ? wp.elevation.toFixed(0) : 0} m</td>
                      <td className="p-2.5 text-space-400 font-sans text-[10px] print:text-black">{wp.reason || 'Nominal traverse station'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scientific Data Provenance Summary Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider print:text-black">
              Scientific Data Provenance & Source Calibration
            </h3>
            <div className="overflow-x-auto rounded-xl border border-space-800 print:border-black">
              <table className="w-full text-left border-collapse text-[10px] font-mono print:text-black">
                <thead>
                  <tr className="bg-space-900/70 border-b border-space-800 text-space-400 print:bg-gray-100 print:border-black print:text-black">
                    <th className="p-2">Data Dimension</th>
                    <th className="p-2">Spacecraft / Instrument Source</th>
                    <th className="p-2">Classification</th>
                    <th className="p-2">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-space-800/50 print:divide-black">
                  <tr>
                    <td className="p-2 font-bold text-white print:text-black">Martian Elevation</td>
                    <td className="p-2 text-space-300 print:text-black">Mars Global Surveyor (MGS) MOLA Altimeter</td>
                    <td className="p-2"><ProvenanceBadge type="OBSERVED" size="xs" detail="Laser DEM" /></td>
                    <td className="p-2 text-emerald-400 print:text-black">PDS Ground Truth</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-white print:text-black">Cartographic Imagery</td>
                    <td className="p-2 text-space-300 print:text-black">NASA Viking 1/2 Orbiter VIS Mosaic (232m/px)</td>
                    <td className="p-2"><ProvenanceBadge type="OBSERVED" size="xs" detail="NASA Trek" /></td>
                    <td className="p-2 text-emerald-400 print:text-black">USGS Astrogeology</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-white print:text-black">Thermal Inertia (Rock vs Dust)</td>
                    <td className="p-2 text-space-300 print:text-black">Mars Odyssey THEMIS Thermal Infrared</td>
                    <td className="p-2"><ProvenanceBadge type="OBSERVED" size="xs" detail="Day/Night IR" /></td>
                    <td className="p-2 text-emerald-400 print:text-black">ASU Mars Space Flight</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-white print:text-black">Surface Atmosphere</td>
                    <td className="p-2 text-space-300 print:text-black">Perseverance MEDA & Curiosity REMS</td>
                    <td className="p-2"><ProvenanceBadge type="HISTORICAL" size="xs" detail="In-Situ Archives" /></td>
                    <td className="p-2 text-cyan-400 print:text-black">Multi-Year Climatology</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-white print:text-black">Cosmic Radiation Dose</td>
                    <td className="p-2 text-space-300 print:text-black">Curiosity RAD Radiation Assessment Detector</td>
                    <td className="p-2"><ProvenanceBadge type="SIMULATED" size="xs" detail="0.67 mSv/d GCR" /></td>
                    <td className="p-2 text-amber-400 print:text-black">Southwest Research Inst</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Cache Inventory */}
          <div className="space-y-2">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between print:text-black">
              <span>Sealed Sample Tubes In Custody</span>
              <span className="text-mars-400 font-mono text-[10px] print:text-black">{collectedSamples?.length || 0} Tubes</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(collectedSamples || []).map((s) => (
                <div key={s.id} className="p-2.5 bg-space-900/50 rounded-lg border border-space-800 flex items-center justify-between print:bg-white print:border-gray-400 print:text-black">
                  <div>
                    <span className="font-bold text-white text-[11px] block print:text-black">{s.name}</span>
                    <span className="text-[10px] text-space-400 print:text-gray-600">{s.rockType} • Sol {s.sol}</span>
                  </div>
                  <span className="text-[10px] font-bold text-green-400 bg-green-950/60 px-2 py-0.5 rounded border border-green-500/30 print:text-black print:border-black">
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Sign-Off Authorization (Visible in UI and Print) */}
          <div className="p-4 rounded-xl border border-space-800 bg-space-900/40 print:border-black print:bg-white print:text-black">
            <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-white print:text-black">
              Official NASA Mission Clearance & Sign-Off
            </h4>
            <div className="grid grid-cols-3 gap-6 text-[10px]">
              <div className="border-t border-space-700 pt-2 print:border-black">
                <span className="text-space-400 block uppercase print:text-gray-600">LEAD ASTRONAUT (EVA-1)</span>
                <span className="font-bold text-white font-sans text-xs print:text-black">Cmdr. A. Vance</span>
                <span className="text-emerald-400 block font-mono print:text-black">✓ SUIT GO NOMINAL</span>
              </div>
              <div className="border-t border-space-700 pt-2 print:border-black">
                <span className="text-space-400 block uppercase print:text-gray-600">CAPCOM (HOUSTON MCC)</span>
                <span className="font-bold text-white font-sans text-xs print:text-black">Dr. M. Chen</span>
                <span className="text-emerald-400 block font-mono print:text-black">✓ TRAVERSE CLEARED</span>
              </div>
              <div className="border-t border-space-700 pt-2 print:border-black">
                <span className="text-space-400 block uppercase print:text-gray-600">FLIGHT DIRECTOR</span>
                <span className="font-bold text-white font-sans text-xs print:text-black">J. R. Holloway</span>
                <span className="text-cyan-400 block font-mono print:text-black">✓ DISPATCH AUTHORIZED</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
