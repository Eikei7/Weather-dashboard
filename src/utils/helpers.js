/**
 * Convert temperature between Celsius and Fahrenheit
 * @param {number} temp - Temperature value
 * @param {string} toUnit - Target unit ('metric' for Celsius, 'imperial' for Fahrenheit)
 * @param {string} fromUnit - Source unit ('metric' for Celsius, 'imperial' for Fahrenheit)
 * @returns {number} - Converted temperature
 */
export const convertTemperature = (temp, toUnit, fromUnit = 'metric') => {
  // If temp is undefined or null, return as is
  if (temp === undefined || temp === null) return temp;
  
  // If units are the same, no conversion needed
  if (toUnit === fromUnit) return temp;
  
  // Convert Celsius to Fahrenheit
  if (fromUnit === 'metric' && toUnit === 'imperial') {
    return (temp * 9/5) + 32;
  }
  
  // Convert Fahrenheit to Celsius
  if (fromUnit === 'imperial' && toUnit === 'metric') {
    return (temp - 32) * 5/9;
  }
  
  // Default case (should not reach here)
  return temp;
};

/**
 * Format a temperature value with the appropriate unit
 * @param {number} temp - Temperature value
 * @param {string} unit - Temperature unit ('metric' or 'imperial')
 * @returns {string} - Formatted temperature string
 */
export const formatTemperature = (temp, unit = 'metric') => {
  if (temp === undefined || temp === null) return 'N/A';
  
  const roundedTemp = Math.round(temp);
  return unit === 'metric' 
    ? `${roundedTemp}°C` 
    : `${roundedTemp}°F`;
};

/**
 * Format a date object to a readable string format
 * @param {Date} date - Date object
 * @param {Object} options - Formatting options for toLocaleDateString
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  return new Date(date).toLocaleDateString('sv', mergedOptions);
};

/**
 * Format a time value from a unix timestamp
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {Object} options - Formatting options for toLocaleTimeString
 * @returns {string} - Formatted time string
 */
export const formatTime = (timestamp, options = {}) => {
  if (!timestamp) return 'N/A';
  
  const defaultOptions = { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  return new Date(timestamp * 1000).toLocaleTimeString('sv', mergedOptions);
};

/**
 * Get a readable description of wind direction from degrees
 * @param {number} degrees - Wind direction in degrees
 * @returns {string} - Wind direction description
 */
export const getWindDirection = (degrees) => {
  if (degrees === undefined || degrees === null) return 'N/A';
  
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 
    'E', 'ESE', 'SE', 'SSE', 
    'S', 'SSW', 'SW', 'WSW', 
    'W', 'WNW', 'NW', 'NNW'
  ];
  
  const index = Math.round((degrees % 360) / 22.5);
  return directions[index % 16];
};

/**
 * Format wind speed with the appropriate unit
 * @param {number} speed - Wind speed value
 * @param {string} unit - Speed unit ('metric' or 'imperial')
 * @returns {string} - Formatted wind speed string
 */
export const formatWindSpeed = (speed, unit = 'metric') => {
  if (speed === undefined || speed === null) return 'N/A';
  
  return unit === 'metric' 
    ? `${speed.toFixed(1)} m/s` 
    : `${speed.toFixed(1)} mph`;
};

/**
 * Get appropriate weather icon URL from OpenWeatherMap
 * @param {string} iconCode - OpenWeatherMap icon code
 * @param {string} size - Icon size (2x or 4x)
 * @returns {string} - Icon URL
 */
export const getWeatherIconUrl = (iconCode, size = '2x') => {
  if (!iconCode) return '';
  
  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
};

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get user's current location using browser geolocation API
 * @returns {Promise} - Promise that resolves to location coordinates
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          name: 'Current Location',
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};