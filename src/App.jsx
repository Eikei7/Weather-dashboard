import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import LocationSearch from './components/LocationSearch';
import SavedLocations from './components/SavedLocations';
import LastUpdated from './components/LastUpdated';
import DynamicBackground from './components/DynamicBackground';
import ErrorBoundary from './components/ErrorBoundary';
import { fetchWeatherData, fetchForecastData } from './services/weatherAPI';
import { getUserLocation } from './utils/helpers';
import './styles/App.css';
import './styles/animations.css';

const WeatherMap = lazy(() => import('./components/WeatherMap'));

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [location, setLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const sidebarRef = useRef(null);
  const requestIdRef = useRef(0);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (savedLocations.length > 0) {
      localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
    }
  }, [savedLocations]);

  const handleGetCurrentLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      const userLocation = await getUserLocation();
      handleLocationSelect(userLocation);
    } catch (err) {
      console.error("Kunde inte hämta din position:", err);
      setError('Misslyckades att hämta din position. Kontrollera webbläsarens behörigheter.');
      setIsLoading(false);
    }
  }, []);

  const fetchLocationData = useCallback(async (locationData) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    setLocation(locationData);

    try {
      const [weatherData, forecastData] = await Promise.all([
        fetchWeatherData(locationData),
        fetchForecastData(locationData),
      ]);

      if (requestId !== requestIdRef.current) return;

      setCurrentWeather(weatherData);
      setLastUpdated(weatherData.lastUpdated);
      setForecast(forecastData.forecast);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError('Misslyckades med att hämta väderdata. Försök igen.');
      console.error('Fel när väderdata hämtades:', err);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    if (headerRef.current) headerRef.current.classList.add('fade-in-down');
    if (contentRef.current) contentRef.current.classList.add('fade-in');
    if (sidebarRef.current) sidebarRef.current.classList.add('slide-in-right');

    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }

    fetchLocationData({
      lat: 40.7128,
      lon: -74.0060,
      name: 'New York'
    });
  }, [fetchLocationData]);

  const handleLocationSelect = useCallback(async (locationData) => {
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
  }, [location, fetchLocationData]);

  const handleRefresh = useCallback(() => {
    if (location) {
      if (contentRef.current) {
        contentRef.current.classList.add('pulse');
        
        setTimeout(() => {
          contentRef.current.classList.remove('pulse');
        }, 1500);
      }
      
      handleLocationSelect(location);
    }
  }, [location, handleLocationSelect]);

  const addSavedLocation = useCallback((location) => {
    setSavedLocations(prev => {
      if (prev.some(loc => loc.name === location.name)) return prev;
      return [...prev, location];
    });
  }, []);

  const removeSavedLocation = useCallback((locationName) => {
    setSavedLocations(prev => prev.filter(loc => loc.name !== locationName));
  }, []);

  return (
    <ErrorBoundary>
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
            <h1>Dagens väder</h1>
            <div className="search-container">
              <LocationSearch onLocationSelect={handleLocationSelect} />
              <button 
                className="my-location-button"
                onClick={handleGetCurrentLocation}
                aria-label="Get my location"
              >
                <img src="/location.png" alt="Location Icon" loading="lazy" />
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
                
                {location && (
                  <Suspense fallback={<div className="map-loading">Laddar karta...</div>}>
                    <WeatherMap location={location} />
                  </Suspense>
                )}
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
          <p className='credits'>Made by <a href="https://frontend-erik.se" target='_blank' rel="noopener noreferrer">Erik Karlsson</a></p>
        </div>
      </>
    </ErrorBoundary>
  );
}

export default App;