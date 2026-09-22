import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, Rocket, Mountain, Info, Target, Calendar, User, FlaskConical } from 'lucide-react';
import useMapStore from '../store/useMapStore';

const POIDetailCard = () => {
  const { selectedPOI, setSelectedPOI, addWaypoint, setScienceLabOpen } = useMapStore();

  if (!selectedPOI) {
    return (
      <div className="glass-panel p-6 text-center text-space-400 h-full flex flex-col items-center justify-center">
        <Info className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-sm">Click a marker on the map to see details.</p>
      </div>
    );
  }

  const isLandingSite = selectedPOI.poiType === 'landingSite';

  const handleNavigate = () => {
    addWaypoint({
      id: Date.now().toString(),
      lat: selectedPOI.lat,
      lon: selectedPOI.lon !== undefined ? selectedPOI.lon : selectedPOI.lng,
      elevation: selectedPOI.elevation || 0,
      name: selectedPOI.name
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="glass-panel relative overflow-hidden flex flex-col h-full"
      >
        <div className={`h-24 w-full shrink-0 ${isLandingSite ? 'bg-gradient-to-r from-blue-900 to-space-900' : 'bg-gradient-to-r from-mars-900 to-space-900'} relative`}>
          <button 
            onClick={() => setSelectedPOI(null)}
            className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-5 -mt-10 relative z-10 flex-1 overflow-y-auto custom-scrollbar">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-2 border-space-800 mb-4 ${isLandingSite ? 'bg-blue-600' : 'bg-mars-600'}`}>
            {isLandingSite ? <Rocket className="text-white" size={32} /> : <Mountain className="text-white" size={32} />}
          </div>

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-display font-bold text-primary">{selectedPOI.name}</h2>
            <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider ${isLandingSite ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-mars-500/20 text-mars-300 border border-mars-500/30'}`}>
              {isLandingSite ? 'Landing Site' : selectedPOI.type}
            </span>
          </div>

          <p className="text-secondary text-sm mb-6 leading-relaxed">
            {selectedPOI.description || selectedPOI.scienceDescription}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-space-900/50 p-3 rounded-xl border border-space-800 flex flex-col justify-center">
              <div className="flex items-center text-space-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                <MapPin size={12} className="mr-1" /> Coordinates
              </div>
              <div className="font-mono text-xs text-primary">
                {(selectedPOI.lat || 0).toFixed(4)}°, {(selectedPOI.lon !== undefined ? selectedPOI.lon : (selectedPOI.lng || 0)).toFixed(4)}°
              </div>
            </div>
            <div className="bg-space-900/50 p-3 rounded-xl border border-space-800 flex flex-col justify-center">
              <div className="flex items-center text-space-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                <Mountain size={12} className="mr-1" /> Elevation
              </div>
              <div className="font-mono text-xs text-primary">
                {selectedPOI.elevation} m
              </div>
            </div>
          </div>

          {isLandingSite && (
            <div className="space-y-3 mb-6 bg-space-900/30 p-4 rounded-xl border border-space-800">
              <div className="flex items-start">
                <Target size={16} className="text-blue-400 mt-0.5 mr-3 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-space-400 font-bold">Mission</div>
                  <div className="text-sm text-primary">{selectedPOI.mission}</div>
                </div>
              </div>
              <div className="flex items-start">
                <User size={16} className="text-blue-400 mt-0.5 mr-3 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-space-400 font-bold">Agency</div>
                  <div className="text-sm text-primary">{selectedPOI.agency || 'NASA'}</div>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar size={16} className="text-blue-400 mt-0.5 mr-3 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-space-400 font-bold">Landing Date</div>
                  <div className="text-sm text-primary">{selectedPOI.landingDate}</div>
                </div>
              </div>
              <div className="flex items-start">
                <Info size={16} className="text-blue-400 mt-0.5 mr-3 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-space-400 font-bold">Status</div>
                  <div className="text-sm text-primary flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${selectedPOI.status === 'Active' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-yellow-500 shadow-[0_0_8px_#eab308]'}`}></span>
                    {selectedPOI.status}
                  </div>
                </div>
              </div>
              
              {selectedPOI.objectives && (
                <div className="mt-4 pt-4 border-t border-space-800">
                  <div className="text-[10px] uppercase tracking-wider text-space-400 font-bold mb-2">Primary Objectives</div>
                  <ul className="list-disc list-inside text-xs text-secondary space-y-1">
                    {selectedPOI.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!isLandingSite && selectedPOI.diameter && (
             <div className="mb-6 bg-space-900/30 p-4 rounded-xl border border-space-800 flex items-start">
               <Target size={16} className="text-mars-400 mt-0.5 mr-3 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-space-400 font-bold">Diameter</div>
                  <div className="text-sm text-primary">{selectedPOI.diameter} km</div>
                </div>
             </div>
          )}
        </div>
        
        <div className="p-4 border-t border-space-800 bg-space-900/50 shrink-0 flex flex-col gap-2">
          <button
            onClick={() => setScienceLabOpen(true)}
            className="w-full py-2.5 bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-xs cursor-pointer"
          >
            <FlaskConical size={16} className="text-purple-300" />
            <span>Analyze in Science Lab</span>
          </button>

          <button
            onClick={handleNavigate}
            className="w-full py-2.5 bg-mars-600 hover:bg-mars-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-mars-600/20 text-xs cursor-pointer"
          >
            <Navigation size={16} />
            <span>Navigate Here</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default POIDetailCard;
