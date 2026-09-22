// Mars Weather Simulation Engine
// Based on historical data from Curiosity REMS and Perseverance MEDA archives
// Generates realistic sol-by-sol weather conditions

// Mars seasons and Ls (Solar Longitude) reference
// Ls 0° = Northern spring equinox
// Ls 90° = Northern summer solstice
// Ls 180° = Northern autumn equinox
// Ls 270° = Northern winter solstice

const MARS_YEAR_SOLS = 668.6; // Mars year in sols

// Temperature ranges by season (°C) - based on Curiosity REMS data at Gale Crater
const SEASONAL_TEMPS = {
  spring: { min: -80, max: -10, avg: -45 },
  summer: { min: -70, max: 6, avg: -30 },
  autumn: { min: -85, max: -15, avg: -50 },
  winter: { min: -95, max: -25, avg: -65 },
};

// Dust storm probability by season (0-1)
const DUST_RISK = {
  spring: 0.15,
  summer: 0.45,  // Dust storm season peaks in southern spring/summer
  autumn: 0.65,  // Peak global dust storm risk
  winter: 0.20,
};

export function getSolFromDate(date = new Date()) {
  // Mars Sol Date calculation (MSD)
  // Reference: Allison & McEwen, 2000
  const millis = date.getTime();
  const jdUT = 2440587.5 + (millis / 86400000);
  const jdTT = jdUT + (69.184 / 86400);
  const deltaJ2000 = jdTT - 2451545.0;
  const msd = (deltaJ2000 - 4.5) / 1.0274912517 + 44796.0 - 0.00096;
  return Math.floor(msd);
}

export function getMarsTime(date = new Date()) {
  const msd = getSolFromDate(date);
  const mtc = (msd % 1) * 24; // Mars Coordinated Time (hours)
  const hours = Math.floor(mtc);
  const minutes = Math.floor((mtc - hours) * 60);
  return { msd, hours, minutes, formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} MTC` };
}

export function getSolarLongitude(sol) {
  // Approximate Ls from sol number
  const dayOfYear = sol % MARS_YEAR_SOLS;
  const ls = (dayOfYear / MARS_YEAR_SOLS) * 360;
  return ls % 360;
}

export function getMarsSeason(ls) {
  if (ls >= 0 && ls < 90) return 'spring';
  if (ls >= 90 && ls < 180) return 'summer';
  if (ls >= 180 && ls < 270) return 'autumn';
  return 'winter';
}

export function getSeasonName(season) {
  const names = {
    spring: 'Northern Spring / Southern Autumn',
    summer: 'Northern Summer / Southern Winter',
    autumn: 'Northern Autumn / Southern Spring',
    winter: 'Northern Winter / Southern Summer',
  };
  return names[season];
}

// Pseudo-random but deterministic based on sol number
function seededRandom(sol, offset = 0) {
  const x = Math.sin((sol + offset) * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function generateWeatherForSol(sol, lat = -4.59, elevation = -4500) {
  const ls = getSolarLongitude(sol);
  const season = getMarsSeason(ls);
  const temps = SEASONAL_TEMPS[season];
  
  // Random variation
  const r1 = seededRandom(sol, 1);
  const r2 = seededRandom(sol, 2);
  const r3 = seededRandom(sol, 3);
  const r4 = seededRandom(sol, 4);
  const r5 = seededRandom(sol, 5);

  // Temperature with latitude and elevation adjustments
  const latFactor = 1 - Math.abs(lat) / 90 * 0.3;
  const elevFactor = elevation / 10000 * 5; // ~0.5°C per km
  
  const tempMin = temps.min + (r1 * 15 - 7.5) + elevFactor;
  const tempMax = temps.max + (r2 * 10 - 5) * latFactor + elevFactor;
  const tempAvg = (tempMin + tempMax) / 2;

  // Atmospheric pressure (Pa) - varies with elevation and season
  // Mars average: ~636 Pa at datum
  const basePressure = 636 * Math.exp(-elevation / 10800); // barometric formula for Mars
  const pressureVariation = (r3 * 50 - 25) + (Math.sin(ls * Math.PI / 180) * 80); // seasonal CO₂ cycle
  const pressure = Math.round(basePressure + pressureVariation);

  // Wind
  const windSpeed = Math.round(2 + r4 * 25); // m/s
  const windDirection = Math.round(r5 * 360);
  const windDirectionName = getWindDirection(windDirection);

  // Dust opacity (tau)
  const baseTau = DUST_RISK[season];
  const tau = Math.round((baseTau + r1 * 0.3) * 100) / 100;
  const isDusty = tau > 0.5;

  // UV Index (relative scale 0-16, Mars gets ~40% of Earth's solar radiation)
  const uvBase = 8 * Math.cos(lat * Math.PI / 180);
  const uvIndex = Math.round(Math.max(0, uvBase * (1 - tau * 0.7) + (r2 * 2 - 1)) * 10) / 10;

  // Humidity (relative, very low on Mars)
  const humidity = Math.round(r3 * 5 * 10) / 10; // 0-5%

  // Sunrise/Sunset (approximate)
  const dayLength = 12.3 + Math.sin(ls * Math.PI / 180) * 1.5 * Math.cos(lat * Math.PI / 180);
  const sunrise = `${String(Math.floor(12 - dayLength / 2)).padStart(2, '0')}:${String(Math.round((12 - dayLength / 2) % 1 * 60)).padStart(2, '0')}`;
  const sunset = `${String(Math.floor(12 + dayLength / 2)).padStart(2, '0')}:${String(Math.round((12 + dayLength / 2) % 1 * 60)).padStart(2, '0')}`;

  return {
    sol,
    ls: Math.round(ls * 10) / 10,
    season,
    seasonName: getSeasonName(season),
    temperature: {
      min: Math.round(tempMin),
      max: Math.round(tempMax),
      avg: Math.round(tempAvg),
      unit: '°C',
    },
    pressure: {
      value: pressure,
      unit: 'Pa',
    },
    wind: {
      speed: windSpeed,
      direction: windDirection,
      directionName: windDirectionName,
      unit: 'm/s',
    },
    dust: {
      tau,
      isDusty,
      riskLevel: tau < 0.3 ? 'Low' : tau < 0.6 ? 'Moderate' : tau < 1.0 ? 'High' : 'Severe',
    },
    uvIndex,
    humidity,
    daylight: {
      sunrise,
      sunset,
      hoursOfLight: Math.round(dayLength * 10) / 10,
    },
  };
}

function getWindDirection(degrees) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(degrees / 22.5) % 16];
}

export function generateForecast(startSol, days = 7, lat, elevation) {
  return Array.from({ length: days }, (_, i) => 
    generateWeatherForSol(startSol + i, lat, elevation)
  );
}

// Dust storm season data (probability by Ls range)
export const dustStormSeasons = [
  { ls: [0, 30], risk: 0.10, label: 'Early Spring' },
  { ls: [30, 60], risk: 0.12, label: 'Mid Spring' },
  { ls: [60, 90], risk: 0.15, label: 'Late Spring' },
  { ls: [90, 120], risk: 0.20, label: 'Early Summer' },
  { ls: [120, 150], risk: 0.30, label: 'Mid Summer' },
  { ls: [150, 180], risk: 0.45, label: 'Late Summer' },
  { ls: [180, 210], risk: 0.55, label: 'Early Autumn' },
  { ls: [210, 240], risk: 0.70, label: 'Mid Autumn (Peak!)' },
  { ls: [240, 270], risk: 0.60, label: 'Late Autumn' },
  { ls: [270, 300], risk: 0.35, label: 'Early Winter' },
  { ls: [300, 330], risk: 0.20, label: 'Mid Winter' },
  { ls: [330, 360], risk: 0.12, label: 'Late Winter' },
];

export default {
  getSolFromDate,
  getMarsTime,
  getSolarLongitude,
  getMarsSeason,
  generateWeatherForSol,
  generateForecast,
  dustStormSeasons,
};
