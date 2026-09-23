import { create } from 'zustand';
import { getDefaultVisibleLayers } from '../data/marsLayers';
import { generateWeatherForSol, getSolFromDate } from '../data/weatherSimulation';
import { marsAudio } from '../utils/audioSynthesizer';

const initialSol = getSolFromDate();

const useMapStore = create((set, get) => ({
  // ========================
  // MAP STATE
  // ========================
  mapCenter: [0, 0], // Global Mars Equator & Prime Meridian
  mapZoom: 2,
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
  
  setWaypoints: (waypoints) => set({
    waypoints: Array.isArray(waypoints) ? waypoints.map(w => ({
      ...w,
      lon: w.lon !== undefined ? w.lon : (w.lng !== undefined ? w.lng : 0)
    })) : [],
    selectedWaypointId: waypoints && waypoints.length > 0 ? waypoints[0]?.id : null,
    driveTargetWaypointId: null,
    isRoverDriving: false,
    roverProgress: 0
  }),
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
  removeLastWaypoint: () => set((state) => {
    if (state.waypoints.length === 0) return {};
    const nextWaypoints = state.waypoints.slice(0, -1);
    return {
      waypoints: nextWaypoints,
      selectedWaypointId: nextWaypoints.length > 0 ? nextWaypoints[nextWaypoints.length - 1].id : null,
      isRoverDriving: false,
      roverProgress: 0,
    };
  }),
  undoLastPoint: () => set((state) => {
    if (state.isRulerActive && state.rulerPoints.length > 0) {
      return { rulerPoints: state.rulerPoints.slice(0, -1) };
    }
    if (state.waypoints.length > 0) {
      const nextWaypoints = state.waypoints.slice(0, -1);
      return {
        waypoints: nextWaypoints,
        selectedWaypointId: nextWaypoints.length > 0 ? nextWaypoints[nextWaypoints.length - 1].id : null,
        isRoverDriving: false,
        roverProgress: 0,
      };
    }
    return {};
  }),
  updateWaypoint: (id, updates) => set((state) => ({
    waypoints: state.waypoints.map(w => w.id === id ? { ...w, ...updates } : w)
  })),
  clearWaypoints: () => set({ waypoints: [], selectedWaypointId: null, driveTargetWaypointId: null, evaCurrentWaypointIndex: 0, isRoverDriving: false, roverProgress: 0 }),
  clearSelection: () => set({ selectedWaypointId: null, selectedPOI: null }),
  setPlacingWaypoint: (val) => set({ isPlacingWaypoint: val, isRulerActive: false }),
  setSelectedWaypoint: (id) => set({ selectedWaypointId: id }),
  reorderWaypoints: (newOrder) => set({ waypoints: newOrder }),

  // ========================
  // ROVER DRIVE SIMULATOR
  // ========================
  isRoverDriving: false,
  roverProgress: 0, // 0.0 to 1.0 along route
  driveTargetWaypointId: null, // specific waypoint ID for station-targeted simulation or null for full route
  roverCurrentPosition: null, // {lat, lon, bearing, elevation}
  roverSpeedKmh: 7.2,
  roverBatterySoC: 96, // %
  roverOdometerKm: 0,
  camFollow: true, // Auto-follow vehicle with camera during drive simulation
  
  setRoverDriving: (val) => {
    set({ isRoverDriving: val });
    if (val) {
      marsAudio.playQuindarTone(true);
    }
  },
  setDriveTargetWaypointId: (id) => set({ driveTargetWaypointId: id }),
  setRoverProgress: (prog) => set({ roverProgress: prog }),
  setRoverCurrentPosition: (pos) => set({ roverCurrentPosition: pos }),
  setRoverBatterySoC: (soc) => set({ roverBatterySoC: Math.max(0, Math.min(100, soc)) }),
  setRoverOdometerKm: (km) => set({ roverOdometerKm: km }),
  setCamFollow: (val) => set({ camFollow: val }),
  toggleCamFollow: () => set((state) => ({ camFollow: !state.camFollow })),

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
      waypoints: (preset.waypoints || []).map(w => ({
        ...w,
        lon: w.lon !== undefined ? w.lon : (w.lng !== undefined ? w.lng : 0)
      })),
      selectedWaypointId: preset.waypoints?.[0]?.id || null,
      driveTargetWaypointId: null,
      sidebarTab: 'route',
      sidebarOpen: true,
      isRoverDriving: false,
      roverProgress: 0,
      evaCurrentWaypointIndex: 0,
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
  // NASA HIRISE & ROVER RAW IMAGERY
  // ========================
  isImageryModalOpen: false,
  selectedImage: null,
  setImageryModalOpen: (val) => set((state) => {
    const next = typeof val === 'boolean' ? val : !state.isImageryModalOpen;
    return {
      isImageryModalOpen: next,
      ...(next ? { isScienceLabOpen: false, isSkyEphemerisOpen: false, isFlightPlanOpen: false, isEVASimulating: false } : {})
    };
  }),
  setSelectedImage: (img) => set({ selectedImage: img }),
  flyToCoordinate: (lat, lon, zoom = 4) => set({
    mapCenter: [lat, lon],
    mapZoom: zoom
  }),

  // ========================
  // UI STATE & OVERLAY CONTROLS
  // ========================
  sidebarOpen: true,
  sidebarTab: 'guide', // 'guide' | 'layers' | 'route' | 'poi' | 'mission'
  rightSidebarOpen: true,
  bottomPanelOpen: true,
  bottomPanelTab: 'elevation', // 'elevation' | 'weather' | 'radiation' | 'dust'
  showLoadingScreen: true,
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarTab: (tab) => set({ sidebarTab: tab, sidebarOpen: true, isEVASimulating: false }),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  setBottomPanelOpen: (open) => set({ bottomPanelOpen: open }),
  setBottomPanelTab: (tab) => set({ bottomPanelTab: tab, bottomPanelOpen: true }),
  setShowLoadingScreen: (show) => set({ showLoadingScreen: show }),
  
  // ========================
  // WHAT-IF CONTINGENCY SIMULATOR
  // ========================
  activeContingency: null, // null | 'spe' | 'dust_storm' | 'o2_leak' | 'rockfall'
  contingencyDetails: null,
  isContingencyModalOpen: false,

  triggerContingency: (type) => {
    const contingencyMap = {
      spe: {
        id: 'spe',
        title: 'Prompt Solar Particle Event (SPE)',
        badge: 'RADIATION CRITICAL',
        severity: 'CRITICAL',
        color: 'text-purple-400',
        bgColor: 'bg-purple-950/80',
        borderColor: 'border-purple-500/60',
        radiationMultiplier: 250, // surges to ~14 mSv/h
        tauMultiplier: 1.0,
        o2MarginMultiplier: 0.5,
        deadlineMinutes: 25,
        description: 'Coronal Mass Ejection shockwave detected by Mars Odyssey. Prompt relativistic protons incoming. Ambient surface dose rate spiking to 14.5 mSv/hr.',
        actionRequired: 'IMMEDIATE TRAVERSE ABORT: Direct return to regolith-shielded habitat within 25 minutes.',
      },
      dust_storm: {
        id: 'dust_storm',
        title: 'Severe Convective Dust Storm Inflow',
        badge: 'ATMOSPHERIC HAZARD',
        severity: 'HIGH',
        color: 'text-amber-400',
        bgColor: 'bg-amber-950/80',
        borderColor: 'border-amber-500/60',
        radiationMultiplier: 1.0,
        tauMultiplier: 4.8, // tau jumps above 2.8
        o2MarginMultiplier: 0.8,
        deadlineMinutes: 45,
        description: 'Rapid atmospheric opacity surge (tau > 2.8) and 28 m/s turbulent crosswinds detected. Ground visibility reduced below 40 meters. Solar array generation degraded by 80%.',
        actionRequired: 'ROVER SAFE MODE: Deploy RF homing beacon, curtail scientific sampling, and return via low-gradient valley floor.',
      },
      o2_leak: {
        id: 'o2_leak',
        title: 'Suit Secondary O₂ Tank Regulator Anomaly',
        badge: 'LIFE SUPPORT DEGRADED',
        severity: 'CRITICAL',
        color: 'text-red-400',
        bgColor: 'bg-red-950/80',
        borderColor: 'border-red-500/60',
        radiationMultiplier: 1.0,
        tauMultiplier: 1.0,
        o2MarginMultiplier: 0.35, // 65% loss
        deadlineMinutes: 40,
        description: 'Telemetry reports rapid pressure drop in Secondary Life Support Oxygen Loop. Primary reserves intact but safety walkback margin reduced from 5.0 km to 1.8 km.',
        actionRequired: 'MISSION TERMINATION: Abandon secondary science objectives immediately. Initiate expedited astronaut walkback.',
      },
      rockfall: {
        id: 'rockfall',
        title: 'Canyon Rim Scree Slide / Pass Impasse',
        badge: 'TERRAIN BLOCKED',
        severity: 'MEDIUM',
        color: 'text-orange-400',
        bgColor: 'bg-orange-950/80',
        borderColor: 'border-orange-500/60',
        radiationMultiplier: 1.0,
        tauMultiplier: 1.0,
        o2MarginMultiplier: 0.9,
        deadlineMinutes: 90,
        description: 'Fresh geological rockfall detected across the planned traverse corridor. Slope gradient at Checkpoint exceeds 29° with loose boulder talus unsuited for rover wheels.',
        actionRequired: 'AUTONOMOUS REROUTE: Reconfigure traverse around the northern terrace contour pass (+480m detour).',
      },
    };

    const details = contingencyMap[type] || contingencyMap.spe;
    set({
      activeContingency: type,
      contingencyDetails: details,
      isContingencyModalOpen: true,
    });
    marsAudio.playQuindarTone(false);
  },

  clearContingency: () => {
    set({
      activeContingency: null,
      contingencyDetails: null,
      isContingencyModalOpen: false,
    });
    marsAudio.playQuindarTone(true);
  },

  setContingencyModalOpen: (val) => set({ isContingencyModalOpen: val }),

  executeEmergencyReturn: () => {
    const state = get();
    const waypoints = state.waypoints || [];
    if (waypoints.length === 0) return;

    const baseCamp = waypoints[0];
    const currentPos = waypoints[Math.min(1, waypoints.length - 1)];

    // Generate direct return route back to base
    const abortWaypoints = [
      {
        id: `abort-origin-${Date.now()}`,
        name: `[ABORT START] Current Position`,
        lat: currentPos.lat,
        lon: currentPos.lon,
        elevation: currentPos.elevation,
        type: 'abort_origin',
      },
      {
        id: `abort-intermediate-${Date.now()}`,
        name: `[ABORT CORRIDOR] Emergency Low-Slope Egress`,
        lat: (currentPos.lat + baseCamp.lat) / 2,
        lon: (currentPos.lon + baseCamp.lon) / 2,
        elevation: (currentPos.elevation + baseCamp.elevation) / 2,
        type: 'abort_corridor',
      },
      {
        id: `abort-base-${Date.now()}`,
        name: `[PRIMARY REFUGE] ${baseCamp.name || 'Pressurized Basecamp'}`,
        lat: baseCamp.lat,
        lon: baseCamp.lon,
        elevation: baseCamp.elevation,
        type: 'abort_refuge',
      },
    ];

    set({
      waypoints: abortWaypoints,
      selectedWaypointId: abortWaypoints[0].id,
      isRoverDriving: true,
      roverProgress: 0,
      isContingencyModalOpen: false,
      sidebarTab: 'route',
      sidebarOpen: true,
    });
    marsAudio.playQuindarTone(true);
  },

  // Universal Back / Exit All Overlays action
  exitAllOverlays: () => set({
    isEVASimulating: false,
    isScienceLabOpen: false,
    isSkyEphemerisOpen: false,
    isFlightPlanOpen: false,
    isAudioRackOpen: false,
    isContingencyModalOpen: false,
    isRoverDriving: false,
    isRulerActive: false,
    rulerPoints: []
  }),
}));

export default useMapStore;
