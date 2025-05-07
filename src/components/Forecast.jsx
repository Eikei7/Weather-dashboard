// src/components/Forecast.jsx - Animated Version
import { useEffect, useRef } from 'react';
import WeatherCard from './WeatherCard';
import { staggerElements } from '../utils/transitions';
import '../styles/Forecast.css';
import '../styles/animations.css';

const Forecast = ({ data, unit }) => {
  const containerRef = useRef(null);
  const forecastItemsRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Animate container on mount
    containerRef.current.classList.add('fade-in-up');
    
    // Animate forecast items with stagger effect
    if (forecastItemsRef.current) {
      const items = forecastItemsRef.current.querySelectorAll('.forecast-day');
      staggerElements(items, 'zoom-in', 150);
    }
  }, [data]);
  
  if (!data || !Array.isArray(data) || data.length === 0) return null;

  return (
    <div className="forecast" ref={containerRef}>
      <h3 className="forecast-title slide-in-left">5-Day Forecast</h3>
      
      <div className="forecast-container" ref={forecastItemsRef}>
        {data.map((day, index) => (
          <div key={index} className="forecast-day">
            <WeatherCard
              title={day.day}
              date={day.date}
              temperature={day.temp}
              description={day.description}
              icon={day.icon}
              humidity={day.humidity}
              windSpeed={day.windSpeed}
              unit={unit}
              isCompact={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forecast;