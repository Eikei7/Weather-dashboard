const CACHE_TTL = {
  weather: 10 * 60 * 1000,   // 10 minutes
  forecast: 30 * 60 * 1000,  // 30 minutes
  search: 60 * 60 * 1000,    // 1 hour
};

const cache = new Map();

function getCached(key, ttl) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * @param {Object} location
 * @returns {Promise}
 */
export const fetchWeatherData = async (location) => {
  const cacheKey = `weather:${location.lat}:${location.lon}`;
  const cached = getCached(cacheKey, CACHE_TTL.weather);
  if (cached) return cached;

  try {
    const response = await fetchWithTimeout(
      `/.netlify/functions/getData?lat=${location.lat}&lon=${location.lon}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const result = {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      pressure: data.main.pressure,
      icon: data.weather[0].icon,
      country: data.sys.country,
      city: data.name,
      sunrise: data.sys.sunrise * 1000,
      sunset: data.sys.sunset * 1000,
      lastUpdated: new Date().toISOString(),
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**

 * @param {Object} location
 * @returns {Promise}
 */
export const fetchForecastData = async (location) => {
  const cacheKey = `forecast:${location.lat}:${location.lon}`;
  const cached = getCached(cacheKey, CACHE_TTL.forecast);
  if (cached) return cached;

  try {
    const response = await fetchWithTimeout(
      `/.netlify/functions/getForecast?lat=${location.lat}&lon=${location.lon}`
    );

    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.statusText}`);
    }

    const data = await response.json();

    const result = {
      forecast: data.list, 
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw error;
  }
};

/**
 * @param {string} query
 * @returns {Promise}
 */
export const searchLocations = async (query) => {
  const cacheKey = `search:${query.toLowerCase().trim()}`;
  const cached = getCached(cacheKey, CACHE_TTL.search);
  if (cached) return cached;

  try {
    const response = await fetchWithTimeout(
      `/.netlify/functions/searchLocation?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Location search API error: ${response.statusText}`);
    }

    const data = await response.json();

    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

/**
 * @param {string} timestamp
 * @returns {string}
 */
export const formatLastUpdated = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp);
  
  return date.toLocaleString('sv', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};