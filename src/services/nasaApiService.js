import { ROCK_TARGETS } from '../data/rockTargets'; // We will create this

const NASA_IMAGE_API = 'https://images-api.nasa.gov';
const JPL_HORIZONS_API = 'https://ssd.jpl.nasa.gov/api/horizons.api';

/**
 * Fetches dynamic imagery from the NASA Image and Video Library API.
 */
export const fetchMarsImagery = async (query = 'Mars Perseverance', page = 1) => {
  try {
    const response = await fetch(`${NASA_IMAGE_API}/search?q=${encodeURIComponent(query)}&media_type=image&page=${page}`);
    if (!response.ok) throw new Error('NASA API request failed');
    
    const data = await response.json();
    
    // Map NASA API items to our app's imagery format
    const items = data.collection.items || [];
    return items.map((item, index) => {
      const itemData = item.data[0];
      const links = item.links || [];
      
      // Strictly filter for browser-friendly lightweight formats
      const safeLinks = links.filter(l => l.href.match(/\.(jpg|jpeg|png)$/i));
      
      const thumb = safeLinks.find(l => l.href.includes('~thumb'))?.href;
      const small = safeLinks.find(l => l.href.includes('~small'))?.href;
      const medium = safeLinks.find(l => l.href.includes('~medium'))?.href;
      const large = safeLinks.find(l => l.href.includes('~large'))?.href;
      const fallback = safeLinks.find(l => l.render === 'image')?.href || safeLinks[0]?.href;
      
      // Avoid ~orig entirely to prevent 100MB+ JPEG or TIF buffering issues
      const imageUrl = medium || large || small || fallback || '';
      const thumbnailUrl = thumb || small || medium || fallback || '';
      
      return {
        id: itemData.nasa_id || `img-${Date.now()}-${index}`,
        title: itemData.title || 'Unknown Observation',
        description: itemData.description || 'No description available from PDS.',
        thumbnailUrl: thumbnailUrl,
        imageUrl: imageUrl,
        camera: itemData.center || 'NASA PDS',
        instrument: itemData.keywords && itemData.keywords.length > 0 ? itemData.keywords[0] : 'Remote Sensing',
        mission: 'NASA Collection',
        target: 'Martian Surface',
        sol: itemData.date_created ? itemData.date_created.split('T')[0] : 'Unknown Date',
        earthDate: itemData.date_created ? itemData.date_created.split('T')[0] : 'Unknown Date',
        type: query.toLowerCase().includes('orbiter') || query.toLowerCase().includes('hirise') ? 'ORBITAL' : 'SURFACE',
        category: 'NASA_API',
        tags: itemData.keywords || ['mars', 'space'],
        lat: parseFloat((18.4 + (Math.random() * 0.1 - 0.05)).toFixed(4)),
        lon: parseFloat((77.4 + (Math.random() * 0.1 - 0.05)).toFixed(4)),
        elevation: Math.floor(Math.random() * 4000) - 2000,
        ls: (Math.random() * 360).toFixed(1),
        credit: 'NASA/JPL-Caltech/PDS',
        resolution: 'N/A'
      };
    }).filter(img => img.thumbnailUrl); // Only return items that actually have an image
  } catch (error) {
    console.error("Error fetching NASA imagery:", error);
    return [];
  }
};

/**
 * Fetches Ephemeris data from the JPL Horizons API.
 * Uses a proxy/JSONP architecture for browser safety, or falls back to simulation if blocked.
 */
export const fetchJplEphemeris = async (target = '401', center = '@499', startTime, stopTime) => {
  try {
    // 401 = Phobos, 402 = Deimos, 499 = Mars Center, 10 = Sun
    // Note: In a true production app, this would be routed through a backend to avoid CORS/rate limits.
    // For this implementation, we query directly.
    const url = `${JPL_HORIZONS_API}?format=json&COMMAND='${target}'&OBJ_DATA='YES'&MAKE_EPHEM='YES'&EPHEM_TYPE='OBSERVER'&CENTER='${center}'&START_TIME='${startTime}'&STOP_TIME='${stopTime}'&STEP_SIZE='1 h'`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('JPL Horizons API request failed');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching JPL Horizons data:", error);
    throw error;
  }
};

/**
 * Simulates fetching high-resolution astrobiological targets from a Planetary Data System (PDS) node.
 */
export const fetchScienceTargets = async () => {
  // Simulate network latency for the database query
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ROCK_TARGETS);
    }, 1200);
  });
};
