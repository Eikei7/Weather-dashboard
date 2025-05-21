// Weather API service module
// Note: This file runs in the browser, so we don't access process.env directly
// All API calls are proxied through Netlify functions

/**
 * Fetch current weather data for a location
 * @param {Object} location - Location object with lat and lon properties
 * @returns {Promise} - Promise that resolves to weather data
 */
export const fetchWeatherData = async (location) => {
  try {
    const response = await fetch(
      `/.netlify/functions/getData?lat=${location.lat}&lon=${location.lon}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      pressure: data.main.pressure,
      icon: data.weather[0].icon,
      country: data.sys.country,
      city: data.name,
      sunrise: data.sys.sunrise * 1000, // Convert to milliseconds
      sunset: data.sys.sunset * 1000,   // Convert to milliseconds
      lastUpdated: new Date().toISOString(), // Add timestamp for when data was fetched
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Fetch 5-day forecast data for a location
 * @param {Object} location - Location object with lat and lon properties
 * @returns {Promise} - Promise that resolves to forecast data
 */
export const fetchForecastData = async (location) => {
  try {
    const response = await fetch(
      `/.netlify/functions/getForecast?lat=${location.lat}&lon=${location.lon}`
    );

    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      forecast: data.list, 
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw error;
  }
};

/**
 * Search for locations based on city name
 * @param {string} query - Search query string (city name)
 * @returns {Promise} - Promise that resolves to an array of location objects
 */
export const searchLocations = async (query) => {
  try {
    const response = await fetch(`/.netlify/functions/searchLocation?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`Location search API error: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

/**
 * Format a timestamp into a readable date and time string
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} - Formatted date and time string
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