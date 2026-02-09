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
  const apiKey = import.meta.env.WEATHER_API_KEY;
  
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.classList.add('fade-in-down');
    }
    
    if (contentRef.current) {
      contentRef.current.classList.add('fade-in');
    }
    
    if (sidebarRef.current) {
      sidebarRef.current.classList.add('slide-in-right');
    }
    
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }

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
      console.error("Kunde inte hämta din position:", err);
      setError('Misslyckades att hämta din position. Kontrollera webbläsarens behörigheter.');
      setIsLoading(false);
    }
  };

  const handleLocationSelect = async (locationData) => {
    if (location) {
      setIsChangingLocation(true);
      
      if (contentRef.current) {
        contentRef.current.classList.add('weather-change');
        
        setTimeout(() => {
          fetchLocationData(locationData);
          
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
      setLastUpdated(weatherData.lastUpdated);

      const forecastData = await fetchForecastData(locationData);
      setForecast(forecastData.forecast);
    } catch (err) {
      setError('Misslyckades med att hämta väderdata. Försök igen.');
      console.error('Fel när väderdata hämtades:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (location) {
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
    if (!savedLocations.some(loc => loc.name === location.name)) {
      
      setSavedLocations([...savedLocations, location]);
    }
  };

  const removeSavedLocation = (locationName) => {
    setSavedLocations(savedLocations.filter(loc => loc.name !== locationName));
  };

  return (
    <>
      {currentWeather && (
        <DynamicBackground 
          weatherCode={currentWeather.icon} 
          sunrise={currentWeather.sunrise} 
          sunset={currentWeather.sunset}
        />
      )}
      
      <div className="app">
        <header className="app-header" ref={headerRef}>
          <h1>🌅 Dagens väder 🌃</h1>
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
        </header>
        
        <main className="app-content" ref={contentRef}>
          {isLoading && (
            <div className="loading">
              <div className="cloud-spinner">
                <div className="rain">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="loading-text fade-in">Laddar väderdata...</div>
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
            apiKey={apiKey}
          />
        </aside>
      </div>
    </>
  );
}

export default App;