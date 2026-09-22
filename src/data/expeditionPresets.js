// NASA Mars Expedition Presets Database
// Curated historical rover traverses and future human exploration paths

export const expeditionPresets = [
  {
    id: 'perseverance-jezero-delta',
    name: 'Perseverance: Jezero River Delta',
    mission: 'Mars 2020 / Human Precursor',
    category: 'Historical Rover & Human Exploration',
    description: 'Traverse across the ancient Jezero Crater lakebed, climbing up the river delta deposits to inspect ancient clay and silt layers that could preserve biosignatures.',
    distanceKm: 8.4,
    estHours: 4.8,
    targetRegion: 'Jezero Crater (18.44°N, 77.45°E)',
    center: [18.4447, 77.4508],
    zoom: 6,
    sciencePriority: 'Astrobiology & Lacustrine Biosignatures',
    waypoints: [
      { id: 'wp-jez-1', name: 'Octavia E. Butler Landing', lat: 18.4447, lon: 77.4508, elevation: -2570 },
      { id: 'wp-jez-2', name: 'Séítah Dune Field Margin', lat: 18.4410, lon: 77.4420, elevation: -2560 },
      { id: 'wp-jez-3', name: 'Three Forks Delta Inflow', lat: 18.4350, lon: 77.4250, elevation: -2540 },
      { id: 'wp-jez-4', name: 'Hawksbill Gap Outcrop', lat: 18.4420, lon: 77.4100, elevation: -2510 },
      { id: 'wp-jez-5', name: 'Skinner Ridge (Mudstone Layer)', lat: 18.4510, lon: 77.3980, elevation: -2480 },
      { id: 'wp-jez-6', name: 'Kodiak Remnant Butte Lookoff', lat: 18.4620, lon: 77.3850, elevation: -2420 },
      { id: 'wp-jez-7', name: 'Delta Top Ingress & Sample Cache', lat: 18.4730, lon: 77.3710, elevation: -2380 }
    ],
    timeline: [
      { time: '00:00', title: 'EVA Ingress & Systems Check', description: 'Suit pressure 29.6 kPa verified. Navigation beacon synced with Perseverance rover base.' },
      { time: '01:15', title: 'Séítah Sand Margin Crossing', description: 'Deploy penetrometer to measure soil compaction for rover wheel tractability.' },
      { time: '02:30', title: 'Three Forks Rock Coring', description: 'Extract core sample #01: Olivine-bearing cumulate rock with carbonate coatings.' },
      { time: '03:45', title: 'Hawksbill Fine-Grained Sediments', description: 'SuperCam Raman scan for aromatic organic molecules in lacustrine mudstone.' },
      { time: '04:45', title: 'Delta Top Depot Drop & Return', description: 'Deposit sealed titanium sample tube into ground depot for Mars Sample Return.' }
    ]
  },
  {
    id: 'olympus-mons-caldera',
    name: 'Human Mission 1: Olympus Mons Caldera Rim',
    mission: 'Artemis Mars / Expedition Alpha',
    category: 'High-Altitude Volcanic Traverse',
    description: 'An audacious high-altitude trek along the rim of the 21-km high Olympus Mons caldera shield. Traverses lava tube skylights and basaltic collapse terraces.',
    distanceKm: 14.2,
    estHours: 7.5,
    targetRegion: 'Tharsis Montes (18.65°N, -133.8°E)',
    center: [18.65, -133.8],
    zoom: 5,
    sciencePriority: 'Volcanology & Subsurface Lava Tube Shelters',
    waypoints: [
      { id: 'wp-oly-1', name: 'Camp Schiaparelli (Rim Base)', lat: 18.6500, lon: -133.8000, elevation: 21100 },
      { id: 'wp-oly-2', name: 'Caldera Pit Crater 1 Overlook', lat: 18.6200, lon: -133.7200, elevation: 21180 },
      { id: 'wp-oly-3', name: 'Basalt Fault Scarp Descent', lat: 18.5800, lon: -133.6500, elevation: 20950 },
      { id: 'wp-oly-4', name: 'Lava Tube Skylight Candidate #4', lat: 18.5200, lon: -133.5800, elevation: 21020 },
      { id: 'wp-oly-5', name: 'Summit Caldera Central Bench', lat: 18.4700, lon: -133.5100, elevation: 21287 }
    ],
    timeline: [
      { time: '00:00', title: 'Summit Depressurization Protocol', description: 'Near-vacuum ambient pressure (30 Pa). Supplementary thermal heating on suits enabled.' },
      { time: '02:00', title: 'Caldera Scarp Geophone Array', description: 'Deploy seismic spike sensors to monitor deep magma chamber resonance.' },
      { time: '04:30', title: 'Lava Tube LiDAR Profiling', description: 'Lower tethered drone into skylight to evaluate human habitat radiation shielding.' },
      { time: '07:00', title: 'Volcanic Glass Pyroclastic Sampling', description: 'Collect pristine unweathered basalt samples from innermost caldera collapse wall.' }
    ]
  },
  {
    id: 'curiosity-gale-sharp',
    name: 'Curiosity: Mount Sharp Stratigraphy',
    mission: 'Mars Science Laboratory',
    category: 'Historical Rover Route',
    description: 'Follow Curiosity\'s historic route from Bradbury Landing on the lakebed floor up into the sulfate and clay-bearing stratigraphy of Mount Sharp (Aeolis Mons).',
    distanceKm: 11.5,
    estHours: 6.2,
    targetRegion: 'Gale Crater (-4.59°S, 137.44°E)',
    center: [-4.5895, 137.4417],
    zoom: 6,
    sciencePriority: 'Paleo-Climatic Transition & Habitability',
    waypoints: [
      { id: 'wp-gal-1', name: 'Bradbury Landing Site', lat: -4.5895, lon: 137.4417, elevation: -4500 },
      { id: 'wp-gal-2', name: 'Yellowknife Bay (Mudstone Basin)', lat: -4.5920, lon: 137.4480, elevation: -4520 },
      { id: 'wp-gal-3', name: 'Dingo Gap Dune Pass', lat: -4.6150, lon: 137.4200, elevation: -4460 },
      { id: 'wp-gal-4', name: 'Murray Buttes Sandstone Mesas', lat: -4.6700, lon: 137.3800, elevation: -4310 },
      { id: 'wp-gal-5', name: 'Vera Rubin Ridge (Hematite Crest)', lat: -4.7200, lon: 137.3500, elevation: -4180 },
      { id: 'wp-gal-6', name: 'Sulfate-Bearing Layer Gateway', lat: -4.7600, lon: 137.3200, elevation: -3950 }
    ],
    timeline: [
      { time: '00:00', title: 'Traverse Departure from Bradbury', description: 'Review ancient river pebble conglomerate beds.' },
      { time: '01:45', title: 'Yellowknife Bay Habitability Drill', description: 'Verify past presence of neutral pH water, sulfur, nitrogen, oxygen, and carbon.' },
      { time: '03:30', title: 'Vera Rubin Ridge Spectrometry', description: 'APXS scan of crystalline hematite veins formed by groundwater percolation.' },
      { time: '06:00', title: 'Sulfate Unit Boundary Mapping', description: 'Document the transition from wet Mars (clays) to arid hyper-saline Mars (sulfates).' }
    ]
  },
  {
    id: 'valles-marineris-canyon',
    name: 'Valles Marineris: Melas Chasma Abyss',
    mission: 'Human Deep Reconnaissance',
    category: 'Canyon Descent & Layered Sediments',
    description: 'Explore the floor of Melas Chasma inside the largest canyon in the Solar System. High atmospheric pressure (~1,100 Pa) and dense morning ground fogs.',
    distanceKm: 18.0,
    estHours: 8.0,
    targetRegion: 'Melas Chasma (-9.8°S, -76.5°E)',
    center: [-9.8, -76.5],
    zoom: 5,
    sciencePriority: 'Deep Crustal Stratigraphy & Water Ice Seeps',
    waypoints: [
      { id: 'wp-val-1', name: 'Melas North Terrace Landing', lat: -9.5000, lon: -76.2000, elevation: -2800 },
      { id: 'wp-val-2', name: 'Landslide Debris Fan Apron', lat: -9.6500, lon: -76.3500, elevation: -3600 },
      { id: 'wp-val-3', name: 'Hydrated Sulfate Mound', lat: -9.8000, lon: -76.5000, elevation: -4200 },
      { id: 'wp-val-4', name: 'Chasma Deep Datum Floor', lat: -9.9500, lon: -76.6800, elevation: -4850 },
      { id: 'wp-val-5', name: 'Recurrent Slope Lineae (RSL) Bluff', lat: -10.100, lon: -76.8200, elevation: -4300 }
    ],
    timeline: [
      { time: '00:00', title: 'Descent from Canyon Shoulder', description: 'Optimal atmospheric pressure providing maximum cosmic ray shielding.' },
      { time: '02:30', title: 'Giant Landslide Breccia Survey', description: 'Measure colossal rock block sizes to model seismic collapse history.' },
      { time: '05:00', title: 'Deepest Point Atmospheric Station', description: 'Record highest Martian barometric reading (1,150 Pa) and relative humidity.' },
      { time: '07:30', title: 'Warm Season RSL Seep Inspection', description: 'Analyze dark slope streaks for hydrated perchlorate salt brine flow evidence.' }
    ]
  }
];
