/**
 * Fetches a city photo using Google Places API via Netlify function
 * @param {string} cityName - The name of the city to get a photo for
 * @returns {Promise<string|null>} URL of the city photo or null if not found
 */
export async function getCityPhoto(cityName) {
  try {
    const response = await fetch(
      `/.netlify/functions/getCityPhoto?cityName=${encodeURIComponent(cityName)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from getCityPhoto function:', errorData);
      return null;
    }

    const data = await response.json();
    return data.photoUrl; // Return just the URL string
  } catch (error) {
    console.error('Error fetching city photo:', error);
    return null;
  }
}