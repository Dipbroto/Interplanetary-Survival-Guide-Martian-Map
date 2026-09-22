// Mars-specific utility calculations
// All formulas use real Mars parameters

export const MARS = {
  RADIUS_KM: 3389.5,        // Mean radius in km
  RADIUS_M: 3389500,        // Mean radius in meters
  GRAVITY: 3.721,           // Surface gravity m/s²
  SOL_HOURS: 24.6597,       // Hours per sol
  SOL_SECONDS: 88775.244,   // Seconds per sol
  YEAR_SOLS: 668.6,         // Sols per Mars year
  YEAR_DAYS: 686.97,        // Earth days per Mars year
  ATMOSPHERE_PRESSURE: 636, // Average surface pressure in Pa
  SCALE_HEIGHT: 10800,      // Atmospheric scale height in meters
  SURFACE_TEMP_AVG: -63,    // Average surface temperature °C
  CO2_PERCENT: 95.32,       // Atmospheric CO₂ percentage
};

// Distance calculation using Haversine formula with Mars radius
export function marsDistance(lat1, lon1, lat2, lon2) {
  const R = MARS.RADIUS_KM;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Returns km
}

// Calculate total route distance from array of waypoints [{lat, lon}]
export function routeDistance(waypoints) {
  let total = 0;
  for (let i = 1; i < waypoints.length; i++) {
    total += marsDistance(
      waypoints[i - 1].lat, waypoints[i - 1].lon,
      waypoints[i].lat, waypoints[i].lon
    );
  }
  return total;
}

// Slope calculation between two points
export function calculateSlope(elev1, elev2, distanceM) {
  if (distanceM === 0) return 0;
  const rise = elev2 - elev1;
  const slopeDeg = Math.atan2(rise, distanceM) * (180 / Math.PI);
  return slopeDeg;
}

// Slope difficulty rating
export function slopeDifficulty(slopeDeg) {
  const abs = Math.abs(slopeDeg);
  if (abs < 5) return { level: 'Easy', color: '#22c55e', description: 'Flat to gentle slope. Safe for EVA.' };
  if (abs < 10) return { level: 'Moderate', color: '#eab308', description: 'Noticeable slope. Use caution.' };
  if (abs < 15) return { level: 'Steep', color: '#f97316', description: 'Steep terrain. Increased energy expenditure.' };
  if (abs < 25) return { level: 'Very Steep', color: '#ef4444', description: 'Very steep. Significant fall hazard.' };
  return { level: 'Extreme', color: '#dc2626', description: 'Extremely steep. Not recommended for EVA.' };
}

// EVA time estimate based on terrain and distance
export function estimateEVATime(distanceKm, avgSlopeDeg, conditions = 'normal') {
  // Average astronaut walking speed on Mars: ~2 km/h on flat terrain
  // Mars gravity is 38% of Earth, but suits are bulky
  const baseSpeed = 2.0; // km/h
  
  // Slope penalty
  const slopePenalty = 1 + Math.abs(avgSlopeDeg) * 0.05;
  
  // Condition penalty
  const conditionPenalty = {
    'normal': 1.0,
    'dusty': 1.2,
    'rocky': 1.3,
    'sandy': 1.4,
  }[conditions] || 1.0;

  const effectiveSpeed = baseSpeed / (slopePenalty * conditionPenalty);
  const travelHours = distanceKm / effectiveSpeed;
  
  // Add 30% margin for science stops, rest, and safety
  const totalHours = travelHours * 1.3;
  
  return {
    travelHours: Math.round(travelHours * 100) / 100,
    totalHours: Math.round(totalHours * 100) / 100,
    effectiveSpeed: Math.round(effectiveSpeed * 100) / 100,
  };
}

// Atmospheric pressure at elevation
export function pressureAtElevation(elevationM) {
  return MARS.ATMOSPHERE_PRESSURE * Math.exp(-elevationM / MARS.SCALE_HEIGHT);
}

// Radiation dose estimation
// Based on RAD instrument data from Curiosity
export function estimateRadiation(durationHours, elevationM) {
  // Surface GCR dose rate: ~0.67 mSv/day (from RAD data)
  const baseDoseRate = 0.67 / 24; // mSv per hour
  
  // Atmospheric shielding varies with elevation
  // Lower = more atmosphere = more shielding
  const columnDensity = Math.exp(-elevationM / MARS.SCALE_HEIGHT);
  const shieldingFactor = 1 / columnDensity; // Higher elevation = less shielding
  
  const adjustedRate = baseDoseRate * shieldingFactor;
  const totalDose = adjustedRate * durationHours;
  
  return {
    doseRate: Math.round(adjustedRate * 1000) / 1000, // mSv/hr
    totalDose: Math.round(totalDose * 100) / 100,     // mSv
    dailyDose: Math.round(adjustedRate * 24 * 100) / 100, // mSv/day
    annualDose: Math.round(adjustedRate * 24 * 365),   // mSv/year
    nasaCareerLimit: 600, // mSv (NASA career limit)
    daysToLimit: Math.round(600 / (adjustedRate * 24)),
  };
}

// O₂ consumption estimate
export function estimateO2Consumption(durationHours, activityLevel = 'moderate') {
  // EVA O₂ consumption rates (kg/hour)
  const rates = {
    'rest': 0.02,
    'light': 0.04,
    'moderate': 0.06,
    'heavy': 0.09,
  };
  
  const rate = rates[activityLevel] || rates['moderate'];
  const total = rate * durationHours;
  
  return {
    ratePerHour: rate,
    totalKg: Math.round(total * 100) / 100,
    totalLiters: Math.round(total * 700 * 100) / 100, // ~700 L per kg O₂
  };
}

// Water consumption estimate
export function estimateWaterConsumption(durationHours) {
  // ~0.5 L/hour during EVA
  const rate = 0.5;
  return {
    ratePerHour: rate,
    totalLiters: Math.round(rate * durationHours * 100) / 100,
  };
}

// Power consumption estimate for EVA suit
export function estimatePowerConsumption(durationHours, tempC = -60) {
  // Base suit power: ~200 W
  // Heating increases with cold
  const basePower = 200; // Watts
  const heatingPower = Math.max(0, (-tempC - 20) * 3); // Extra watts for heating below -20°C
  const totalPower = basePower + heatingPower;
  const energyWh = totalPower * durationHours;
  
  return {
    powerWatts: Math.round(totalPower),
    energyWh: Math.round(energyWh),
    energyKWh: Math.round(energyWh / 1000 * 100) / 100,
  };
}

// Mars Date/Time
export function marsDateFromEarthDate(earthDate = new Date()) {
  const millis = earthDate.getTime();
  const jdUT = 2440587.5 + (millis / 86400000);
  const jdTT = jdUT + (69.184 / 86400);
  const deltaJ2000 = jdTT - 2451545.0;
  const msd = (deltaJ2000 - 4.5) / 1.0274912517 + 44796.0 - 0.00096;
  
  const marsYear = Math.floor((msd - 0) / MARS.YEAR_SOLS) + 1;
  const solOfYear = Math.floor(msd % MARS.YEAR_SOLS);
  const mtcHours = (msd % 1) * 24;
  
  return {
    msd: Math.floor(msd),
    marsYear,
    solOfYear,
    totalSol: Math.floor(msd),
    time: {
      hours: Math.floor(mtcHours),
      minutes: Math.floor((mtcHours % 1) * 60),
      seconds: Math.floor(((mtcHours * 60) % 1) * 60),
    },
    formatted: `MY${marsYear} Sol ${solOfYear}`,
    timeFormatted: `${String(Math.floor(mtcHours)).padStart(2, '0')}:${String(Math.floor((mtcHours % 1) * 60)).padStart(2, '0')} MTC`,
  };
}

// Sol to Earth days conversion
export function solsToEarthDays(sols) {
  return sols * 1.0274912517;
}

export function earthDaysToSols(days) {
  return days / 1.0274912517;
}

// Coordinate formatting
export function formatCoordinate(lat, lon) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
}

// Helper
function toRad(deg) {
  return deg * (Math.PI / 180);
}

export default {
  MARS,
  marsDistance,
  routeDistance,
  calculateSlope,
  slopeDifficulty,
  estimateEVATime,
  pressureAtElevation,
  estimateRadiation,
  estimateO2Consumption,
  estimateWaterConsumption,
  estimatePowerConsumption,
  marsDateFromEarthDate,
  formatCoordinate,
};
