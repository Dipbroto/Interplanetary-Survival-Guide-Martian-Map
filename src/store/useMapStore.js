import { create } from 'zustand';
import { getDefaultVisibleLayers } from '../data/marsLayers';
import { generateWeatherForSol, getSolFromDate } from '../data/weatherSimulation';

const initialSol = getSolFromDate();

const useMapStore = create((set, get) => ({
  // ========================
  // MAP STATE
  // ========================
  mapCenter: [18.4447, 77.4508], // Jezero Crater
  mapZoom: 4,
  cursorPosition: null, // {lat, lon}
  viewMode: '2d', // '2d' | '3d' | 'split'
  
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  setViewMode: (mode) => set({ viewMode: mode }),

  // ========================
  // LAYERS
  // ========================
  activeLayers: getDefaultVisibleLayers(), // Array of layer IDs
  layerOpacity: {}, // { layerId: opacity 0-1 }
  
  toggleLayer: (layerId) => set((state) => ({
    activeLayers: state.activeLayers.includes(layerId)
      ? state.activeLayers.filter(id => id !== layerId)
      : [...state.activeLayers, layerId]
  })),
  setLayerOpacity: (layerId, opacity) => set((state) => ({
    layerOpacity: { ...state.layerOpacity, [layerId]: opacity }
  })),

  // ========================
  // ROUTE PLANNING
  // ========================
  waypoints: [], // [{id, lat, lon, name, elevation}]
  isPlacingWaypoint: false,
  selectedWaypointId: null,
  
  addWaypoint: (waypoint) => set((state) => ({
    waypoints: [...state.waypoints, {
      ...waypoint,
      id: `wp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: waypoint.name || `Waypoint ${state.waypoints.length + 1}`,
    }]
  })),
  removeWaypoint: (id) => set((state) => ({
    waypoints: state.waypoints.filter(w => w.id !== id),
    selectedWaypointId: state.selectedWaypointId === id ? null : state.selectedWaypointId,
  })),
  updateWaypoint: (id, updates) => set((state) => ({
    waypoints: state.waypoints.map(w => w.id === id ? { ...w, ...updates } : w)
  })),
  clearWaypoints: () => set({ waypoints: [], selectedWaypointId: null }),
  setPlacingWaypoint: (val) => set({ isPlacingWaypoint: val }),
  setSelectedWaypoint: (id) => set({ selectedWaypointId: id }),
  reorderWaypoints: (newOrder) => set({ waypoints: newOrder }),

  // ========================
  // POI
  // ========================
  selectedPOI: null,
  poiFilters: {
    showLandingSites: true,
    showGeologicalFeatures: true,
    showScienceTargets: true,
    featureTypes: [], // empty = show all
  },
  
  setSelectedPOI: (poi) => set({ selectedPOI: poi }),
  togglePOIFilter: (key) => set((state) => ({
    poiFilters: { ...state.poiFilters, [key]: !state.poiFilters[key] }
  })),

  // ========================
  // WEATHER
  // ========================
  currentSol: initialSol,
  weather: generateWeatherForSol(initialSol),
  
  updateWeather: () => {
    const sol = getSolFromDate();
    set({ currentSol: sol, weather: generateWeatherForSol(sol) });
  },

  // ========================
  // MISSION TIMELINE
  // ========================
  missionActivities: [],
  
  addActivity: (activity) => set((state) => ({
    missionActivities: [...state.missionActivities, {
      ...activity,
      id: `act-${Date.now()}`,
    }]
  })),
  removeActivity: (id) => set((state) => ({
    missionActivities: state.missionActivities.filter(a => a.id !== id)
  })),
  updateActivity: (id, updates) => set((state) => ({
    missionActivities: state.missionActivities.map(a => a.id === id ? { ...a, ...updates } : a)
  })),
  clearActivities: () => set({ missionActivities: [] }),

  // ========================
  // UI STATE
  // ========================
  sidebarOpen: true,
  sidebarTab: 'layers', // 'layers' | 'route' | 'poi' | 'mission'
  bottomPanelOpen: true,
  bottomPanelTab: 'elevation', // 'elevation' | 'weather' | 'radiation' | 'dust'
  showLoadingScreen: true,
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarTab: (tab) => set({ sidebarTab: tab, sidebarOpen: true }),
  setBottomPanelOpen: (open) => set({ bottomPanelOpen: open }),
  setBottomPanelTab: (tab) => set({ bottomPanelTab: tab, bottomPanelOpen: true }),
  setShowLoadingScreen: (show) => set({ showLoadingScreen: show }),
}));

export default useMapStore;
