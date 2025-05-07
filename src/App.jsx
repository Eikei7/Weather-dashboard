// src/App.jsx - With Dynamic Background
import { useState, useEffect, useRef } from 'react';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import LocationSearch from './components/LocationSearch';
import SavedLocations from './components/SavedLocations';
import WeatherMap from './components/WeatherMap';
import LastUpdated from './components/LastUpdated';
import DynamicBackground from './components/DynamicBackground';
import { fetchWeatherData, fetchForecastData } from './services/weatherAPI';
import { getUserLocation } from './utils/helpers';
import './styles/App.css';
import './styles/animations.css';

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [location, setLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric'); // 'metric' for Celsius, 'imperial' for Fahrenheit
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Refs for animated elements
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    // Animate header, content, and sidebar on mount
    if (headerRef.current) {
      headerRef.current.classList.add('fade-in-down');
    }
    
    if (contentRef.current) {
      contentRef.current.classList.add('fade-in');
    }
    
    if (sidebarRef.current) {
      sidebarRef.current.classList.add('slide-in-right');
    }
    
    // Load saved locations from localStorage on initial render
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }

    // Get saved unit preference
    const savedUnit = localStorage.getItem('unit');
    if (savedUnit) {
      setUnit(savedUnit);
    }

    // Try to get user's current location
    const loadInitialLocation = async () => {
      try {
        const userLocation = await getUserLocation();
        handleLocationSelect(userLocation);
      } catch (err) {
        console.error("Couldn't get current location:", err);
        // Default to a location if geolocation is denied
        handleLocationSelect({
          lat: 40.7128,
          lon: -74.0060,
          name: 'New York'
        });
      }
    };

    loadInitialLocation();
  }, []);

  useEffect(() => {
    // Save locations to localStorage whenever they change
    if (savedLocations.length > 0) {
      localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
    }
  }, [savedLocations]);

  useEffect(() => {
    // Save unit preference to localStorage
    localStorage.setItem('unit', unit);
  }, [unit]);

  const handleLocationSelect = async (locationData) => {
    // If there was already a location, animate the transition
    if (location) {
      setIsChangingLocation(true);
      
      // Add transition class to content container
      if (contentRef.current) {
        contentRef.current.classList.add('weather-change');
        
        // Wait for animation to finish before fetching new data
        setTimeout(() => {
          fetchLocationData(locationData);
          
          // Remove transition class after data is loaded
          setTimeout(() => {
            if (contentRef.current) {
              contentRef.current.classList.remove('weather-change');
            }
            setIsChangingLocation(false);
          }, 1000);
        }, 500);
      } else {
        fetchLocationData(locationData);
      }
    } else {
      // First load, no transition needed
      fetchLocationData(locationData);
    }
  };
  
  const fetchLocationData = async (locationData) => {
    setIsLoading(true);
    setError(null);
    setLocation(locationData);
  
    try {
      // Add debugging log here
      const weatherData = await fetchWeatherData(locationData, unit);
      console.log('Weather data with unit:', unit, weatherData);
      
      setCurrentWeather(weatherData);
      // Set last updated time from the weather data
      setLastUpdated(weatherData.lastUpdated);
  
      const forecastData = await fetchForecastData(locationData, unit);
      console.log('Forecast data with unit:', unit, forecastData); // Add this line too
      
      setForecast(forecastData.forecast);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error('Error fetching weather data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (location) {
      // Add refresh animation to content
      if (contentRef.current) {
        contentRef.current.classList.add('pulse');
        
        setTimeout(() => {
          contentRef.current.classList.remove('pulse');
        }, 1500);
      }
      
      handleLocationSelect(location);
    }
  };

  const handleUnitChange = (newUnit) => {
    if (unit === newUnit) return;
    
    // Add transition effect when changing units
    if (contentRef.current) {
      contentRef.current.classList.add('fade-in');
      
      setTimeout(() => {
        contentRef.current.classList.remove('fade-in');
      }, 500);
    }
    
    setUnit(newUnit);
    
    if (location) {
      handleLocationSelect(location);
    }
  };

  const addSavedLocation = (location) => {
    // Check if already saved
    if (!savedLocations.some(loc => loc.name === location.name)) {
      // Apply animation to sidebar when adding a location
      if (sidebarRef.current) {
        sidebarRef.current.classList.add('pulse');
        
        setTimeout(() => {
          sidebarRef.current.classList.remove('pulse');
        }, 1000);
      }
      
      setSavedLocations([...savedLocations, location]);
    }
  };

  const removeSavedLocation = (locationName) => {
    setSavedLocations(savedLocations.filter(loc => loc.name !== locationName));
  };

  return (
    <>
      {/* Dynamic background that changes based on weather conditions */}
      {currentWeather && (
        <DynamicBackground 
          weatherCode={currentWeather.icon} 
          sunrise={currentWeather.sunrise} 
          sunset={currentWeather.sunset}
        />
      )}
      
      <div className="app">
        <header className="app-header" ref={headerRef}>
          <h1>Weather Dashboard</h1>
          <LocationSearch onLocationSelect={handleLocationSelect} />
          <div className="header-controls">
            <div className="unit-toggle">
              <button 
                className={unit === 'metric' ? 'active' : ''} 
                onClick={() => handleUnitChange('metric')}
              >
                °C
              </button>
              <button 
                className={unit === 'imperial' ? 'active' : ''} 
                onClick={() => handleUnitChange('imperial')}
              >
                °F
              </button>
            </div>
            {/* <button className="refresh-button" onClick={handleRefresh}>
              Refresh Data
            </button> */}
          </div>
        </header>
        
        <main className="app-content" ref={contentRef}>
          {isLoading && (
            <div className="loading">
              <div className="loading-spinner"></div>
              <div className="loading-text fade-in">Loading weather data...</div>
            </div>
          )}
          
          {error && <div className="error shake">{error}</div>}
          
          {!isLoading && !error && currentWeather && !isChangingLocation && (
            <>
              <CurrentWeather 
                data={currentWeather} 
                location={location}
                unit={unit}
                onSave={() => addSavedLocation(location)}
              />
              
              {lastUpdated && <LastUpdated timestamp={lastUpdated} onRefresh={handleRefresh} />}
              
              {forecast && <Forecast data={forecast} unit={unit} />}
              
              {location && <WeatherMap location={location} />}
            </>
          )}
        </main>
        
        <aside className="app-sidebar" ref={sidebarRef}>
          <SavedLocations 
            locations={savedLocations} 
            onLocationSelect={handleLocationSelect}
            onLocationRemove={removeSavedLocation}
          />
        </aside>
      </div>
    </>
  );
}

export default App;