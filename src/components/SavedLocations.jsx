// src/components/SavedLocations.jsx - Using Netlify function
import { useState, useEffect } from 'react';
import '../styles/SavedLocations.css';

const SavedLocations = ({ locations, onLocationSelect, onLocationRemove }) => {
  const [locationWeather, setLocationWeather] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to fetch weather for all locations using the Netlify function
  const fetchWeatherForLocations = async (locations) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/.netlify/functions/getSavedLocationWeather', {
        method: 'POST',
        body: JSON.stringify({ locations }),
      });
      
      if (!response.ok) {
        throw new Error(`Function error: ${response.statusText}`);
      }
      
      const { weatherData } = await response.json();
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to check if cached data is valid (less than 1 hour old)
  const isCacheValid = (timestamp) => {
    if (!timestamp) return false;
    
    const now = new Date().getTime();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    return now - timestamp < oneHour;
  };
  
  // Load cached weather data from localStorage
  useEffect(() => {
    const loadCachedWeather = () => {
      try {
        const cachedData = localStorage.getItem('savedLocationsWeather');
        if (cachedData) {
          setLocationWeather(JSON.parse(cachedData));
        }
      } catch (error) {
        console.error('Error loading cached weather data:', error);
      }
    };
    
    loadCachedWeather();
  }, []);
  
  // Fetch weather data for locations that need updates
  useEffect(() => {
    if (!locations || locations.length === 0) return;
    
    const updateWeather = async () => {
      // Find locations that need to be updated
      const locationsToUpdate = locations.filter(location => {
        const locationKey = `${location.lat}-${location.lon}`;
        const existingData = locationWeather[locationKey];
        return !existingData || !isCacheValid(existingData.timestamp);
      });
      
      if (locationsToUpdate.length === 0) {
        return; // No locations need updating
      }
      
      // Fetch weather for locations that need updates
      const newWeatherData = await fetchWeatherForLocations(locationsToUpdate);
      
      if (newWeatherData) {
        // Merge new data with existing data
        const updatedWeather = { ...locationWeather, ...newWeatherData };
        setLocationWeather(updatedWeather);
        localStorage.setItem('savedLocationsWeather', JSON.stringify(updatedWeather));
      }
    };
    
    updateWeather();
    
    // Set up hourly refresh
    const intervalId = setInterval(() => {
      updateWeather();
    }, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(intervalId);
  }, [locations, locationWeather]);
  
  if (!locations || locations.length === 0) {
    return (
      <div className="saved-locations">
        <h3>Sparade platser</h3>
        <p className="no-locations">Inga sparade platser ännu.</p>
      </div>
    );
  }
  
  // Helper to get weather for a location
  const getWeatherForLocation = (location) => {
    const locationKey = `${location.lat}-${location.lon}`;
    return locationWeather[locationKey];
  };

  return (
    <div className="saved-locations">
      <h3>Sparade platser</h3>
      <ul className="location-list">
        {locations.map((location, index) => {
          const weather = getWeatherForLocation(location);
          
          return (
            <li key={`${location.name}-${index}`} className="location-item">
              <button 
                className="location-button" 
                onClick={() => onLocationSelect(location)}
              >
                <span className="location-name">
                  {location.name}
                  {location.country && `, ${location.country}`}
                </span>
                
                {weather && (
                  <span className="location-weather">
                    {weather.icon && (
                      <img 
                        src={`https://openweathermap.org/img/wn/${weather.icon}.png`} 
                        alt="Weather icon" 
                        className="location-weather-icon" 
                      />
                    )}
                    <span className="location-temp">{weather.temp}°C</span>
                  </span>
                )}
                
                {!weather && isLoading && (
                  <span className="location-weather loading">
                    <span className="loading-dot"></span>
                  </span>
                )}
              </button>
              <button 
                className="remove-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  onLocationRemove(location.name);
                }}
                aria-label={`Remove ${location.name}`}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SavedLocations;