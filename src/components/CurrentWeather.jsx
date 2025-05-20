import { useEffect, useRef, useState } from 'react';
import { formatDate } from '../utils/helpers';
import { animateValue, staggerElements } from '../utils/transitions';
import { getCityPhoto } from '../services/cityPhotoService';
import '../styles/CurrentWeather.css';
import '../styles/animations.css';

const CurrentWeather = ({ data, location, onSave }) => {
  const containerRef = useRef(null);
  const detailsRef = useRef(null);
  const tempValueRef = useRef(null);
  const prevTempRef = useRef(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  
  // Fetch city photo when location changes
  useEffect(() => {
    const fetchCityPhoto = async () => {
      if (location && (location.name || (data && data.city))) {
        setIsLoadingPhoto(true);
        try {
          const cityName = location.name || data.city;
          const photoUrl = await getCityPhoto(cityName);
          if (photoUrl) {
            setBackgroundImage(photoUrl);
          }
        } catch (error) {
          console.error('Error loading city photo:', error);
        } finally {
          setIsLoadingPhoto(false);
        }
      }
    };
    
    fetchCityPhoto();
  }, [location, data]);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Animate container on mount
    containerRef.current.classList.add('fade-in-up');
    
    // Animate weather details with stagger effect
    if (detailsRef.current) {
      const detailItems = detailsRef.current.querySelectorAll('.detail-item');
      staggerElements(detailItems, 'slide-in-right', 100);
    }
    
    // Animate temperature change
    if (tempValueRef.current && data) {
      const prevTemp = prevTempRef.current || data.temperature;
      animateValue(prevTemp, data.temperature, (value) => {
        if (tempValueRef.current) {
          tempValueRef.current.textContent = `${Math.round(value)}°C`;
        }
      }, 1000);
      prevTempRef.current = data.temperature;
    }
  }, [data]);
  
  if (!data) return null;

  const {
    temperature,
    feelsLike,
    description,
    humidity,
    windSpeed,
    pressure,
    icon,
    sunrise,
    sunset,
    city,
    country
  } = data;

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('sv', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const currentDate = formatDate(new Date(), { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Create styles for background image
  const backgroundStyle = backgroundImage ? {
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.21), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white'
  } : {};

  return (
    <div 
      className={`current-weather ${isLoadingPhoto ? 'loading-photo' : ''}`} 
      ref={containerRef}
      style={backgroundStyle}
    >
      <div className="weather-header">
        <div className="location-info">
          <h2 className="fade-in-down">{city || location.name}{country ? `, ${country}` : ''}</h2>
          <p className="date fade-in">{currentDate}</p>
        </div>
        <button onClick={onSave} className="save-button">
          Spara plats
        </button>
      </div>

      <div className="weather-content">
        <div className="temperature-display">
          <div className="temp-icon zoom-in">
            <img 
              src={`https://openweathermap.org/img/wn/${icon}@4x.png`} 
              alt={description} 
            />
          </div>
          <div className="temp-info">
            <h3 className="temp-value" ref={tempValueRef}>
              {temperature}°C
            </h3>
            <p className="temp-description fade-in">
              {description}
            </p>
            <p className="feels-like fade-in">
              Känns som: {feelsLike}°C
            </p>
          </div>
        </div>
      </div>

      <div className="weather-details" ref={detailsRef}>
        <div className="detail-item">
          <span className="detail-label">Luftfuktighet</span>
          <span className="detail-value">{humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Vind</span>
          <span className="detail-value">
            {windSpeed} m/s
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Lufttryck</span>
          <span className="detail-value">{pressure} hPa</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Soluppgång</span>
          <span className="detail-value">{formatTime(sunrise)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Solnedgång</span>
          <span className="detail-value">{formatTime(sunset)}</span>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;