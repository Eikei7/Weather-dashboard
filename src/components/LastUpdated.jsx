// src/components/LastUpdated.jsx
import { formatLastUpdated } from '../services/weatherAPI';
import '../styles/LastUpdated.css';

const LastUpdated = ({ timestamp, onRefresh }) => {
  return (
    <div className="last-updated">
      <div className="last-updated-info">
        <span className="last-updated-label">Weather Data last fetched:</span>
        <span className="last-updated-time">{formatLastUpdated(timestamp)}</span>
      </div>
      
      {onRefresh && (
        <button 
          className="refresh-button"
          onClick={onRefresh}
          aria-label="Refresh weather data"
        >
          Refresh
        </button>
      )}
    </div>
  );
};

export default LastUpdated;