import axios from 'axios';

export interface CityCoordinates {
  lat: number;
  lng: number;
  displayName: string;
  country: string;
}

// Кеш для координат міст
const coordinatesCache = new Map<string, CityCoordinates>();

/**
 * Отримує координати міста за допомогою Nominatim API (OpenStreetMap)
 */
export async function getCityCoordinates(cityName: string): Promise<CityCoordinates | null> {
  const normalizedCity = cityName.toLowerCase().trim();
  
  console.log(`🔍 Searching coordinates for: ${cityName}`);
  
  // Перевіряємо кеш
  if (coordinatesCache.has(normalizedCity)) {
    console.log(`📍 Found in cache: ${cityName}`);
    return coordinatesCache.get(normalizedCity)!;
  }
  
  try {
    // Запит до Nominatim API
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: cityName,
        format: 'json',
        limit: 1,
        addressdetails: 1,
        'accept-language': 'uk,en'
      },
      timeout: 5000,
      headers: {
        'User-Agent': 'EuroTandemFORCE-Logistics-App/1.0'
      }
    });
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const coordinates: CityCoordinates = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
        country: result.address?.country || 'Unknown'
      };
      
      console.log(`✅ Found coordinates for ${cityName}:`, {
        lat: coordinates.lat,
        lng: coordinates.lng,
        country: coordinates.country
      });
      
      // Зберігаємо в кеш
      coordinatesCache.set(normalizedCity, coordinates);
      
      return coordinates;
    }
  } catch (error) {
    console.warn(`❌ Geocoding error for ${cityName}:`, error);
  }
  
  console.warn(`🚫 Could not find coordinates for: ${cityName}`);
  return null;
}

/**
 * Отримує координати для маршруту (від та до)
 */
export async function getRouteCoordinates(fromCity: string, toCity: string): Promise<{
  from: CityCoordinates | null;
  to: CityCoordinates | null;
}> {
  console.log(`🗺️ Getting route coordinates: ${fromCity} → ${toCity}`);
  
  const [from, to] = await Promise.all([
    getCityCoordinates(fromCity),
    getCityCoordinates(toCity)
  ]);
  
  return { from, to };
}

/**
 * Очищає кеш координат
 */
export function clearCoordinatesCache(): void {
  coordinatesCache.clear();
  console.log('🧹 Coordinates cache cleared');
} 