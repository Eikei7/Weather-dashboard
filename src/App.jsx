// src/App.jsx - With Location Button
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
  const [lastUpdated, setLastUpdated] = useState(null);
  const [defaultLocationLoaded, setDefaultLocationLoaded] = useState(false);
  
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

    // Instead of requesting location automatically, load a default city
    if (!defaultLocationLoaded) {
      handleLocationSelect({
        lat: 40.7128,
        lon: -74.0060,
        name: 'New York'
      });
      setDefaultLocationLoaded(true);
    }
  }, [defaultLocationLoaded]);

  useEffect(() => {
    // Save locations to localStorage whenever they change
    if (savedLocations.length > 0) {
      localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
    }
  }, [savedLocations]);

  const handleGetCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const userLocation = await getUserLocation();
      handleLocationSelect(userLocation);
    } catch (err) {
      console.error("Couldn't get current location:", err);
      setError('Failed to get your location. Please check your browser permissions.');
      setIsLoading(false);
    }
  };

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
      const weatherData = await fetchWeatherData(locationData);
      setCurrentWeather(weatherData);
      // Set last updated time from the weather data
      setLastUpdated(weatherData.lastUpdated);

      const forecastData = await fetchForecastData(locationData);
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
          <div className="search-container">
            <LocationSearch onLocationSelect={handleLocationSelect} />
            <button 
              className="my-location-button"
              onClick={handleGetCurrentLocation}
              aria-label="Get my location"
            >
              <img src="/location.png" alt="Location Icon" />
            </button>
          </div>
          <div className="header-controls">
            <button className="refresh-button" onClick={handleRefresh}>
              Refresh Data
            </button>
          </div>
        </header>
        
        <main className="app-content" ref={contentRef}>
          {isLoading && (
            <div className="loading">
              {/* Cloud spinner animation */}
              <div className="cloud-spinner">
                <div className="rain">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="loading-text fade-in">Loading weather data...</div>
            </div>
          )}
          
          {error && <div className="error shake">{error}</div>}
          
          {!isLoading && !error && currentWeather && !isChangingLocation && (
            <>
              <CurrentWeather 
                data={currentWeather} 
                location={location}
                onSave={() => addSavedLocation(location)}
              />
              
              {lastUpdated && <LastUpdated timestamp={lastUpdated} onRefresh={handleRefresh} />}
              
              {forecast && <Forecast data={forecast} />}
              
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