import React from 'react';
import { Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import useMapStore from '../store/useMapStore';
import landingSites from '../data/landingSites';
import geologicalFeatures from '../data/geologicalFeatures';

const createCustomIcon = (emoji, color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.5);">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const getFeatureColor = (type) => {
  switch (type) {
    case 'crater': return '#f47050';
    case 'mountain': return '#8b5cf6';
    case 'valley': return '#3b82f6';
    case 'volcano': return '#ef4444';
    default: return '#10b981';
  }
};

const POIMarkers = () => {
  const { poiFilters, setSelectedPOI } = useMapStore();

  return (
    <>
      {poiFilters.landingSites && landingSites.map((site) => (
        <Marker
          key={`landing-${site.id}`}
          position={[site.lat, site.lng]}
          icon={createCustomIcon('🚀', '#3b82f6')}
          eventHandlers={{
            click: () => setSelectedPOI({ ...site, poiType: 'landingSite' }),
          }}
        >
          <Popup className="mars-popup custom-popup">
            <div className="text-space-950 font-sans p-1 min-w-[200px]">
              <h3 className="font-bold text-lg mb-1">{site.name}</h3>
              <span className="inline-block bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full mb-2 uppercase font-bold tracking-wider">Landing Site</span>
              <p className="text-sm mb-3 leading-tight">{site.description}</p>
              <div className="text-xs space-y-1 mb-3">
                <p><strong>Mission:</strong> {site.mission}</p>
                <p><strong>Status:</strong> {site.status}</p>
                <p><strong>Date:</strong> {site.landingDate}</p>
              </div>
              <div className="text-[10px] text-space-600 bg-space-100 p-2 rounded font-mono">
                Lat: {site.lat.toFixed(4)}°, Lng: {site.lng.toFixed(4)}°<br/>
                Elev: {site.elevation}m
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {poiFilters.geologicalFeatures && geologicalFeatures.map((feature) => (
        <CircleMarker
          key={`feature-${feature.id}`}
          center={[feature.lat, feature.lng]}
          radius={6}
          pathOptions={{ 
            color: getFeatureColor(feature.type), 
            fillColor: getFeatureColor(feature.type), 
            fillOpacity: 0.8,
            weight: 2
          }}
          eventHandlers={{
            click: () => setSelectedPOI({ ...feature, poiType: 'feature' }),
          }}
        >
          <Popup className="mars-popup custom-popup">
            <div className="text-space-950 font-sans p-1 min-w-[200px]">
              <h3 className="font-bold text-lg mb-1">{feature.name}</h3>
              <span className="inline-block bg-mars-100 text-mars-800 text-[10px] px-2 py-0.5 rounded-full mb-2 uppercase font-bold tracking-wider">{feature.type}</span>
              <p className="text-sm mb-3 leading-tight">{feature.description || feature.scienceDescription}</p>
              <div className="text-[10px] text-space-600 bg-space-100 p-2 rounded font-mono">
                Lat: {feature.lat.toFixed(4)}°, Lng: {feature.lng.toFixed(4)}°<br/>
                Elev: {feature.elevation}m
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};

export default POIMarkers;
