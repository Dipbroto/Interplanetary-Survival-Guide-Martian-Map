import React from 'react';
import { Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import useMapStore from '../store/useMapStore';
import { landingSites } from '../data/landingSites';
import { geologicalFeatures } from '../data/geologicalFeatures';

const createCustomIcon = (emoji, color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.8);">${emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

const getFeatureColor = (type) => {
  switch (type) {
    case 'crater': return '#f47050';
    case 'mountain': return '#8b5cf6';
    case 'valley': return '#3b82f6';
    case 'volcano': return '#ef4444';
    case 'plain': return '#eab308';
    case 'polar': return '#06b6d4';
    default: return '#10b981';
  }
};

const POIMarkers = () => {
  const { poiFilters, setSelectedPOI, addWaypoint } = useMapStore();

  return (
    <>
      {poiFilters.showLandingSites && landingSites.map((site) => (
        <Marker
          key={`landing-${site.id}`}
          position={[site.lat, site.lon]}
          icon={createCustomIcon('🚀', site.color || '#3b82f6')}
          eventHandlers={{
            click: () => setSelectedPOI({ ...site, poiType: 'landingSite' }),
          }}
        >
          <Popup className="mars-popup custom-popup">
            <div className="text-space-950 font-sans p-1 min-w-[220px]">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-base leading-tight text-space-950">{site.name}</h3>
                <span className="bg-blue-100 text-blue-800 text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Landing Site</span>
              </div>
              <p className="text-xs text-space-700 mb-2 leading-tight">{site.description}</p>
              <div className="text-[11px] space-y-0.5 mb-2 bg-space-100 p-2 rounded">
                <p><strong>Mission:</strong> {site.mission} ({site.agency})</p>
                <p><strong>Status:</strong> {site.status}</p>
                <p><strong>Date:</strong> {site.landingDate}</p>
                <p><strong>Elevation:</strong> {site.elevation?.toLocaleString()} m</p>
              </div>
              <button
                onClick={() => addWaypoint({ lat: site.lat, lon: site.lon, name: site.name, elevation: site.elevation })}
                className="w-full bg-mars-600 hover:bg-mars-500 text-white font-medium py-1 px-2 rounded text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <span>➕ Add to Marswalk Route</span>
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {poiFilters.showGeologicalFeatures && geologicalFeatures.map((feature) => (
        <CircleMarker
          key={`feature-${feature.id}`}
          center={[feature.lat, feature.lon]}
          radius={7}
          pathOptions={{ 
            color: getFeatureColor(feature.type), 
            fillColor: getFeatureColor(feature.type), 
            fillOpacity: 0.85,
            weight: 2
          }}
          eventHandlers={{
            click: () => setSelectedPOI({ ...feature, poiType: 'feature' }),
          }}
        >
          <Popup className="mars-popup custom-popup">
            <div className="text-space-950 font-sans p-1 min-w-[220px]">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-base leading-tight text-space-950">{feature.name}</h3>
                <span className="bg-mars-100 text-mars-800 text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">{feature.type}</span>
              </div>
              <p className="text-xs text-space-700 mb-2 leading-tight">{feature.description || feature.scienceDescription}</p>
              <div className="text-[11px] space-y-0.5 mb-2 bg-space-100 p-2 rounded">
                <p><strong>Significance:</strong> {feature.significance || feature.geology}</p>
                <p><strong>Elevation:</strong> {feature.elevation?.toLocaleString()} m</p>
                <p className="font-mono text-[10px] text-space-500">Lat: {feature.lat.toFixed(2)}°, Lon: {feature.lon.toFixed(2)}°</p>
              </div>
              <button
                onClick={() => addWaypoint({ lat: feature.lat, lon: feature.lon, name: feature.name, elevation: feature.elevation })}
                className="w-full bg-mars-600 hover:bg-mars-500 text-white font-medium py-1 px-2 rounded text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <span>➕ Add to Marswalk Route</span>
              </button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};

export default POIMarkers;
