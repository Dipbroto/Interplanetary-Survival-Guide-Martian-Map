// Elevation Service for Mars
// Simulates elevation data based on MOLA topography
// In production, this would query actual MOLA DEM tiles

import { marsDistance } from './marsUtils';

// Known elevation reference points (from MOLA data)
const ELEVATION_REFS = [
  { lat: 18.65, lon: -133.8, elev: 21229, name: 'Olympus Mons' },
  { lat: 1.48, lon: -112.88, elev: 14058, name: 'Pavonis Mons' },
  { lat: 11.92, lon: -104.79, elev: 18225, name: 'Ascraeus Mons' },
  { lat: -8.35, lon: -120.09, elev: 17761, name: 'Arsia Mons' },
  { lat: 25.02, lon: 147.21, elev: 14028, name: 'Elysium Mons' },
  { lat: -14.0, lon: -59.2, elev: -5000, name: 'Valles Marineris' },
  { lat: -42.4, lon: 70.5, elev: -7152, name: 'Hellas Basin' },
  { lat: -4.59, lon: 137.44, elev: -4500, name: 'Gale Crater' },
  { lat: 18.44, lon: 77.45, elev: -2600, name: 'Jezero Crater' },
  { lat: 4.50, lon: 135.62, elev: -2613, name: 'Elysium Planitia' },
  { lat: 22.27, lon: -49.97, elev: -3627, name: 'Chryse Planitia' },
  { lat: -1.95, lon: -5.53, elev: -1440, name: 'Meridiani Planum' },
  { lat: 47.67, lon: 134.04, elev: -4505, name: 'Utopia Planitia' },
  { lat: 87.0, lon: 0.0, elev: -5000, name: 'North Pole' },
  { lat: -87.0, lon: 0.0, elev: 1500, name: 'South Pole' },
  { lat: 0, lon: 0, elev: -1500, name: 'Arabia Terra' },
  { lat: -20, lon: -45, elev: 3000, name: 'Tharsis Rise' },
  { lat: 40, lon: -10, elev: -3800, name: 'Acidalia Planitia' },
  { lat: -50, lon: -30, elev: 1500, name: 'Noachis Terra' },
  { lat: 30, lon: 100, elev: -3500, name: 'Isidis Planitia' },
];

// Inverse Distance Weighting interpolation for elevation
export function getElevation(lat, lon) {
  let weightSum = 0;
  let elevSum = 0;
  const power = 2.5;

  for (const ref of ELEVATION_REFS) {
    const dist = marsDistance(lat, lon, ref.lat, ref.lon);
    if (dist < 1) return ref.elev; // Very close to a known point
    
    const weight = 1 / Math.pow(dist, power);
    weightSum += weight;
    elevSum += weight * ref.elev;
  }

  // Add some procedural variation for realism
  const noise = pseudoNoise(lat, lon) * 500 - 250;
  return Math.round(elevSum / weightSum + noise);
}

// Generate elevation profile along a route
export function getElevationProfile(waypoints, numSamples = 100) {
  if (waypoints.length < 2) return [];

  const profile = [];
  let totalDistance = 0;

  // Calculate segment distances
  const segments = [];
  for (let i = 1; i < waypoints.length; i++) {
    const dist = marsDistance(
      waypoints[i - 1].lat, waypoints[i - 1].lon,
      waypoints[i].lat, waypoints[i].lon
    );
    segments.push({ from: waypoints[i - 1], to: waypoints[i], distance: dist });
    totalDistance += dist;
  }

  if (totalDistance === 0) return [];

  // Sample along the route
  const sampleInterval = totalDistance / numSamples;
  let currentDist = 0;
  let segIndex = 0;
  let segDist = 0;

  for (let i = 0; i <= numSamples; i++) {
    const targetDist = i * sampleInterval;

    // Find which segment this sample falls in
    while (segIndex < segments.length - 1 && segDist + segments[segIndex].distance < targetDist) {
      segDist += segments[segIndex].distance;
      segIndex++;
    }

    const seg = segments[segIndex];
    const t = seg.distance > 0 ? (targetDist - segDist) / seg.distance : 0;
    const clampedT = Math.max(0, Math.min(1, t));

    const sampleLat = seg.from.lat + (seg.to.lat - seg.from.lat) * clampedT;
    const sampleLon = seg.from.lon + (seg.to.lon - seg.from.lon) * clampedT;
    const elevation = getElevation(sampleLat, sampleLon);

    profile.push({
      distance: Math.round(targetDist * 100) / 100,
      elevation,
      lat: Math.round(sampleLat * 10000) / 10000,
      lon: Math.round(sampleLon * 10000) / 10000,
      lng: Math.round(sampleLon * 10000) / 10000,
      segmentIndex: segIndex,
    });
  }

  // Calculate slopes between samples
  for (let i = 1; i < profile.length; i++) {
    const dElev = profile[i].elevation - profile[i - 1].elevation;
    const dDist = (profile[i].distance - profile[i - 1].distance) * 1000; // km to m
    profile[i].slope = dDist > 0 ? Math.atan2(dElev, dDist) * (180 / Math.PI) : 0;
  }
  if (profile.length > 0) profile[0].slope = 0;

  return profile;
}

// Get profile statistics
export function getProfileStats(profile) {
  if (profile.length === 0) return null;

  const elevations = profile.map(p => p.elevation);
  const slopes = profile.map(p => Math.abs(p.slope || 0));

  let elevGain = 0;
  let elevLoss = 0;
  for (let i = 1; i < profile.length; i++) {
    const diff = profile[i].elevation - profile[i - 1].elevation;
    if (diff > 0) elevGain += diff;
    else elevLoss += Math.abs(diff);
  }

  const totDist = profile[profile.length - 1]?.distance || 0;

  return {
    minElevation: Math.min(...elevations),
    maxElevation: Math.max(...elevations),
    avgElevation: Math.round(elevations.reduce((a, b) => a + b, 0) / (elevations.length || 1)),
    elevationGain: Math.round(elevGain),
    elevationLoss: Math.round(elevLoss),
    gain: Math.round(elevGain),
    loss: Math.round(elevLoss),
    distance: totDist,
    totalDistance: totDist,
    maxSlope: Math.round(Math.max(...slopes) * 10) / 10,
    avgSlope: Math.round((slopes.reduce((a, b) => a + b, 0) / (slopes.length || 1)) * 10) / 10,
  };
}

// Simple 2D noise function for terrain variation
function pseudoNoise(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export default {
  getElevation,
  getElevationProfile,
  getProfileStats,
};
