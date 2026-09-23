import React from 'react';
import { Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import useMapStore from '../store/useMapStore';
import { landingSites } from '../data/landingSites';
import { geologicalFeatures } from '../data/geologicalFeatures';
import { marsAudio } from '../utils/audioSynthesizer';

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
            <div className="font-mono text-xs p-1 min-w-[250px] max-w-[280px] text-white">
              {site.image && (
                <div className="w-full h-24 rounded-lg overflow-hidden mb-2 relative border border-white/10">
                  <img src={site.image} alt={site.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
              )}
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                <h3 className="font-bold text-sm text-cyan-300 font-sans">{site.name}</h3>
                <span className="bg-cyan-950/80 text-cyan-400 text-[9px] px-2 py-0.5 rounded border border-cyan-800 uppercase font-bold tracking-wider">
                  Landing Site
                </span>
              </div>
              <p className="text-[11px] text-space-300 mb-2 leading-relaxed font-sans">{site.description}</p>
              <div className="text-[11px] space-y-1 mb-2.5 bg-space-900/80 p-2 rounded-lg border border-white/[0.06]">
                <div className="flex justify-between"><span className="text-space-400">Mission:</span> <span className="text-white font-medium">{site.mission} ({site.agency})</span></div>
                <div className="flex justify-between"><span className="text-space-400">Status:</span> <span className="text-emerald-400 font-medium">{site.status}</span></div>
                <div className="flex justify-between"><span className="text-space-400">Landing Date:</span> <span className="text-white">{site.landingDate}</span></div>
                <div className="flex justify-between"><span className="text-space-400">Elevation:</span> <span className="text-amber-400 font-bold">{site.elevation?.toLocaleString()} m</span></div>
              </div>
              <button
                onClick={() => {
                  addWaypoint({ lat: site.lat, lon: site.lon, name: site.name, elevation: site.elevation });
                  marsAudio.playQuindarTone(true);
                }}
                className="w-full bg-gradient-to-r from-mars-600 to-amber-600 hover:from-mars-500 hover:to-amber-500 text-white font-bold py-1.5 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-md border border-white/20"
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
            <div className="font-mono text-xs p-1 min-w-[250px] max-w-[280px] text-white">
              {feature.image && (
                <div className="w-full h-24 rounded-lg overflow-hidden mb-2 relative border border-white/10">
                  <img src={feature.image} alt={feature.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
              )}
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                <h3 className="font-bold text-sm text-mars-300 font-sans">{feature.name}</h3>
                <span className="bg-mars-950/80 text-mars-400 text-[9px] px-2 py-0.5 rounded border border-mars-800 uppercase font-bold tracking-wider">
                  {feature.type}
                </span>
              </div>
              <p className="text-[11px] text-space-300 mb-2 leading-relaxed font-sans">{feature.description || feature.scienceDescription}</p>
              <div className="text-[11px] space-y-1 mb-2.5 bg-space-900/80 p-2 rounded-lg border border-white/[0.06]">
                <div className="flex justify-between"><span className="text-space-400">Category:</span> <span className="text-white font-medium">{feature.category}</span></div>
                <div className="flex justify-between"><span className="text-space-400">Elevation:</span> <span className="text-amber-400 font-bold">{feature.elevation?.toLocaleString()} m</span></div>
                <div className="flex justify-between font-mono text-[10px]"><span className="text-space-400">Coords:</span> <span className="text-cyan-300">{feature.lat.toFixed(2)}°N, {feature.lon.toFixed(2)}°E</span></div>
              </div>
              <button
                onClick={() => {
                  addWaypoint({ lat: feature.lat, lon: feature.lon, name: feature.name, elevation: feature.elevation });
                  marsAudio.playQuindarTone(true);
                }}
                className="w-full bg-gradient-to-r from-mars-600 to-amber-600 hover:from-mars-500 hover:to-amber-500 text-white font-bold py-1.5 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-md border border-white/20"
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
