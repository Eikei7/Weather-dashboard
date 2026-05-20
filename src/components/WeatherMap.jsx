import React, { useEffect, useRef } from 'react'
import '../styles/WeatherMap.css'

const WeatherMap = ({ location }) => {
  const mapContainerRef = useRef(null)
  const iframeRef = useRef(null)

  useEffect(() => {
    if (!location || !mapContainerRef.current) return

    const container = mapContainerRef.current

    // Create iframe only once; reuse it on location changes
    if (!iframeRef.current) {
      container.innerHTML = ''
      const iframe = document.createElement('iframe')
      iframe.width = '100%'
      iframe.height = '100%'
      iframe.frameBorder = '0'
      iframe.style.border = '0'
      iframe.allowFullscreen = true
      container.appendChild(iframe)
      iframeRef.current = iframe
    }

    iframeRef.current.src = `https://www.openstreetmap.org/export/embed.html?bbox=${location.lon - 0.1}%2C${location.lat - 0.1}%2C${location.lon + 0.1}%2C${location.lat + 0.1}&layer=mapnik&marker=${location.lat}%2C${location.lon}`

    return () => {
      // Only clean up on unmount, not on every location change
    }
  }, [location])

  useEffect(() => {
    return () => {
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = ''
      }
      iframeRef.current = null
    }
  }, [])

  if (!location) return null

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

export default React.memo(WeatherMap)