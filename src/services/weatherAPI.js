// Replace with your actual API key from OpenWeatherMap
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'your_api_key_here';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

if (!API_KEY || API_KEY === 'your_api_key_here') {
  throw new Error('Missing OpenWeatherMap API key');
}

/**
 * Fetch current weather data for a location
 * @param {Object} location - Location object with lat and lon properties
 * @returns {Promise} - Promise that resolves to weather data
 */
export const fetchWeatherData = async (location) => {
  try {
    const response = await fetch(
      `../.netlify/functions/getWeather?lat=${location.lat}&lon=${location.lon}`
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
      `../.netlify/functions/getForecast?lat=${location.lat}&lon=${location.lon}`
    );
    
    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const forecastData = [];
    
    // Process the 5-day forecast (data comes in 3-hour increments)
    // Get one forecast per day at noon
    const dailyForecasts = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      const hour = date.getHours();
      
      // Try to get the noon forecast for each day
      if (!dailyForecasts[day] || Math.abs(hour - 12) < Math.abs(dailyForecasts[day].hour - 12)) {
        dailyForecasts[day] = {
          hour,
          forecast: {
            day,
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            temp: Math.round(item.main.temp),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed,
          }
        };
      }
    });
    
    // Convert to array and take only the first 5 days
    Object.values(dailyForecasts)
      .map(item => item.forecast)
      .slice(0, 5)
      .forEach(forecast => forecastData.push(forecast));
    
    return {
      forecast: forecastData,
      lastUpdated: new Date().toISOString() // Add timestamp for when data was fetched
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
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Location search API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return data.map(item => ({
      name: item.name,
      country: item.country,
      state: item.state,
      lat: item.lat,
      lon: item.lon
    }));
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