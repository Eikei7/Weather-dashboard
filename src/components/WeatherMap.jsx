import { useEffect, useRef } from 'react'
import '../styles/WeatherMap.css'

const WeatherMap = ({ location }) => {
  const mapContainerRef = useRef(null)
  
  useEffect(() => {
    if (!location || !mapContainerRef.current) return
    
    // Clear previous map
    mapContainerRef.current.innerHTML = ''
    
    // Create an iframe for OpenStreetMap
    const iframe = document.createElement('iframe')
    
    // Set the map URL with the location coordinates
    iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${location.lon-0.1}%2C${location.lat-0.1}%2C${location.lon+0.1}%2C${location.lat+0.1}&layer=mapnik&marker=${location.lat}%2C${location.lon}`
    
    iframe.width = '100%'
    iframe.height = '100%'
    iframe.frameBorder = '0'
    iframe.allowFullscreen = true
    iframe.ariaHidden = 'false'
    iframe.tabIndex = '0'
    
    // Append the iframe to the container
    mapContainerRef.current.appendChild(iframe)
    
    // Cleanup function
    return () => {
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = ''
      }
    }
  }, [location])
  
  if (!location) {
    return null
  }
  
  return (
    <div className="weather-map">
      <h3>Karta</h3>
      <div className="map-container" ref={mapContainerRef}>
        <div className="map-loading">Laddar karta...</div>
      </div>
      <div className="map-footer">
        <p>Plats: {location.name}</p>
        <p>Koordinater: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
      </div>
    </div>
  )
}

export default WeatherMap