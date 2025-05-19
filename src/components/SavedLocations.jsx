import '../styles/SavedLocations.css'

const SavedLocations = ({ locations, onLocationSelect, onLocationRemove }) => {
  if (!locations || locations.length === 0) {
    return (
      <div className="saved-locations">
        <h3>Sparade platser</h3>
        <p className="no-locations">Inga sparade platser ännu.</p>
      </div>
    )
  }

  return (
    <div className="saved-locations">
      <h3>Sparade platser</h3>
      <ul className="location-list">
        {locations.map((location, index) => (
          <li key={`${location.name}-${index}`} className="location-item">
            <button 
              className="location-button" 
              onClick={() => onLocationSelect(location)}
            >
              {location.name}
              {location.country && `, ${location.country}`}
            </button>
            <button 
              className="remove-button" 
              onClick={(e) => {
                e.stopPropagation()
                onLocationRemove(location.name)
              }}
              aria-label={`Remove ${location.name}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SavedLocations