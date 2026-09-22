import React, { useState } from 'react';
import useMapStore from '../store/useMapStore';
import { Layers, Eye, EyeOff, Info, ChevronDown, ChevronRight, Mountain, Thermometer, FlaskConical, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categoryIcons = {
  'topography': Mountain,
  'temperature': Thermometer,
  'composition': FlaskConical,
  'imagery': MapIcon
};

const LayerItem = ({ layer, isActive, opacity, onToggle, onOpacityChange }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <button 
          className={`flex items-center gap-2 flex-1 text-left ${isActive ? 'text-mars-400' : 'text-primary'}`}
          onClick={() => onToggle(layer.id)}
        >
          {isActive ? <Eye size={16} /> : <EyeOff size={16} className="text-space-600" />}
          <span className="font-inter text-sm">{layer.name}</span>
        </button>
        <button onClick={() => setShowInfo(!showInfo)} className="text-space-500 hover:text-mars-400 transition-colors">
          <Info size={16} />
        </button>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 pl-6 pr-2 mb-2">
              <span className="text-xs text-space-400 w-8">{Math.round(opacity)}%</span>
              <input 
                type="range" 
                min="0" max="100" 
                value={opacity}
                onChange={(e) => onOpacityChange(layer.id, parseInt(e.target.value))}
                className="flex-1 h-1 bg-space-700 rounded-full appearance-none cursor-pointer accent-mars-500"
              />
            </div>
            {layer.legend && (
              <div className="pl-6 pr-2 mt-2">
                <div className="h-2 w-full rounded-full mb-1" style={{ background: layer.legend.gradient }} />
                <div className="flex justify-between text-[10px] text-space-400 font-mono">
                  <span>{layer.legend.min}</span>
                  <span>{layer.legend.max}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-space-800/50 p-3 rounded-lg mt-2 text-xs text-secondary border border-space-700/50">
              <p className="mb-1 text-primary">{layer.description || 'No description available.'}</p>
              <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[10px]">
                <div><span className="text-space-500">Mission:</span><br/>{layer.mission || 'N/A'}</div>
                <div><span className="text-space-500">Instrument:</span><br/>{layer.instrument || 'N/A'}</div>
                <div className="col-span-2"><span className="text-space-500">Resolution:</span><br/>{layer.resolution || 'N/A'}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LayerCategory = ({ categoryId, categoryName, layers }) => {
  const [isOpen, setIsOpen] = useState(true);
  const activeLayers = useMapStore(state => state.activeLayers) || [];
  const layerOpacity = useMapStore(state => state.layerOpacity) || {};
  const toggleLayer = useMapStore(state => state.toggleLayer);
  const setLayerOpacity = useMapStore(state => state.setLayerOpacity);

  const Icon = categoryIcons[categoryId] || Layers;

  return (
    <div className="mb-6 border-b border-space-800/50 pb-4 last:border-0">
      <button 
        className="flex items-center gap-2 w-full text-left mb-4 hover:text-mars-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon size={18} className="text-mars-500" />
        <span className="font-orbitron font-medium tracking-wide flex-1">{categoryName}</span>
        {isOpen ? <ChevronDown size={16} className="text-space-500" /> : <ChevronRight size={16} className="text-space-500" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-2"
          >
            {layers.map(layer => (
              <LayerItem 
                key={layer.id}
                layer={layer}
                isActive={activeLayers.includes(layer.id)}
                opacity={layerOpacity[layer.id] !== undefined ? layerOpacity[layer.id] : 100}
                onToggle={toggleLayer}
                onOpacityChange={setLayerOpacity}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LayerPanel = () => {
  let LAYER_CATEGORIES = [];
  let marsLayers = [];
  try {
    const data = require('../data/marsLayers');
    marsLayers = data.marsLayers || [];
    LAYER_CATEGORIES = data.LAYER_CATEGORIES || [
      { id: 'imagery', name: 'Global Imagery' },
      { id: 'topography', name: 'Topography & Elevation' },
      { id: 'composition', name: 'Mineral Composition' }
    ];
  } catch (e) {
    LAYER_CATEGORIES = [
      { id: 'imagery', name: 'Global Imagery' },
      { id: 'topography', name: 'Topography & Elevation' },
      { id: 'composition', name: 'Mineral Composition' }
    ];
  }

  const getLayersForCategory = (categoryId) => {
    return marsLayers.filter(l => l.category === categoryId || l.categoryId === categoryId);
  };

  return (
    <div className="p-4 h-full overflow-y-auto custom-scrollbar bg-space-950/80 rounded-xl">
      <h2 className="font-orbitron text-xl text-primary mb-6 flex items-center gap-2">
        <Layers className="text-mars-500" />
        Map Layers
      </h2>
      
      {LAYER_CATEGORIES.map(cat => {
        const catLayers = getLayersForCategory(cat.id);
        if (catLayers.length === 0) return null;
        
        return (
          <LayerCategory 
            key={cat.id} 
            categoryId={cat.id} 
            categoryName={cat.name} 
            layers={catLayers} 
          />
        );
      })}
    </div>
  );
};

export default LayerPanel;
