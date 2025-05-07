// src/components/DynamicBackground.jsx
import { useEffect, useState } from 'react';
import '../styles/DynamicBackground.css';

/**
 * A component that changes the app background based on weather conditions
 * and time of day
 */
const DynamicBackground = ({ weatherCode, sunset, sunrise }) => {
  const [timeOfDay, setTimeOfDay] = useState('day');
  
  useEffect(() => {
    // Determine if it's day or night based on current time and sunrise/sunset
    const determineTimeOfDay = () => {
      const currentTime = new Date().getTime();
      
      if (sunrise && sunset) {
        if (currentTime > sunrise && currentTime < sunset) {
          return 'day';
        } else {
          return 'night';
        }
      }
      
      // Fallback to system time if sunrise/sunset not available
      const hours = new Date().getHours();
      return (hours >= 6 && hours < 20) ? 'day' : 'night';
    };
    
    setTimeOfDay(determineTimeOfDay());
    
    // Update time of day every minute
    const interval = setInterval(() => {
      setTimeOfDay(determineTimeOfDay());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [sunrise, sunset]);
  
  // Determine background class based on weather code and time of day
  const getBackgroundClass = () => {
    if (!weatherCode) return `background-default-${timeOfDay}`;
    
    // OpenWeatherMap icon codes
    if (weatherCode.includes('01')) {
      return `background-clear-${timeOfDay}`;
    } 
    if (weatherCode.includes('02')) {
      return `background-few-clouds-${timeOfDay}`;
    }
    if (weatherCode.includes('03') || weatherCode.includes('04')) {
      return `background-clouds-${timeOfDay}`;
    }
    if (weatherCode.includes('09')) {
      return `background-shower-rain-${timeOfDay}`;
    }
    if (weatherCode.includes('10')) {
      return `background-rain-${timeOfDay}`;
    }
    if (weatherCode.includes('11')) {
      return `background-thunderstorm-${timeOfDay}`;
    }
    if (weatherCode.includes('13')) {
      return `background-snow-${timeOfDay}`;
    }
    if (weatherCode.includes('50')) {
      return `background-mist-${timeOfDay}`;
    }
    
    return `background-default-${timeOfDay}`;
  };
  
  return (
    <div className={`dynamic-background ${getBackgroundClass()}`}>
      <div className="overlay"></div>
    </div>
  );
};

export default DynamicBackground;