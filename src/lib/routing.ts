import axios from 'axios';
import { getRouteCoordinates } from './geocoding';

export interface RouteData {
  coordinates: [number, number][]; // [lng, lat]
  distance: number; // в метрах
  duration: number; // в секундах
}

/**
 * Перевіряє чи є відстань розумною для українських міст
 */
function validateUkrainianCityDistance(fromCity: string, toCity: string, distance: number): boolean {
  const ukrainianCities = [
    'київ', 'львів', 'одеса', 'харків', 'дніпро', 'запоріжжя', 'кривий ріг', 
    'миколаїв', 'маріуполь', 'луганськ', 'вінниця', 'макіївка', 'сімферополь',
    'херсон', 'полтава', 'чернігів', 'черкаси', 'житомир', 'суми', 'хмельницький',
    'чернівці', 'ровно', 'кропивницький', 'івано-франківськ', 'кременчук', 'тернопіль',
    'луцьк', 'біла церква', 'краматорськ', 'мелітополь', 'керч', 'нікополь',
    'бердянськ', 'ужгород', 'славянськ', 'алчевськ', 'павлоград', 'сєвєродонецьк',
    'лисичанськ', 'евпаторія', 'каменское', 'александрия', 'красный луч', 'енакиево',
    'стрий', 'новая каховка', 'измаил', 'константиновка', 'дрогобыч', 'балаклея',
    'мукачево', 'умань', 'коломыя', 'яремче', 'бердичев', 'белая церковь',
    'оржів', 'оржев'
  ];
  
  const fromLower = fromCity.toLowerCase().trim();
  const toLower = toCity.toLowerCase().trim();
  
  const isFromUkrainian = ukrainianCities.some(city => fromLower.includes(city) || city.includes(fromLower));
  const isToUkrainian = ukrainianCities.some(city => toLower.includes(city) || city.includes(toLower));
  
  // Якщо обидва міста українські, відстань не повинна перевищувати 1500 км
  if (isFromUkrainian && isToUkrainian && distance > 1500000) { // 1500 км в метрах
    console.warn(`🚫 Suspicious distance for Ukrainian cities: ${fromCity} → ${toCity} = ${Math.round(distance/1000)}km`);
    return false;
  }
  
  return true;
}

/**
 * Отримує маршрут між двома містами використовуючи динамічний геокодінг
 */
export async function getRoute(fromCity: string, toCity: string): Promise<RouteData> {
  console.log(`🛣️ Getting route from ${fromCity} to ${toCity}`);
  
  // Отримуємо координати міст через геокодінг API
  const { from, to } = await getRouteCoordinates(fromCity, toCity);
  
  console.log(`📍 Coordinates found:`, {
    from: from ? `${from.lat}, ${from.lng} (${from.country})` : 'null',
    to: to ? `${to.lat}, ${to.lng} (${to.country})` : 'null'
  });
  
  if (!from || !to) {
    console.warn(`❌ Could not find coordinates for cities: ${fromCity} -> ${from?.country}, ${toCity} -> ${to?.country}`);
    
    // Fallback координати для України/Європи
    const defaultFrom: [number, number] = from ? [from.lng, from.lat] : [30.5234, 50.4501]; // Київ
    const defaultTo: [number, number] = to ? [to.lng, to.lat] : [13.4050, 52.5200]; // Берлін
    const estimatedDistance = calculateStraightLineDistance(defaultFrom, defaultTo) * 1000 * 1.5;
    
    return {
      coordinates: [defaultFrom, defaultTo],
      distance: estimatedDistance,
      duration: Math.round(estimatedDistance / 1000 * 50)
    };
  }

  // Конвертуємо координати в формат [lng, lat] для API
  const fromCoords: [number, number] = [from.lng, from.lat];
  const toCoords: [number, number] = [to.lng, to.lat];

  try {
    // Спробуємо спочатку OSRM API (безкоштовний і не потребує ключа)
    try {
      console.log(`🔄 Trying OSRM API for ${fromCity} -> ${toCity}`);
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${fromCoords[0]},${fromCoords[1]};${toCoords[0]},${toCoords[1]}`,
        {
          params: {
            overview: 'full',
            geometries: 'geojson'
          },
          timeout: 8000,
        }
      );

      if (response.data?.routes?.[0]) {
        const route = response.data.routes[0];
        const coordinates = route.geometry.coordinates;
        const distance = Math.round(route.distance || 0);
        
        console.log(`✅ OSRM success: ${coordinates.length} points, ${Math.round(distance/1000)}km`);

        // Валідуємо відстань для українських міст
        if (!validateUkrainianCityDistance(fromCity, toCity, distance)) {
          console.warn(`🔧 Using corrected distance for ${fromCity} → ${toCity}`);
          const correctedDistance = getCorrectedUkrainianDistance(fromCity, toCity, fromCoords, toCoords);
          return {
            coordinates: coordinates,
            distance: correctedDistance,
            duration: Math.round(correctedDistance / 1000 * 50)
          };
        }

        return {
          coordinates: coordinates,
          distance: distance,
          duration: Math.round(route.duration || 0)
        };
      }
    } catch (osrmError) {
      console.warn('⚠️ OSRM API error, trying MapBox...', osrmError);
      
      // Fallback до MapBox API
      try {
        console.log(`🔄 Trying MapBox API for ${fromCity} -> ${toCity}`);
        const response = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${fromCoords[0]},${fromCoords[1]};${toCoords[0]},${toCoords[1]}`,
          {
            params: {
              geometries: 'geojson',
              access_token: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
            },
            timeout: 8000,
          }
        );

        if (response.data?.routes?.[0]) {
          const route = response.data.routes[0];
          const coordinates = route.geometry.coordinates;
          
          console.log(`✅ MapBox success: ${coordinates.length} points, ${Math.round(route.distance/1000)}km`);

          return {
            coordinates: coordinates,
            distance: Math.round(route.distance || 0),
            duration: Math.round(route.duration || 0)
          };
        }
      } catch (mapboxError) {
        console.warn('⚠️ MapBox API also failed:', mapboxError);
      }
    }
  } catch (error) {
    console.warn('❌ All routing APIs failed:', error);
  }

  // Якщо всі API не працюють, повертаємо пряму лінію з реальними координатами
  console.log(`📏 Using straight line fallback for ${fromCity} -> ${toCity}`);
  const straightDistance = calculateStraightLineDistance(fromCoords, toCoords) * 1000 * 1.3; // +30% для дорожніх умов
  
  // Створюємо прямий маршрут з проміжними точками
  const midPoint: [number, number] = [
    (fromCoords[0] + toCoords[0]) / 2,
    (fromCoords[1] + toCoords[1]) / 2
  ];
  
  return {
    coordinates: [fromCoords, midPoint, toCoords],
    distance: straightDistance,
    duration: Math.round(straightDistance / 1000 * 50) // приблизно 50 км/год
  };
}

/**
 * Розраховує пряму відстань між точками за формулою гаверсинуса
 */
function calculateStraightLineDistance(
  [lng1, lat1]: [number, number], 
  [lng2, lat2]: [number, number]
): number {
  const R = 6371; // Радіус Землі в км
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Повертає коригованої відстані для українських міст
 */
function getCorrectedUkrainianDistance(
  fromCity: string, 
  toCity: string, 
  fromCoords: [number, number], 
  toCoords: [number, number]
): number {
  const from = fromCity.toLowerCase().trim();
  const to = toCity.toLowerCase().trim();
  
  // Відомі відстані між українськими містами (в метрах)
  const knownDistances: Record<string, number> = {
    'львів-луцьк': 150000,
    'луцьк-львів': 150000,
    'львів-київ': 540000,
    'київ-львів': 540000,
    'львів-івано-франківськ': 135000,
    'івано-франківськ-львів': 135000,
    'львів-тернопіль': 120000,
    'тернопіль-львів': 120000,
    'львів-ужгород': 265000,
    'ужгород-львів': 265000,
    'луцьк-київ': 395000,
    'київ-луцьк': 395000,
    'оржів-київ': 380000,
    'київ-оржів': 380000,
    'оржів-львів': 420000,
    'львів-оржів': 420000,
  };
  
  // Шукаємо точну відстань
  const key1 = `${from}-${to}`;
  const key2 = `${to}-${from}`;
  
  if (knownDistances[key1]) {
    console.log(`📏 Using known distance for ${fromCity} → ${toCity}: ${knownDistances[key1]/1000}km`);
    return knownDistances[key1];
  }
  
  if (knownDistances[key2]) {
    console.log(`📏 Using known distance for ${fromCity} → ${toCity}: ${knownDistances[key2]/1000}km`);
    return knownDistances[key2];
  }
  
  // Якщо немає точної відстані, використовуємо пряму лінію з коефіцієнтом 1.4
  const straightDistance = calculateStraightLineDistance(fromCoords, toCoords) * 1000 * 1.4;
  console.log(`📏 Using calculated distance for ${fromCity} → ${toCity}: ${Math.round(straightDistance/1000)}km`);
  return Math.round(straightDistance);
}

/**
 * Кешування маршрутів для оптимізації
 */
const routeCache = new Map<string, RouteData>();

export async function getCachedRoute(fromCity: string, toCity: string): Promise<RouteData> {
  const cacheKey = `${fromCity.toLowerCase()}-${toCity.toLowerCase()}`;
  
  console.log(`💾 getCachedRoute: ${cacheKey}`);
  
  if (routeCache.has(cacheKey)) {
    console.log(`🎯 Route found in cache: ${cacheKey}`);
    return routeCache.get(cacheKey)!;
  }
  
  console.log(`🆕 Route not cached, fetching: ${cacheKey}`);
  const route = await getRoute(fromCity, toCity);
  routeCache.set(cacheKey, route);
  
  console.log(`💾 Route cached: ${cacheKey}, ${Math.round(route.distance/1000)}km, ${route.coordinates.length} points`);
  return route;
}

/**
 * Очищає кеш маршрутів
 */
export function clearRouteCache(): void {
  routeCache.clear();
  console.log('🧹 Route cache cleared');
} 