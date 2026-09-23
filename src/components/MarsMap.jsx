import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, CircleMarker, Popup, Polyline, Circle, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useMapStore from '../store/useMapStore';
import { marsLayers } from '../data/marsLayers';
import { getElevation } from '../utils/elevationService';
import { marsDistance, calculateSlope } from '../utils/marsUtils';
import CoordinateDisplay from './CoordinateDisplay';
import POIMarkers from './POIMarkers';
import { marsAudio } from '../utils/audioSynthesizer';
import { Shield, Play, Pause, Square, Ruler, AlertTriangle, Battery, Gauge, Compass, Globe, Crosshair, RotateCcw, Video, VideoOff } from 'lucide-react';

// Custom Directional High-Visibility Rover Div Icon with Expanding Radar Pulse Rings & Floating HUD
const createRoverIcon = (heading = 0, isDriving = false, speed = 14.5) => {
  return L.divIcon({
    className: 'custom-rover-icon',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        ${isDriving ? `
          <div class="rover-radar-ring-1"></div>
          <div class="rover-radar-ring-2"></div>
        ` : ''}

        <!-- Rotating Vehicle Container aligned to heading -->
        <div style="transform: rotate(${Math.round(heading)}deg); transition: transform 0.15s ease-out; position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          ${isDriving ? `
            <!-- Directional Forward Light Cone -->
            <div class="rover-headlight-cone"></div>
          ` : ''}

          <!-- Rover Body -->
          <div style="
            background: linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 19px;
            border: 2.5px solid #ffffff;
            box-shadow: 0 0 20px ${isDriving ? 'rgba(56,189,248,0.95)' : 'rgba(234,88,12,0.9)'}, inset 0 0 8px rgba(0,0,0,0.4);
            z-index: 10;
          ">
            🚜
          </div>

          <!-- Forward Direction Arrow Pointer -->
          <div style="
            position: absolute;
            top: -7px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 12px solid #38bdf8;
            filter: drop-shadow(0 0 5px #38bdf8);
            z-index: 12;
          "></div>
        </div>

        <!-- Floating High-Visibility HUD Label Attached to Vehicle (glides with rover) -->
        <div style="
          position: absolute;
          bottom: -22px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          background: rgba(10, 15, 29, 0.92);
          border: 1.5px solid ${isDriving ? '#06b6d4' : '#f97316'};
          color: ${isDriving ? '#38bdf8' : '#fed7aa'};
          font-family: monospace;
          font-size: 9px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.8), 0 0 6px ${isDriving ? 'rgba(6,182,212,0.6)' : 'rgba(249,115,22,0.4)'};
          letter-spacing: 0.5px;
          z-index: 20;
          pointer-events: none;
        ">
          ${isDriving ? `▶ ${speed.toFixed(1)} km/h` : 'STANDBY'}
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
};

const MapEvents = () => {
  const setCursorPosition = useMapStore((s) => s.setCursorPosition);
  const isPlacingWaypoint = useMapStore((s) => s.isPlacingWaypoint);
  const addWaypoint = useMapStore((s) => s.addWaypoint);
  const isRulerActive = useMapStore((s) => s.isRulerActive);
  const addRulerPoint = useMapStore((s) => s.addRulerPoint);
  const clearSelection = useMapStore((s) => s.clearSelection);

  useMapEvents({
    mousemove(e) {
      setCursorPosition({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
    click(e) {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      const elevation = getElevation(lat, lon);

      if (isPlacingWaypoint) {
        addWaypoint({ lat, lon, elevation });
        marsAudio.playQuindarTone(true);
      } else if (isRulerActive) {
        addRulerPoint({ lat, lon, elevation });
        marsAudio.playQuindarTone(true);
      } else {
        clearSelection();
      }
    },
  });
  return null;
};

// Controls camera view smoothly when mapCenter or mapZoom changes in store
const MapViewController = () => {
  const map = useMap();
  const mapCenter = useMapStore((s) => s.mapCenter);
  const mapZoom = useMapStore((s) => s.mapZoom);

  useEffect(() => {
    if (mapCenter && Array.isArray(mapCenter) && mapCenter.length === 2) {
      const targetZoom = Math.min(Math.max(typeof mapZoom === 'number' ? mapZoom : 2, 0), 12);
      map.flyTo(mapCenter, targetZoom, { duration: 1.2 });
    }
  }, [mapCenter, mapZoom, map]);

  return null;
};

// Rover Driver Component running inside MapContainer
const RoverSimulator = ({ waypoints }) => {
  const map = useMap();
  const { 
    isRoverDriving, 
    setRoverDriving, 
    roverProgress, 
    setRoverProgress,
    roverBatterySoC,
    setRoverBatterySoC,
    evaCurrentWaypointIndex,
    setEVACurrentWaypointIndex,
    driveTargetWaypointId,
    setDriveTargetWaypointId,
    camFollow,
  } = useMapStore();

  const [currentCoord, setCurrentCoord] = useState(null);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(14.5);
  const [currentSlope, setCurrentSlope] = useState(0);
  const [currentSegIdx, setCurrentSegIdx] = useState(0);

  const progRef = useRef(roverProgress || 0);
  const lastPanTime = useRef(0);
  const lastStoreSync = useRef(0);
  const batteryRef = useRef(roverBatterySoC || 96);

  // Precompute cumulative physical distances along route for constant medium speed
  const routeDistances = useMemo(() => {
    if (!waypoints || waypoints.length < 2) return { cumDists: [0], totalDistKm: 0 };
    const cumDists = [0];
    let sum = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const lon1 = waypoints[i].lon !== undefined ? waypoints[i].lon : (waypoints[i].lng !== undefined ? waypoints[i].lng : 0);
      const lon2 = waypoints[i+1].lon !== undefined ? waypoints[i+1].lon : (waypoints[i+1].lng !== undefined ? waypoints[i+1].lng : 0);
      const d = Math.max(0.01, marsDistance(waypoints[i].lat, lon1, waypoints[i+1].lat, lon2));
      sum += d;
      cumDists.push(sum);
    }
    return { cumDists, totalDistKm: sum };
  }, [waypoints]);

  // Target spot calculation: if driveTargetWaypointId is set, drive to that specific station!
  const targetIndex = (driveTargetWaypointId && waypoints) 
    ? waypoints.findIndex(w => w.id === driveTargetWaypointId) 
    : -1;

  const targetDistKm = (targetIndex > 0 && routeDistances.cumDists[targetIndex]) 
    ? routeDistances.cumDists[targetIndex] 
    : routeDistances.totalDistKm;

  // Active target waypoint for popup & telemetry
  const targetWaypoint = targetIndex >= 0 ? waypoints[targetIndex] : (waypoints ? waypoints[waypoints.length - 1] : null);

  // Dynamic Traveled Path behind rover wheels (illuminated cyan breadcrumb trail)
  const traveledPositions = useMemo(() => {
    if (!waypoints || waypoints.length < 2 || !currentCoord) return [];
    const pts = [];
    for (let i = 0; i <= currentSegIdx && i < waypoints.length; i++) {
      const lon = waypoints[i].lon !== undefined ? waypoints[i].lon : (waypoints[i].lng !== undefined ? waypoints[i].lng : 0);
      pts.push([waypoints[i].lat, lon]);
    }
    pts.push(currentCoord);
    return pts;
  }, [waypoints, currentSegIdx, currentCoord]);

  // Sync initial coordinate when waypoints load or change, or progress reset
  useEffect(() => {
    if (!waypoints || waypoints.length < 2) return;
    const startLon = waypoints[0].lon !== undefined ? waypoints[0].lon : (waypoints[0].lng !== undefined ? waypoints[0].lng : 0);
    if (!currentCoord || roverProgress === 0) {
      setCurrentCoord([waypoints[0].lat, startLon]);
      progRef.current = roverProgress || 0;
      setCurrentSegIdx(0);
    }
  }, [waypoints, roverProgress]);

  // Keep progRef in sync when store progress changes externally
  useEffect(() => {
    if (!isRoverDriving || roverProgress === 0) {
      progRef.current = roverProgress || 0;
    }
  }, [roverProgress, isRoverDriving]);

  useEffect(() => {
    let animId;
    if (!isRoverDriving || !waypoints || waypoints.length < 2) return;

    const totalDistKm = routeDistances.totalDistKm;
    if (totalDistKm <= 0) return;

    // Track traveled distance directly in km for constant medium traversal speed
    let currentDistKm = progRef.current * totalDistKm;

    // If rover was already at or beyond target, restart from beginning
    if (progRef.current >= 0.99 || (targetDistKm > 0.1 && currentDistKm >= targetDistKm - 0.05)) {
      currentDistKm = 0;
      progRef.current = 0;
      setRoverProgress(0);
      setCurrentSegIdx(0);
    }

    let lastTime = performance.now();

    // Trip distance: if targeted to a waypoint, the segment distance to target; otherwise total route
    const tripDistKm = (targetIndex > 0 && targetDistKm > 0) ? targetDistKm : totalDistKm;

    // Balanced, highly perceptible pacing:
    // - Very short manual points (< 5 km): ~6 to 8 seconds total traverse (clearly visible movement!)
    // - Medium routes (5-30 km): ~10 to 14 seconds
    // - Long routes (30-200 km): ~16 to 22 seconds
    const traverseDurationSec = Math.max(6, Math.min(22, 5.5 + Math.sqrt(tripDistKm) * 1.3));
    const kmPerSec = tripDistKm / traverseDurationSec;

    const drive = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.08); // delta time clamped
      lastTime = now;

      // Traversal step proportional to physical distance
      currentDistKm += kmPerSec * dt;

      // Arrival check for target (either specific station or full destination)
      if (currentDistKm >= targetDistKm) {
        currentDistKm = targetDistKm;
        const finalProg = totalDistKm > 0 ? (targetDistKm / totalDistKm) : 1.0;
        progRef.current = finalProg;
        setRoverProgress(finalProg);
        setRoverDriving(false);
        marsAudio.playQuindarTone(false);

        // Snap to exact target coordinates
        const arrivalWp = targetIndex >= 0 ? waypoints[targetIndex] : waypoints[waypoints.length - 1];
        if (arrivalWp) {
          const arrLon = arrivalWp.lon !== undefined ? arrivalWp.lon : (arrivalWp.lng !== undefined ? arrivalWp.lng : 0);
          setCurrentCoord([arrivalWp.lat, arrLon]);
        }
        return;
      }

      // Find exact segment from current physical distance
      let segIdx = 0;
      while (
        segIdx < routeDistances.cumDists.length - 2 && 
        currentDistKm > routeDistances.cumDists[segIdx + 1]
      ) {
        segIdx++;
      }

      const segStartDist = routeDistances.cumDists[segIdx];
      const segEndDist = routeDistances.cumDists[segIdx + 1];
      const segLength = Math.max(0.0001, segEndDist - segStartDist);
      const segFraction = Math.max(0, Math.min(1, (currentDistKm - segStartDist) / segLength));

      const wpA = waypoints[segIdx];
      const wpB = waypoints[segIdx + 1];

      if (wpA && wpB) {
        const lonA = wpA.lon !== undefined ? wpA.lon : (wpA.lng !== undefined ? wpA.lng : 0);
        const lonB = wpB.lon !== undefined ? wpB.lon : (wpB.lng !== undefined ? wpB.lng : 0);
        const lat = wpA.lat + (wpB.lat - wpA.lat) * segFraction;
        const lon = lonA + (lonB - lonA) * segFraction;

        setCurrentCoord([lat, lon]);
        setCurrentSegIdx(segIdx);

        const curProg = currentDistKm / totalDistKm;
        progRef.current = curProg;

        // Dynamic vehicle orientation heading
        const dLat = wpB.lat - wpA.lat;
        const dLon = lonB - lonA;
        const heading = ((Math.atan2(dLon, dLat) * 180 / Math.PI) + 360) % 360;
        setCurrentHeading(heading);

        // Slope calculation for telemetry
        const segDistKm = marsDistance(wpA.lat, lonA, wpB.lat, lonB);
        const slope = calculateSlope(wpA.elevation || 0, wpB.elevation || 0, segDistKm * 1000);
        setCurrentSlope(slope);

        // Consistent medium steady speed readout (~14.5 km/h nominal)
        const mediumSpeed = Math.max(12.0, 15.0 - Math.abs(slope) * 0.12);
        setCurrentSpeed(mediumSpeed);

        // Battery consumption
        if (slope < -2) {
          batteryRef.current = Math.min(100, batteryRef.current + 0.003);
        } else {
          batteryRef.current = Math.max(10, batteryRef.current - 0.004);
        }

        // Keep active waypoint synced as rover physically crosses segments
        if (evaCurrentWaypointIndex !== segIdx && setEVACurrentWaypointIndex) {
          setEVACurrentWaypointIndex(segIdx);
        }

        // Throttled sync to Zustand store (every 120ms)
        if (now - lastStoreSync.current > 120) {
          lastStoreSync.current = now;
          setRoverProgress(curProg);
          setRoverBatterySoC(Math.round(batteryRef.current));
        }

        // Smooth camera follow (actively tracks rover when camFollow is on)
        if (camFollow && now - lastPanTime.current > 650) {
          lastPanTime.current = now;
          map.panTo([lat, lon], { animate: true, duration: 0.55 });
        } else if (!camFollow && now - lastPanTime.current > 1200) {
          try {
            const bounds = map.getBounds();
            if (bounds && !bounds.contains([lat, lon])) {
              lastPanTime.current = now;
              map.panTo([lat, lon], { animate: true, duration: 0.6 });
            }
          } catch (e) {
            // Guard against unmounted/uninitialized map bounds
          }
        }
      }

      animId = requestAnimationFrame(drive);
    };

    animId = requestAnimationFrame(drive);
    return () => {
      cancelAnimationFrame(animId);
      // Sync progress when paused
      if (progRef.current > 0) {
        setRoverProgress(progRef.current);
      }
    };
  }, [isRoverDriving, waypoints, targetDistKm, targetIndex, routeDistances, map, camFollow, evaCurrentWaypointIndex, setEVACurrentWaypointIndex, setRoverProgress, setRoverDriving, setRoverBatterySoC]);

  if (!currentCoord || !waypoints || waypoints.length < 2) return null;

  return (
    <>
      {/* Dynamic Traveled Track: Glowing Cyan Trail Laid Down Live Behind Moving Wheels */}
      {traveledPositions.length > 1 && (
        <>
          <Polyline
            positions={traveledPositions}
            pathOptions={{
              color: '#06b6d4',
              weight: 8,
              opacity: 0.45,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
          <Polyline
            positions={traveledPositions}
            pathOptions={{
              color: '#38bdf8',
              weight: 4.5,
              opacity: 0.98,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </>
      )}

      <Marker position={currentCoord} icon={createRoverIcon(currentHeading, isRoverDriving, currentSpeed)}>
        <Popup>
          <div className="font-mono text-xs p-1 min-w-[200px] text-white">
            <div className="font-bold text-amber-400 border-b border-white/10 pb-1.5 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">🚜 PER-01 ROVER</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800 font-sans">
                {isRoverDriving ? 'DRIVING' : 'STANDBY'}
              </span>
            </div>
            <div className="space-y-1 text-space-300 text-[11px]">
              <div className="flex justify-between"><span className="text-space-400">Target:</span> <strong className="text-white truncate max-w-[120px]">{targetWaypoint?.name || 'Objective'}</strong></div>
              <div className="flex justify-between"><span className="text-space-400">Speed:</span> <strong className="text-cyan-300">{currentSpeed.toFixed(1)} km/h</strong></div>
              <div className="flex justify-between"><span className="text-space-400">Terrain Slope:</span> <strong className="text-white">{currentSlope.toFixed(1)}°</strong></div>
              <div className="flex justify-between"><span className="text-space-400">Battery SoC:</span> <strong className="text-emerald-400">{Math.round(batteryRef.current)}%</strong></div>
              <div className="flex justify-between"><span className="text-space-400">Progress:</span> <strong className="text-amber-400">{(progRef.current * 100).toFixed(0)}%</strong></div>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
};

const MarsMap = () => {
  const activeLayers = useMapStore((s) => s.activeLayers);
  const layerOpacity = useMapStore((s) => s.layerOpacity);
  const waypoints = useMapStore((s) => s.waypoints);
  const isPlacingWaypoint = useMapStore((s) => s.isPlacingWaypoint);
  const selectedWaypointId = useMapStore((s) => s.selectedWaypointId);
  const setSelectedWaypoint = useMapStore((s) => s.setSelectedWaypoint);

  // New interactive states
  const showWalkbackLimits = useMapStore((s) => s.showWalkbackLimits);
  const toggleWalkbackLimits = useMapStore((s) => s.toggleWalkbackLimits);
  const isRoverDriving = useMapStore((s) => s.isRoverDriving);
  const setRoverDriving = useMapStore((s) => s.setRoverDriving);
  const roverProgress = useMapStore((s) => s.roverProgress);
  const setRoverProgress = useMapStore((s) => s.setRoverProgress);
  const roverBatterySoC = useMapStore((s) => s.roverBatterySoC);
  const driveTargetWaypointId = useMapStore((s) => s.driveTargetWaypointId);
  const setDriveTargetWaypointId = useMapStore((s) => s.setDriveTargetWaypointId);
  const camFollow = useMapStore((s) => s.camFollow);
  const setCamFollow = useMapStore((s) => s.setCamFollow);
  const isRulerActive = useMapStore((s) => s.isRulerActive);
  const setRulerActive = useMapStore((s) => s.setRulerActive);
  const rulerPoints = useMapStore((s) => s.rulerPoints);
  const clearRuler = useMapStore((s) => s.clearRuler);
  const setMapCenter = useMapStore((s) => s.setMapCenter);
  const setMapZoom = useMapStore((s) => s.setMapZoom);
  const activeContingency = useMapStore((s) => s.activeContingency);
  const contingencyDetails = useMapStore((s) => s.contingencyDetails);
  const undoLastPoint = useMapStore((s) => s.undoLastPoint);
  const removeWaypoint = useMapStore((s) => s.removeWaypoint);
  const clearSelection = useMapStore((s) => s.clearSelection);
  const setPlacingWaypoint = useMapStore((s) => s.setPlacingWaypoint);

  // Global Keyboard Shortcuts (Ctrl+Z Undo, Escape Cancel, Backspace/Delete Delete Selected)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoLastPoint();
        marsAudio.playQuindarTone(false);
      } else if (e.key === 'Escape') {
        if (isPlacingWaypoint) setPlacingWaypoint(false);
        if (isRulerActive) setRulerActive(false);
        clearSelection();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedWaypointId) {
          removeWaypoint(selectedWaypointId);
          marsAudio.playQuindarTone(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoLastPoint, isPlacingWaypoint, isRulerActive, selectedWaypointId, removeWaypoint, setPlacingWaypoint, setRulerActive, clearSelection]);

  const activeLayerConfigs = activeLayers
    .map((id) => marsLayers.find((l) => l.id === id))
    .filter(Boolean);

  const polylinePositions = waypoints.map((wp) => [wp.lat, wp.lon]);

  // Waypoint color gradient
  const waypointColor = (index) => {
    if (waypoints.length <= 1) return '#22c55e';
    const t = index / (waypoints.length - 1);
    const r = Math.round(34 + t * (239 - 34));
    const g = Math.round(197 + t * (68 - 197));
    const b = Math.round(94 + t * (68 - 94));
    return `rgb(${r},${g},${b})`;
  };

  // Base waypoint for NASA Walkback Limit circles (2 km / 5 km)
  // Mars 1 degree latitude ~ 59.16 km -> 2 km is approx 0.0338 degrees
  const baseWP = waypoints && waypoints.length > 0 ? waypoints[0] : null;

  // Ruler calculations
  let rulerDistKm = 0;
  let rulerElevDelta = 0;
  let rulerSlopeDeg = 0;
  if (rulerPoints && rulerPoints.length === 2) {
    rulerDistKm = marsDistance(rulerPoints[0].lat, rulerPoints[0].lon, rulerPoints[1].lat, rulerPoints[1].lon);
    rulerElevDelta = (rulerPoints[1].elevation || 0) - (rulerPoints[0].elevation || 0);
    rulerSlopeDeg = calculateSlope(rulerPoints[0].elevation || 0, rulerPoints[1].elevation || 0, rulerDistKm * 1000);
  }

  return (
    <div className={`w-full h-full relative ${isPlacingWaypoint || isRulerActive ? 'crosshair-cursor' : ''}`}>
      <MapContainer
        center={[0, 0]}
        zoom={2}
        minZoom={0}
        maxZoom={12}
        crs={L.CRS.EPSG4326}
        style={{ height: '100%', width: '100%', background: '#090b14' }}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={0.6}
        worldCopyJump={false}
      >
        <MapEvents />
        <MapViewController />

        {/* NASA Trek WMTS Tile Layers */}
        {activeLayerConfigs.map((layer) => (
          <TileLayer
            key={layer.id}
            url={layer.url}
            opacity={layerOpacity[layer.id] !== undefined ? layerOpacity[layer.id] : layer.defaultOpacity}
            attribution={layer.attribution}
            noWrap={true}
            bounds={[[-90, -180], [90, 180]]}
            minZoom={0}
            maxNativeZoom={layer.maxZoom}
            maxZoom={12}
          />
        ))}

        {/* NASA Walkback Limit Circles (2 km Safe / 5 km Abort) */}
        {showWalkbackLimits && baseWP && (
          <>
            <Circle
              center={[baseWP.lat, baseWP.lon]}
              radius={2000}
              pathOptions={{
                color: '#22c55e',
                fillColor: '#22c55e',
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '4, 4'
              }}
            >
              <Popup>
                <div className="font-mono text-xs">
                  <strong>NASA 2.0 km Walkback Zone</strong>
                  <p>Safe astronaut return radius on primary suit O₂ reserves.</p>
                </div>
              </Popup>
            </Circle>

            <Circle
              center={[baseWP.lat, baseWP.lon]}
              radius={activeContingency === 'o2_leak' ? 1800 : 5000}
              pathOptions={{
                color: activeContingency === 'o2_leak' ? '#ef4444' : '#f59e0b',
                fillColor: activeContingency === 'o2_leak' ? '#ef4444' : '#f59e0b',
                fillOpacity: activeContingency === 'o2_leak' ? 0.14 : 0.04,
                weight: activeContingency === 'o2_leak' ? 2.5 : 1.5,
                dashArray: '6, 6'
              }}
            >
              <Popup>
                <div className="font-mono text-xs">
                  <strong>{activeContingency === 'o2_leak' ? '⚠️ CONTRACTED 1.8 km Walkback Boundary' : 'NASA 5.0 km Hard Walkback Boundary'}</strong>
                  <p>{activeContingency === 'o2_leak' ? 'Secondary O2 Anomaly: Usable return perimeter contracted by 60%.' : 'Maximum authorized traverse perimeter from pressurized base.'}</p>
                </div>
              </Popup>
            </Circle>
          </>
        )}

        {/* POI Markers */}
        <POIMarkers />

        {/* Route Polyline */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: activeContingency ? '#ef4444' : '#f47050',
              weight: activeContingency ? 4.5 : 3.5,
              opacity: 0.95,
              dashArray: activeContingency ? '6, 4' : '8, 6',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Pulsating Target Reticle for Selected Waypoint */}
        {selectedWaypointId && (
          (() => {
            const selectedWp = waypoints.find(w => w.id === selectedWaypointId);
            if (!selectedWp) return null;
            return (
              <CircleMarker
                center={[selectedWp.lat, selectedWp.lon]}
                radius={16}
                pathOptions={{
                  color: '#38bdf8',
                  fillColor: '#38bdf8',
                  fillOpacity: 0.2,
                  weight: 2,
                  dashArray: '3, 3'
                }}
              />
            );
          })()
        )}

        {/* Waypoint Markers */}
        {waypoints.map((wp, i) => (
          <CircleMarker
            key={wp.id}
            center={[wp.lat, wp.lon]}
            radius={selectedWaypointId === wp.id ? 11 : 7}
            pathOptions={{
              color: selectedWaypointId === wp.id ? '#ffffff' : waypointColor(i),
              fillColor: waypointColor(i),
              fillOpacity: 0.92,
              weight: selectedWaypointId === wp.id ? 3.5 : 2,
            }}
            eventHandlers={{
              click: () => {
                setSelectedWaypoint(wp.id);
                marsAudio.playQuindarTone(true);
              },
            }}
          >
            <Popup>
              <div className="min-w-[190px] font-mono text-xs text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                  <h4 className="font-bold text-sm text-mars-300 font-sans">{wp.name}</h4>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
                    Station #{i + 1}
                  </span>
                </div>
                <div className="space-y-1 text-space-300 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-space-400">Coords:</span>
                    <span className="text-white font-mono">{wp.lat.toFixed(4)}°N, {wp.lon.toFixed(4)}°E</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-space-400">Elevation:</span>
                    <span className="text-amber-400 font-bold">{wp.elevation?.toLocaleString()} m</span>
                  </div>
                  {wp.reason && (
                    <p className="text-[10px] text-amber-200/90 italic mt-1 bg-amber-950/30 p-1.5 rounded border border-amber-500/20 font-sans">
                      "{wp.reason}"
                    </p>
                  )}
                </div>
                {i > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-white/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWaypoint(wp.id);
                        if (isRoverDriving && driveTargetWaypointId === wp.id) {
                          setRoverDriving(false);
                        } else {
                          let targetDist = 0;
                          let totalDist = 0;
                          for (let j = 1; j < waypoints.length; j++) {
                            const lon1 = waypoints[j-1].lon !== undefined ? waypoints[j-1].lon : (waypoints[j-1].lng !== undefined ? waypoints[j-1].lng : 0);
                            const lon2 = waypoints[j].lon !== undefined ? waypoints[j].lon : (waypoints[j].lng !== undefined ? waypoints[j].lng : 0);
                            const d = marsDistance(waypoints[j-1].lat, lon1, waypoints[j].lat, lon2);
                            totalDist += d;
                            if (j === i) targetDist = totalDist;
                          }
                          const curDist = (roverProgress || 0) * (totalDist || 1);
                          if (curDist >= targetDist - 0.05) {
                            setRoverProgress(0);
                          }
                          setDriveTargetWaypointId(wp.id);
                          setRoverDriving(true);
                        }
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-600 to-mars-600 hover:from-amber-500 hover:to-mars-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer border border-white/20"
                    >
                      {isRoverDriving && driveTargetWaypointId === wp.id ? (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>Pause Rover</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-white" />
                          <span>Drive to Station #{i + 1}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Ruler Measurement Line & Markers */}
        {rulerPoints.map((pt, i) => (
          <CircleMarker
            key={`ruler-${i}`}
            center={[pt.lat, pt.lon]}
            radius={6}
            pathOptions={{ color: '#eab308', fillColor: '#fde047', fillOpacity: 0.9 }}
          />
        ))}
        {rulerPoints.length === 2 && (
          <Polyline
            positions={rulerPoints.map(p => [p.lat, p.lon])}
            pathOptions={{ color: '#eab308', weight: 2.5, dashArray: '4, 4' }}
          />
        )}

        {/* Animated Driving Rover Simulator */}
        <RoverSimulator waypoints={waypoints} />
      </MapContainer>

      {/* FLOATING MAP TOOLBAR (Top Left) */}
      <div className="absolute top-3.5 left-3.5 z-[400] flex flex-wrap items-center gap-1.5 bg-[#0B0C10]/95 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/[0.06] shadow-hud-glass font-mono text-xs">
        {/* Quick Global Mars / Jezero Views */}
        <button
          onClick={() => {
            setMapCenter([0, 0]);
            setMapZoom(1);
          }}
          className="px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all border bg-space-900/80 text-space-300 hover:text-white hover:bg-space-850 border-white/[0.06] hover:border-mars-400/40"
          title="Fit whole Mars planet in view (Global Scale)"
        >
          <Globe className="w-3.5 h-3.5 text-mars-400" />
          <span className="hidden sm:inline">GLOBAL MARS</span>
        </button>

        <button
          onClick={() => {
            setMapCenter([18.4447, 77.4508]);
            setMapZoom(4);
          }}
          className="px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all border bg-space-900/80 text-space-300 hover:text-white hover:bg-space-850 border-white/[0.06] hover:border-cyber-cyan/40"
          title="Zoom to Jezero Crater (Perseverance Landing Site)"
        >
          <Crosshair className="w-3.5 h-3.5 text-cyber-cyan" />
          <span className="hidden sm:inline">JEZERO</span>
        </button>

        {/* Undo Last Point Button (active when waypoints or ruler points exist) */}
        {(waypoints.length > 0 || rulerPoints.length > 0) && (
          <button
            onClick={() => {
              undoLastPoint();
              marsAudio.playQuindarTone(false);
            }}
            className="px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border bg-amber-950/70 hover:bg-amber-900/90 text-amber-300 hover:text-amber-100 border-amber-500/50 shadow-md font-bold"
            title="Undo last placed point or measurement (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>UNDO {waypoints.length > 0 ? `(${waypoints.length})` : ''}</span>
          </button>
        )}

        {/* Drive Rover Button */}
        {waypoints && waypoints.length > 1 && (
          (() => {
            const targetIdx = driveTargetWaypointId 
              ? waypoints.findIndex(w => w.id === driveTargetWaypointId) 
              : -1;
            const isAtEnd = roverProgress >= 0.99;
            const isPausedMidway = !isRoverDriving && roverProgress > 0.01 && !isAtEnd;

            let driveLabel = targetIdx > 0 ? `DRIVE TO #${targetIdx + 1}` : 'DRIVE ALL';
            if (isRoverDriving) {
              driveLabel = targetIdx > 0 ? `DRIVING TO #${targetIdx + 1}` : 'PAUSE';
            } else if (isPausedMidway) {
              driveLabel = targetIdx > 0 ? `RESUME TO #${targetIdx + 1}` : `RESUME (${(roverProgress * 100).toFixed(0)}%)`;
            } else if (isAtEnd) {
              driveLabel = targetIdx > 0 ? `REPLAY TO #${targetIdx + 1}` : 'REPLAY ROUTE';
            }

            return (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (isRoverDriving) {
                      setRoverDriving(false);
                    } else {
                      if (isAtEnd) {
                        setRoverProgress(0);
                      }
                      setRoverDriving(true);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md border ${
                    isRoverDriving 
                      ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse border-amber-400' 
                      : isPausedMidway
                      ? 'bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white border-white/20'
                      : isAtEnd
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-white/20'
                      : 'bg-space-900/90 hover:bg-space-850 text-amber-400 border-amber-500/40'
                  }`}
                  title={
                    isRoverDriving 
                      ? 'Pause Rover Drive' 
                      : targetIdx > 0
                      ? `Simulate rover drive to Station #${targetIdx + 1}`
                      : 'Simulate rover traverse along entire route'
                  }
                >
                  {isRoverDriving ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{driveLabel}</span>
                </button>

                {/* If targeted to a specific station, allow one-click toggle to Drive All */}
                {targetIdx > 0 && (
                  <button
                    onClick={() => {
                      setDriveTargetWaypointId(null);
                      if (isAtEnd) setRoverProgress(0);
                      if (!isRoverDriving) setRoverDriving(true);
                    }}
                    className="px-2 py-1.5 rounded-lg bg-space-900/90 hover:bg-space-850 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-mono font-bold transition-colors cursor-pointer"
                    title="Switch to Drive Entire Route to Destination"
                  >
                    DRIVE ALL
                  </button>
                )}

                {/* Cam Follow / Tracking Toggle Button */}
                <button
                  onClick={() => setCamFollow(!camFollow)}
                  className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border font-bold cursor-pointer ${
                    camFollow
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-space-900/80 border-white/[0.08] text-space-400 hover:text-white'
                  }`}
                  title={camFollow ? 'Vehicle Tracking Active: Camera follows vehicle automatically' : 'Free Camera: Manual pan and zoom'}
                >
                  {camFollow ? <Video className="w-3.5 h-3.5 text-cyan-400" /> : <VideoOff className="w-3.5 h-3.5" />}
                  <span className="hidden md:inline">{camFollow ? 'TRACKING' : 'FREE CAM'}</span>
                </button>

                {roverProgress > 0.01 && !isRoverDriving && (
                  <button
                    onClick={() => {
                      setRoverDriving(false);
                      setRoverProgress(0);
                      setDriveTargetWaypointId(null);
                      marsAudio.playQuindarTone(false);
                    }}
                    className="p-1.5 rounded-lg bg-space-900/80 hover:bg-space-850 text-space-400 hover:text-white border border-white/[0.08] transition-colors"
                    title="Reset Rover to Route Origin"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })()
        )}

        {/* Walkback Limits Toggle */}
        <button
          onClick={toggleWalkbackLimits}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border ${
            showWalkbackLimits
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'bg-space-900/80 text-space-400 hover:text-white border-white/[0.08]'
          }`}
          title="Toggle NASA 2km & 5km Walkback Safety Circles"
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">WALKBACK: {showWalkbackLimits ? 'ON' : 'OFF'}</span>
        </button>

        {/* Ruler Measure Tool */}
        <button
          onClick={() => {
            if (isRulerActive) {
              setRulerActive(false);
              clearRuler();
            } else {
              setRulerActive(true);
            }
          }}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border ${
            isRulerActive
              ? 'bg-yellow-950/80 text-yellow-300 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
              : 'bg-space-900/80 text-space-400 hover:text-white border-white/[0.08]'
          }`}
          title="Measure distance & elevation between two points"
        >
          <Ruler className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isRulerActive ? 'RULER ACTIVE' : 'MEASURE'}</span>
        </button>
      </div>

      {/* PLACING WAYPOINT FLOATING HELPER BANNER */}
      {isPlacingWaypoint && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-3 bg-space-950/95 backdrop-blur-md px-4 py-2 rounded-full border border-mars-500/70 shadow-2xl font-mono text-xs text-white">
          <span className="flex items-center gap-2 text-mars-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-mars-500 animate-ping" />
            Click on Martian terrain to place Waypoint #{waypoints.length + 1}
          </span>
          <div className="flex items-center gap-1.5 border-l border-space-700 pl-2">
            {waypoints.length > 0 && (
              <button
                onClick={() => {
                  undoLastPoint();
                  marsAudio.playQuindarTone(false);
                }}
                className="px-2.5 py-1 rounded bg-space-800 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 flex items-center gap-1 text-[11px] font-bold transition-colors"
                title="Undo last placed point (Ctrl+Z)"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Undo (Ctrl+Z)</span>
              </button>
            )}
            <button
              onClick={() => setPlacingWaypoint(false)}
              className="px-2.5 py-1 rounded bg-space-800 hover:bg-space-700 text-space-300 hover:text-white border border-space-600 text-[11px] transition-colors"
            >
              Done (Esc)
            </button>
          </div>
        </div>
      )}

      {/* ROVER TELEMETRY HUD (Floating when driving) */}
      {isRoverDriving && (
        <div className="absolute top-16 left-3 z-[400] bg-space-950/95 backdrop-blur-md p-3.5 rounded-xl border border-amber-500/50 shadow-2xl font-mono text-xs w-68 flex flex-col gap-2">
          <div className="flex items-center justify-between text-amber-400 font-bold border-b border-space-800 pb-1">
            <span className="flex items-center gap-1.5">
              <span>🚜</span> ROVER EN ROUTE
            </span>
            <button 
              onClick={() => setRoverDriving(false)}
              className="text-space-400 hover:text-white p-1 rounded hover:bg-space-800 transition-colors text-xs font-bold"
              title="Stop Rover & Close Telemetry"
            >
              ✕
            </button>
          </div>

          {(() => {
            const selectedIdx = selectedWaypointId ? waypoints.findIndex(w => w.id === selectedWaypointId) : -1;
            const targetWp = selectedIdx > 0 ? waypoints[selectedIdx] : waypoints[waypoints.length - 1];
            return (
              <div className="text-[10px] bg-amber-950/40 p-1.5 rounded border border-amber-500/30 text-amber-200 truncate">
                <span className="text-amber-400 font-bold">TARGET: </span>
                <span>{targetWp?.name || 'Primary Mission Objective'}</span>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-space-900 p-1.5 rounded border border-space-800">
              <span className="text-space-400 block">BATTERY</span>
              <span className="text-green-400 font-bold text-xs">{roverBatterySoC.toFixed(0)}%</span>
            </div>
            <div className="bg-space-900 p-1.5 rounded border border-space-800">
              <span className="text-space-400 block">TRAVERSE</span>
              <span className="text-cyan-400 font-bold text-xs">{(roverProgress * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* RULER MEASUREMENT READOUT */}
      {isRulerActive && rulerPoints.length > 0 && (
        <div className="absolute top-16 left-3 z-[400] bg-space-950/95 backdrop-blur-md p-3.5 rounded-xl border border-yellow-500/50 shadow-2xl font-mono text-xs w-72 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-yellow-400 font-bold border-b border-space-800 pb-1">
            <span className="flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5" />
              <span>TERRAIN RULER</span>
            </span>
            <button 
              onClick={() => {
                setRulerActive(false);
                clearRuler();
              }} 
              className="text-space-400 hover:text-white p-1 rounded hover:bg-space-800 transition-colors"
              title="Close Ruler"
            >
              ✕
            </button>
          </div>
          {rulerPoints.length === 1 ? (
            <p className="text-[11px] text-space-300">Click a second point on the map to measure.</p>
          ) : (
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-space-400">Distance:</span>
                <span className="text-white font-bold">{rulerDistKm.toFixed(2)} km ({(rulerDistKm * 1000).toFixed(0)} m)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">Elevation Δ:</span>
                <span className="text-cyan-400 font-bold">{rulerElevDelta > 0 ? `+${rulerElevDelta}` : rulerElevDelta} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">Slope Grade:</span>
                <span className={`font-bold ${Math.abs(rulerSlopeDeg) > 15 ? 'text-red-400' : 'text-green-400'}`}>
                  {Math.abs(rulerSlopeDeg).toFixed(1)}°
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Coordinate Overlay */}
      <CoordinateDisplay />
    </div>
  );
};

export default MarsMap;
