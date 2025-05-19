import { useState } from 'react'
import { searchLocations } from '../services/weatherAPI'
import '../styles/LocationSearch.css'

const LocationSearch = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!query.trim()) return
    
    setIsSearching(true)
    setError(null)
    
    try {
      const locations = await searchLocations(query)
      setSearchResults(locations)
      
      if (locations.length === 0) {
        setError('No locations found. Try a different search term.')
      }
    } catch (err) {
      setError('Error searching for locations. Please try again.')
      console.error(err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleLocationClick = (location) => {
    onLocationSelect(location)
    setSearchResults([]) // Clear results after selection
    setQuery('') // Clear search input
  }

  return (
    <div className="location-search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök på en ort..."
          aria-label="Sök på en ort"
        />
        <button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {searchResults.length > 0 && (
        <ul className="location-results">
          {searchResults.map((location, index) => (
            <li 
              key={`${location.name}-${location.country}-${index}`}
              onClick={() => handleLocationClick(location)}
            >
              {location.name}, {location.state && `${location.state}, `}{location.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LocationSearch