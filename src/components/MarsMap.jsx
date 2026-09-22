import React from 'react';
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useMapStore from '../store/useMapStore';
import { marsLayers } from '../data/marsLayers';
import { getElevation } from '../utils/elevationService';
import CoordinateDisplay from './CoordinateDisplay';
import POIMarkers from './POIMarkers';

const MapEvents = () => {
  const setCursorPosition = useMapStore((s) => s.setCursorPosition);
  const isPlacingWaypoint = useMapStore((s) => s.isPlacingWaypoint);
  const addWaypoint = useMapStore((s) => s.addWaypoint);

  useMapEvents({
    mousemove(e) {
      setCursorPosition({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
    click(e) {
      if (isPlacingWaypoint) {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        const elevation = getElevation(lat, lon);
        addWaypoint({ lat, lon, elevation });
      }
    },
  });
  return null;
};

const MarsMap = () => {
  const activeLayers = useMapStore((s) => s.activeLayers);
  const layerOpacity = useMapStore((s) => s.layerOpacity);
  const waypoints = useMapStore((s) => s.waypoints);
  const isPlacingWaypoint = useMapStore((s) => s.isPlacingWaypoint);
  const selectedWaypointId = useMapStore((s) => s.selectedWaypointId);
  const setSelectedWaypoint = useMapStore((s) => s.setSelectedWaypoint);

  // Build active layer configs from marsLayers data
  const activeLayerConfigs = activeLayers
    .map((id) => marsLayers.find((l) => l.id === id))
    .filter(Boolean);

  const polylinePositions = waypoints.map((wp) => [wp.lat, wp.lon]);

  // Color waypoints from green (start) to red (end)
  const waypointColor = (index) => {
    if (waypoints.length <= 1) return '#22c55e';
    const t = index / (waypoints.length - 1);
    const r = Math.round(34 + t * (239 - 34));
    const g = Math.round(197 + t * (68 - 197));
    const b = Math.round(94 + t * (68 - 94));
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className={`w-full h-full relative ${isPlacingWaypoint ? 'crosshair-cursor' : ''}`}>
      <MapContainer
        center={[0, 0]}
        zoom={2}
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

        {/* POI Markers */}
        <POIMarkers />

        {/* Route Polyline */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#f47050',
              weight: 3,
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
              <div className="min-w-[160px]">
                <h4 className="font-bold text-sm mb-1">{wp.name}</h4>
                <div className="text-xs space-y-0.5 opacity-90">
                  <p>📍 {wp.lat.toFixed(4)}°{wp.lat >= 0 ? 'N' : 'S'}, {Math.abs(wp.lon).toFixed(4)}°{wp.lon >= 0 ? 'E' : 'W'}</p>
                  <p>⛰️ Elevation: {wp.elevation?.toLocaleString()} m</p>
                  <p>🏁 Waypoint #{i + 1}</p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Coordinate Overlay */}
      <CoordinateDisplay />
    </div>
  );
};

export default MarsMap;
