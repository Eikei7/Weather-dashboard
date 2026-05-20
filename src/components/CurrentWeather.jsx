import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../utils/helpers';
import '../styles/CurrentWeather.css';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.1 
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

const CurrentWeather = ({ data, location, onSave }) => {
  if (!data) return null;

  const {
    temperature, feelsLike, description, humidity,
    windSpeed, pressure, icon, sunrise, sunset, city, country
  } = data;

  const currentDate = formatDate(new Date(), {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('sv', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <motion.div 
      className="weather-card-modern"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="weather-header">
        <div className="location-info">
          <motion.h2 variants={itemVariants}>
            {city || location?.name}{country ? `, ${country}` : ''}
          </motion.h2>
          <p className="date-badge">{currentDate}</p>
        </div>
        <button onClick={onSave} className="save-btn-glass">
          <span>Spara plats</span>
        </button>
      </header>

      <div className="weather-main-content">
        <motion.div 
          className="temp-visual"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
        >
          <img 
            src={`https://openweathermap.org/img/wn/${icon}@4x.png`} 
            alt={description}
            loading="lazy"
          />
        </motion.div>

        <div className="temp-details">
          <motion.div className="main-temp" variants={itemVariants}>
             {/* Enkel animation för siffran */}
             <motion.span>{Math.round(temperature)}</motion.span>°C
          </motion.div>
          <p className="description-text">{description}</p>
          <p className="feels-like-text">Känns som {Math.round(feelsLike)}°C</p>
        </div>
      </div>

      <motion.div className="weather-grid" variants={containerVariants}>
        {[
          { label: 'Luftfuktighet', value: `${humidity}%` },
          { label: 'Vind', value: `${windSpeed} m/s` },
          { label: 'Tryck', value: `${pressure} hPa` },
          { label: 'Soluppgång', value: formatTime(sunrise) },
          { label: 'Solnedgång', value: formatTime(sunset) },
        ].map((stat, i) => (
          <motion.div key={i} className="grid-item-glass" variants={itemVariants}>
            <span className="label">{stat.label}</span>
            <span className="value">{stat.value}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default React.memo(CurrentWeather);