import { create } from 'zustand';
import { getDefaultVisibleLayers } from '../data/marsLayers';
import { generateWeatherForSol, getSolFromDate } from '../data/weatherSimulation';
import { marsAudio } from '../utils/audioSynthesizer';

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
  setViewMode: (mode) => set({ viewMode: mode, isEVASimulating: false }),

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
      id: waypoint.id || `wp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: waypoint.name || `Waypoint ${state.waypoints.length + 1}`,
      lon: waypoint.lon !== undefined ? waypoint.lon : (waypoint.lng !== undefined ? waypoint.lng : 0),
    }]
  })),
  removeWaypoint: (id) => set((state) => ({
    waypoints: state.waypoints.filter(w => w.id !== id),
    selectedWaypointId: state.selectedWaypointId === id ? null : state.selectedWaypointId,
  })),
  updateWaypoint: (id, updates) => set((state) => ({
    waypoints: state.waypoints.map(w => w.id === id ? { ...w, ...updates } : w)
  })),
  clearWaypoints: () => set({ waypoints: [], selectedWaypointId: null, evaCurrentWaypointIndex: 0, isRoverDriving: false, roverProgress: 0 }),
  setPlacingWaypoint: (val) => set({ isPlacingWaypoint: val, isRulerActive: false }),
  setSelectedWaypoint: (id) => set({ selectedWaypointId: id }),
  reorderWaypoints: (newOrder) => set({ waypoints: newOrder }),

  // ========================
  // ROVER DRIVE SIMULATOR
  // ========================
  isRoverDriving: false,
  roverProgress: 0, // 0.0 to 1.0 along route
  roverCurrentPosition: null, // {lat, lon, bearing, elevation}
  roverSpeedKmh: 7.2,
  roverBatterySoC: 96, // %
  roverOdometerKm: 0,
  
  setRoverDriving: (val) => {
    set({ isRoverDriving: val });
    if (val) {
      marsAudio.playQuindarTone(true);
    }
  },
  setRoverProgress: (prog) => set({ roverProgress: prog }),
  setRoverCurrentPosition: (pos) => set({ roverCurrentPosition: pos }),
  setRoverBatterySoC: (soc) => set({ roverBatterySoC: Math.max(0, Math.min(100, soc)) }),
  setRoverOdometerKm: (km) => set({ roverOdometerKm: km }),

  // ========================
  // MAP TOOLS (WALKBACK & RULER)
  // ========================
  showWalkbackLimits: true,
  toggleWalkbackLimits: () => set((state) => ({ showWalkbackLimits: !state.showWalkbackLimits })),
  
  isRulerActive: false,
  rulerPoints: [], // max 2 points [{lat, lon, elevation}]
  setRulerActive: (val) => set({ isRulerActive: val, isPlacingWaypoint: false }),
  addRulerPoint: (pt) => set((state) => {
    if (state.rulerPoints.length >= 2) return { rulerPoints: [pt] };
    return { rulerPoints: [...state.rulerPoints, pt] };
  }),
  clearRuler: () => set({ rulerPoints: [] }),

  // ========================
  // EXPEDITION PRESETS
  // ========================
  activePresetId: null,
  loadExpeditionPreset: (preset) => {
    set({
      activePresetId: preset.id,
      mapCenter: preset.center,
      mapZoom: preset.zoom,
      waypoints: preset.waypoints,
      selectedWaypointId: preset.waypoints[0]?.id || null,
      sidebarTab: 'route',
      sidebarOpen: true,
      isRoverDriving: false,
      roverProgress: 0,
      missionActivities: (preset.timeline || []).map((item, idx) => ({
        id: `act-preset-${idx}`,
        title: item.title,
        description: item.description,
        time: item.time,
        type: idx % 3 === 0 ? 'traverse' : (idx % 3 === 1 ? 'sample' : 'experiment'),
        duration: 1.0,
        sol: 1,
        category: 'Science',
        completed: false
      }))
    });
    marsAudio.playQuindarTone(true);
  },

  // ========================
  // POI
  // ========================
  selectedPOI: null,
  poiFilters: {
    showLandingSites: true,
    showGeologicalFeatures: true,
    showScienceTargets: true,
    featureTypes: [],
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
  // EVA ASTRONAUT HUD & SIMULATION
  // ========================
  isEVASimulating: false,
  evaCurrentWaypointIndex: 0,
  setEVASimulating: (val) => {
    set({ isEVASimulating: val });
    if (val) {
      marsAudio.playQuindarTone(true);
    }
  },
  setEVACurrentWaypointIndex: (idx) => set({ evaCurrentWaypointIndex: idx }),

  // ========================
  // IN-SITU SCIENCE LAB & SAMPLING
  // ========================
  isScienceLabOpen: false,
  collectedSamples: [
    {
      id: 'sample-001',
      name: 'Jezero Delta Mudstone',
      location: 'Skinner Ridge (18.451°N, 77.398°E)',
      sol: initialSol - 14,
      rockType: 'Lacustrine Mudstone',
      keyMinerals: 'Smectite Clay, Fe-Carbonate, Silica',
      biosignatureScore: 88,
      status: 'Cached in Tube #08'
    },
    {
      id: 'sample-002',
      name: 'Séítah Cumulate Olivine',
      location: 'Dourbes Outcrop (18.441°N, 77.442°E)',
      sol: initialSol - 42,
      rockType: 'Igneous Cumulate',
      keyMinerals: 'Forsteritic Olivine, Pyroxene',
      biosignatureScore: 32,
      status: 'Cached in Tube #14'
    }
  ],
  setScienceLabOpen: (val) => set((state) => {
    const next = typeof val === 'boolean' ? val : !state.isScienceLabOpen;
    return {
      isScienceLabOpen: next,
      ...(next ? { isSkyEphemerisOpen: false, isFlightPlanOpen: false, isEVASimulating: false } : {})
    };
  }),
  addSample: (sample) => set((state) => ({
    collectedSamples: [sample, ...(state.collectedSamples || [])]
  })),
  removeSample: (id) => set((state) => ({
    collectedSamples: (state.collectedSamples || []).filter(s => s.id !== id)
  })),

  // ========================
  // MARTIAN SKY EPHEMERIS & MOONS
  // ========================
  isSkyEphemerisOpen: false,
  setSkyEphemerisOpen: (val) => set((state) => {
    const next = typeof val === 'boolean' ? val : !state.isSkyEphemerisOpen;
    return {
      isSkyEphemerisOpen: next,
      ...(next ? { isScienceLabOpen: false, isFlightPlanOpen: false, isEVASimulating: false } : {})
    };
  }),

  // ========================
  // FLIGHT PLAN & CHECKLIST
  // ========================
  isFlightPlanOpen: false,
  setFlightPlanOpen: (val) => set((state) => {
    const next = typeof val === 'boolean' ? val : !state.isFlightPlanOpen;
    return {
      isFlightPlanOpen: next,
      ...(next ? { isScienceLabOpen: false, isSkyEphemerisOpen: false, isEVASimulating: false } : {})
    };
  }),

  // ========================
  // AUDIO SOUNDSCAPE & RACK
  // ========================
  isAudioActive: false,
  isAudioRackOpen: false,
  toggleAudio: () => {
    const active = marsAudio.toggleMute();
    set({ isAudioActive: active });
  },
  setAudioRackOpen: (val) => set({ isAudioRackOpen: val }),

  // ========================
  // UI STATE & OVERLAY CONTROLS
  // ========================
  sidebarOpen: true,
  sidebarTab: 'layers', // 'layers' | 'route' | 'poi' | 'mission'
  bottomPanelOpen: true,
  bottomPanelTab: 'elevation', // 'elevation' | 'weather' | 'radiation' | 'dust'
  showLoadingScreen: true,
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarTab: (tab) => set({ sidebarTab: tab, sidebarOpen: true, isEVASimulating: false }),
  setBottomPanelOpen: (open) => set({ bottomPanelOpen: open }),
  setBottomPanelTab: (tab) => set({ bottomPanelTab: tab, bottomPanelOpen: true }),
  setShowLoadingScreen: (show) => set({ showLoadingScreen: show }),
  
  // Universal Back / Exit All Overlays action
  exitAllOverlays: () => set({
    isEVASimulating: false,
    isScienceLabOpen: false,
    isSkyEphemerisOpen: false,
    isFlightPlanOpen: false,
    isAudioRackOpen: false,
    isRoverDriving: false,
    isRulerActive: false,
    rulerPoints: []
  }),
}));

export default useMapStore;
