import React, { useState, useEffect, useRef } from 'react';
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
import { Shield, Play, Pause, Square, Ruler, AlertTriangle, Battery, Gauge, Compass } from 'lucide-react';

// Custom Rover Div Icon
const createRoverIcon = () => {
  return L.divIcon({
    className: 'custom-rover-icon',
    html: `
      <div style="background: #ea580c; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2.5px solid white; box-shadow: 0 0 16px rgba(234,88,12,0.9); animation: pulse 2s infinite;">
        🚜
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
};

const MapEvents = () => {
  const setCursorPosition = useMapStore((s) => s.setCursorPosition);
  const isPlacingWaypoint = useMapStore((s) => s.isPlacingWaypoint);
  const addWaypoint = useMapStore((s) => s.addWaypoint);
  const isRulerActive = useMapStore((s) => s.isRulerActive);
  const addRulerPoint = useMapStore((s) => s.addRulerPoint);

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
      } else if (isRulerActive) {
        addRulerPoint({ lat, lon, elevation });
        marsAudio.playQuindarTone(true);
      }
    },
  });
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
    setRoverBatterySoC
  } = useMapStore();

  const [currentCoord, setCurrentCoord] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(7.5);
  const [currentSlope, setCurrentSlope] = useState(0);

  useEffect(() => {
    if (!waypoints || waypoints.length < 2) return;
    setCurrentCoord([waypoints[0].lat, waypoints[0].lon]);
  }, [waypoints]);

  useEffect(() => {
    let animId;
    if (isRoverDriving && waypoints && waypoints.length > 1) {
      const speed = 0.003; // progress increment per frame
      let prog = roverProgress;

      const drive = () => {
        prog += speed;
        if (prog >= 1.0) {
          prog = 1.0;
          setRoverProgress(1.0);
          setRoverDriving(false);
          marsAudio.playQuindarTone(false);
          return;
        }

        // Calculate segment interpolation
        const totalSegments = waypoints.length - 1;
        const segmentFloat = prog * totalSegments;
        const segIndex = Math.min(Math.floor(segmentFloat), totalSegments - 1);
        const segFraction = segmentFloat - segIndex;

        const wpA = waypoints[segIndex];
        const wpB = waypoints[segIndex + 1];

        const lat = wpA.lat + (wpB.lat - wpA.lat) * segFraction;
        const lon = wpA.lon + (wpB.lon - wpA.lon) * segFraction;
        const elev = (wpA.elevation || 0) + ((wpB.elevation || 0) - (wpA.elevation || 0)) * segFraction;

        setCurrentCoord([lat, lon]);
        setRoverProgress(prog);

        // Slope calculation for telemetry
        const segDistKm = marsDistance(wpA.lat, wpA.lon, wpB.lat, wpB.lon);
        const slope = calculateSlope(wpA.elevation, wpB.elevation, segDistKm * 1000);
        setCurrentSlope(slope);

        // Regenerative braking downhill vs uphill power consumption
        if (slope < -2) {
          setRoverBatterySoC(Math.min(100, roverBatterySoC + 0.01)); // Regenerative charging
        } else {
          setRoverBatterySoC(Math.max(10, roverBatterySoC - 0.02));
        }

        // Speed modulation (slower on steep slopes)
        const modulatedSpeed = Math.max(3.0, 9.5 - Math.abs(slope) * 0.35);
        setCurrentSpeed(modulatedSpeed);

        animId = requestAnimationFrame(drive);
      };

      animId = requestAnimationFrame(drive);
    }
    return () => cancelAnimationFrame(animId);
  }, [isRoverDriving, waypoints, roverProgress, roverBatterySoC]);

  if (!currentCoord || !waypoints || waypoints.length < 2) return null;

  return (
    <>
      <Marker position={currentCoord} icon={createRoverIcon()}>
        <Popup>
          <div className="font-mono text-xs p-1">
            <strong>PRESSURIZED EXPLORATION ROVER 01</strong>
            <p>Speed: {currentSpeed.toFixed(1)} km/h</p>
            <p>Slope: {currentSlope.toFixed(1)}°</p>
            <p>Battery: {roverBatterySoC.toFixed(0)}%</p>
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
  const setRoverProgress = useMapStore((s) => s.setRoverProgress);
  const roverBatterySoC = useMapStore((s) => s.roverBatterySoC);
  const isRulerActive = useMapStore((s) => s.isRulerActive);
  const setRulerActive = useMapStore((s) => s.setRulerActive);
  const rulerPoints = useMapStore((s) => s.rulerPoints);
  const clearRuler = useMapStore((s) => s.clearRuler);

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
        center={[18.4447, 77.4508]}
        zoom={4}
        minZoom={1}
        maxZoom={8}
        crs={L.CRS.EPSG4326}
        style={{ height: '100%', width: '100%', background: '#090b14' }}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
      >
        <MapEvents />

        {/* NASA Trek WMTS Tile Layers */}
        {activeLayerConfigs.map((layer) => (
          <TileLayer
            key={layer.id}
            url={layer.url}
            opacity={layerOpacity[layer.id] !== undefined ? layerOpacity[layer.id] : layer.defaultOpacity}
            attribution={layer.attribution}
            noWrap={true}
            bounds={[[-90, -180], [90, 180]]}
            maxNativeZoom={layer.maxZoom}
            maxZoom={8}
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
              radius={5000}
              pathOptions={{
                color: '#f59e0b',
                fillColor: '#f59e0b',
                fillOpacity: 0.04,
                weight: 1.5,
                dashArray: '6, 6'
              }}
            >
              <Popup>
                <div className="font-mono text-xs">
                  <strong>NASA 5.0 km Hard Walkback Boundary</strong>
                  <p>Maximum authorized traverse perimeter from pressurized base.</p>
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
              color: '#f47050',
              weight: 3.5,
              opacity: 0.9,
              dashArray: '8, 6',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Waypoint Markers */}
        {waypoints.map((wp, i) => (
          <CircleMarker
            key={wp.id}
            center={[wp.lat, wp.lon]}
            radius={selectedWaypointId === wp.id ? 10 : 7}
            pathOptions={{
              color: waypointColor(i),
              fillColor: waypointColor(i),
              fillOpacity: 0.85,
              weight: selectedWaypointId === wp.id ? 3 : 2,
            }}
            eventHandlers={{
              click: () => setSelectedWaypoint(wp.id),
            }}
          >
            <Popup>
              <div className="min-w-[160px] font-mono text-xs">
                <h4 className="font-bold text-sm mb-1 text-space-950 font-sans">{wp.name}</h4>
                <div className="space-y-0.5 text-space-800">
                  <p>📍 {wp.lat.toFixed(4)}°N, {wp.lon.toFixed(4)}°E</p>
                  <p>⛰️ Elev: {wp.elevation?.toLocaleString()} m</p>
                  <p>🏁 Waypoint #{i + 1}</p>
                </div>
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
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-1.5 bg-space-950/90 backdrop-blur-md p-1.5 rounded-xl border border-space-700/80 shadow-2xl font-mono text-xs">
        {/* Drive Rover Button */}
        {waypoints && waypoints.length > 1 && (
          <button
            onClick={() => {
              if (isRoverDriving) {
                setRoverDriving(false);
              } else {
                setRoverDriving(true);
              }
            }}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              isRoverDriving 
                ? 'bg-amber-600 text-white animate-pulse' 
                : 'bg-space-800 hover:bg-space-700 text-amber-400 border border-space-700'
            }`}
          >
            {isRoverDriving ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-amber-400" />}
            <span>{isRoverDriving ? 'PAUSE ROVER' : 'DRIVE ROVER'}</span>
          </button>
        )}

        {/* Walkback Limits Toggle */}
        <button
          onClick={toggleWalkbackLimits}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border ${
            showWalkbackLimits
              ? 'bg-green-500/20 text-green-400 border-green-500/40'
              : 'bg-space-800 text-space-400 hover:text-white border-space-700'
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
              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
              : 'bg-space-800 text-space-400 hover:text-white border-space-700'
          }`}
          title="Measure distance & elevation between two points"
        >
          <Ruler className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isRulerActive ? 'RULER ACTIVE' : 'MEASURE'}</span>
        </button>
      </div>

      {/* ROVER TELEMETRY HUD (Floating when driving) */}
      {isRoverDriving && (
        <div className="absolute top-16 left-3 z-[400] bg-space-950/95 backdrop-blur-md p-3.5 rounded-xl border border-amber-500/50 shadow-2xl font-mono text-xs w-64 flex flex-col gap-2">
          <div className="flex items-center justify-between text-amber-400 font-bold border-b border-space-800 pb-1">
            <span className="flex items-center gap-1.5">
              <span>🚜</span> ROVER TELEMETRY
            </span>
            <button 
              onClick={() => setRoverDriving(false)}
              className="text-space-400 hover:text-white p-1 rounded hover:bg-space-800 transition-colors"
              title="Stop Rover & Close Telemetry"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-space-900 p-1.5 rounded border border-space-800">
              <span className="text-space-400 block">SPEED</span>
              <span className="text-white font-bold text-xs">7.4 km/h</span>
            </div>
            <div className="bg-space-900 p-1.5 rounded border border-space-800">
              <span className="text-space-400 block">BATTERY</span>
              <span className="text-green-400 font-bold text-xs">{roverBatterySoC.toFixed(0)}%</span>
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
