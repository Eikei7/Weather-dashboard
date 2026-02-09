/**
 * @param {Object} location
 * @returns {Promise}
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
      sunrise: data.sys.sunrise * 1000,
      sunset: data.sys.sunset * 1000,
      lastUpdated: new Date().toISOString(),
    };
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
 * @param {string} query
 * @returns {Promise}
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