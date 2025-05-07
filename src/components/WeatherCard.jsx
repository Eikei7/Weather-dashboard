import { useEffect, useRef } from 'react';
import { formatTemperature, getWeatherIconUrl } from '../utils/helpers';
import { animateValue } from '../utils/transitions';
import '../styles/WeatherCard.css';
import '../styles/animations.css';

/**
 * A reusable card component for displaying weather information
 * Now with animations!
 */
const WeatherCard = ({ 
  title,
  date,
  temperature,
  feelsLike,
  description,
  icon,
  humidity,
  windSpeed,
  unit = 'metric',
  isCompact = false,
  animationDelay = 0
}) => {
  const cardRef = useRef(null);
  const tempValueRef = useRef(null);
  const iconRef = useRef(null);
  const prevTempRef = useRef(null);
  
  useEffect(() => {
    // Skip animations if no refs
    if (!cardRef.current) return;
    
    // Add animation class with delay
    const timer = setTimeout(() => {
      cardRef.current.classList.add('fade-in');
      
      // Animate icon
      if (iconRef.current) {
        iconRef.current.classList.add('zoom-in');
      }
    }, animationDelay);
    
    // Animate temperature change
    if (tempValueRef.current && temperature !== undefined) {
      const prevTemp = prevTempRef.current || temperature;
      animateValue(prevTemp, temperature, (value) => {
        if (tempValueRef.current) {
          tempValueRef.current.textContent = formatTemperature(Math.round(value), unit);
        }
      }, 1000);
      prevTempRef.current = temperature;
    }
    
    return () => clearTimeout(timer);
  }, [temperature, unit, animationDelay]);
  
  // Add weather-specific classes based on icon code
  const getWeatherClass = (iconCode) => {
    if (!iconCode) return '';
    
    if (iconCode.includes('01')) return 'weather-clear';
    if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return 'weather-clouds';
    if (iconCode.includes('09') || iconCode.includes('10')) return 'weather-rain';
    if (iconCode.includes('11')) return 'weather-thunderstorm';
    if (iconCode.includes('13')) return 'weather-snow';
    if (iconCode.includes('50')) return 'weather-mist';
    
    return '';
  };

  return (
    <div 
      className={`weather-card ${isCompact ? 'compact' : ''} ${getWeatherClass(icon)}`} 
      ref={cardRef}
    >
      {title && <h3 className="card-title">{title}</h3>}
      
      {date && <div className="card-date">{date}</div>}
      
      <div className="card-main">
        {icon && (
          <div className="card-icon" ref={iconRef}>
            <img 
              src={getWeatherIconUrl(icon, isCompact ? '2x' : '4x')} 
              alt={description || 'weather icon'} 
              className="weather-icon-img"
            />
          </div>
        )}
        
        <div className="card-temp">
          <div className="temp-value" ref={tempValueRef}>
            {formatTemperature(temperature, unit)}
          </div>
          {feelsLike && (
            <div className="feels-like">
              Feels like: {formatTemperature(feelsLike, unit)}
            </div>
          )}
        </div>
      </div>
      
      {description && (
        <div className="card-description">
          {description}
        </div>
      )}
      
      {(humidity || windSpeed) && (
        <div className="card-details">
          {humidity && (
            <div className="detail-item">
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{humidity}%</span>
            </div>
          )}
          
          {windSpeed && (
            <div className="detail-item">
              <span className="detail-label">Wind</span>
              <span className="detail-value">
                {unit === 'metric' ? `${windSpeed} m/s` : `${windSpeed} mph`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherCard;