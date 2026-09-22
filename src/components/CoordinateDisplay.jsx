import React from 'react';
import useMapStore from '../store/useMapStore';
import { Crosshair, MapPin } from 'lucide-react';

const formatCoord = (val, isLat) => {
  if (val === undefined || val === null) return '0.0000°';
  const dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
  return `${Math.abs(val).toFixed(4)}°${dir}`;
};

const getElevation = (lat, lon) => {
  // Mock implementation for elevation
  return Math.floor(Math.sin(lat) * Math.cos(lon) * 5000);
};

const CoordinateDisplay = () => {
  const cursorPosition = useMapStore(state => state.cursorPosition) || { lat: 0, lon: 0 };
  const isPlacingWaypoint = useMapStore(state => state.isPlacingWaypoint);
  
  const elevation = getElevation(cursorPosition.lat, cursorPosition.lon);

  return (
    <div className="absolute bottom-6 right-6 z-[1000] glass-panel-solid bg-space-900/90 rounded-xl px-4 py-2 flex items-center gap-4 border border-space-700 shadow-lg pointer-events-none transition-all">
      <div className="flex items-center gap-2 text-mars-400">
        {isPlacingWaypoint ? <Crosshair size={18} className="animate-pulse" /> : <MapPin size={18} />}
      </div>
      
      <div className="flex items-center gap-4 font-mono text-sm">
        <div className="flex gap-2">
          <span className="text-primary">{formatCoord(cursorPosition.lat, true)}</span>
          <span className="text-space-500">|</span>
          <span className="text-primary">{formatCoord(cursorPosition.lon, false)}</span>
        </div>
        
        <div className="w-px h-4 bg-space-700" />
        
        <div className="flex items-center gap-1 text-secondary">
          <span className="text-space-500 text-xs uppercase tracking-wider">Elev:</span>
          <span>{elevation.toLocaleString()} m</span>
        </div>
      </div>
    </div>
  );
};

export default CoordinateDisplay;
