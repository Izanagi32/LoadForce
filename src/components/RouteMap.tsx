'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CargoItem } from '@/types/calculation';
import { getCachedRoute } from '@/lib/routing';
import { clearCoordinatesCache } from '@/lib/geocoding';

// Динамічний імпорт Leaflet
const L = typeof window !== 'undefined' ? require('leaflet') : null;

interface RouteMapProps {
  cargo: CargoItem[];
  className?: string;
  onRouteUpdate?: (cargoId: string, distance: number) => void;
}

// Кеш координат міст
const cityCoordinatesCache = new Map<string, [number, number]>();

const getCityCoordinates = async (cityName: string): Promise<[number, number] | null> => {
  if (cityCoordinatesCache.has(cityName)) {
    return cityCoordinatesCache.get(cityName)!;
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      cityCoordinatesCache.set(cityName, coords);
      return coords;
    }
  } catch (error) {
    console.error('Error geocoding city:', cityName, error);
  }
  
  return null;
};

export default function RouteMap({ cargo, className = '', onRouteUpdate }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const mapLayersRef = useRef<Map<string, any>>(new Map());
  
  const [routes, setRoutes] = useState<Map<string, any>>(new Map());
  const [loadingRoutes, setLoadingRoutes] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Очистка всіх шарів
  const clearAllLayers = useCallback(() => {
    if (!mapInstanceRef.current) return;
    
    const map = mapInstanceRef.current;
    
    // Видаляємо всі збережені шари
    mapLayersRef.current.forEach((layer) => {
      try {
        map.removeLayer(layer);
      } catch (error) {
        // Ігноруємо помилки при видаленні
      }
    });
    
    mapLayersRef.current.clear();
    
    // Очищаємо всі маркери та лінії що могли залишитися
    map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });
  }, []);

  // Ініціалізація карти
  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined' || !L) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        preferCanvas: true // Покращує продуктивність
      }).setView([50.4501, 30.5234], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
      
      setIsInitialized(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsInitialized(false);
      }
    };
  }, []);

  // Завантаження маршрутів
  useEffect(() => {
    if (!isInitialized || cargo.length === 0) return;

    const loadAllRoutes = async () => {
      // Завантажуємо маршрути доставки
      for (const item of cargo) {
        const routeKey = `${item.loadingPoint}-${item.unloadingPoint}`;
        
        if (!routes.has(routeKey)) {
          setLoadingRoutes(prev => new Set([...prev, routeKey]));
          
          try {
            const routeData = await getCachedRoute(item.loadingPoint, item.unloadingPoint);
            setRoutes(prev => new Map(prev.set(routeKey, routeData)));
            
            // Оновлюємо відстань
            if (onRouteUpdate) {
              const distanceKm = Math.round(routeData.distance / 1000);
              onRouteUpdate(item.id, distanceKm);
            }
          } catch (error) {
            console.error('Route loading failed:', routeKey, error);
          } finally {
            setLoadingRoutes(prev => {
              const newSet = new Set(prev);
              newSet.delete(routeKey);
              return newSet;
            });
          }
        }
      }

      // Завантажуємо маршрути переїздів
      for (let i = 0; i < cargo.length - 1; i++) {
        const from = cargo[i].unloadingPoint;
        const to = cargo[i + 1].loadingPoint;
        
        if (from.toLowerCase() !== to.toLowerCase()) {
          const repositionKey = `reposition-${from}-${to}`;
          
          if (!routes.has(repositionKey)) {
            setLoadingRoutes(prev => new Set([...prev, repositionKey]));
            
            try {
              const routeData = await getCachedRoute(from, to);
              setRoutes(prev => new Map(prev.set(repositionKey, routeData)));
            } catch (error) {
              console.error('Reposition route loading failed:', repositionKey, error);
            } finally {
              setLoadingRoutes(prev => {
                const newSet = new Set(prev);
                newSet.delete(repositionKey);
                return newSet;
              });
            }
          }
        }
      }
    };

    loadAllRoutes();
  }, [cargo, isInitialized, onRouteUpdate]);

  // Рендеринг карти
  useEffect(() => {
    if (!mapInstanceRef.current || !isInitialized) return;

    const map = mapInstanceRef.current;

    // Очищаємо карту
    clearAllLayers();

    if (cargo.length === 0) {
      return;
    }

    const renderMap = async () => {
      const bounds = new L.LatLngBounds([]);
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

      // 1. Додаємо маркери
      for (let index = 0; index < cargo.length; index++) {
        const item = cargo[index];
        
        const loadingCoords = await getCityCoordinates(item.loadingPoint);
        const unloadingCoords = await getCityCoordinates(item.unloadingPoint);

        // Маркер завантаження
        if (loadingCoords) {
          bounds.extend(loadingCoords);
          
          const loadingMarker = L.marker(loadingCoords, {
            icon: L.divIcon({
              html: `<div style="background: #10b981; color: white; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${index + 1}</div>`,
              className: 'custom-loading-icon',
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            })
          }).addTo(map);

          loadingMarker.bindPopup(`
            <div style="padding: 6px;">
              <h4 style="margin: 0 0 4px 0; color: #059669;">📦 Завантаження ${index + 1}</h4>
              <p style="margin: 1px 0; font-size: 12px;"><strong>Вантаж:</strong> ${item.name}</p>
              <p style="margin: 1px 0; font-size: 12px;"><strong>Місце:</strong> ${item.loadingPoint}</p>
              <p style="margin: 1px 0; font-size: 12px;"><strong>Вага:</strong> ${(item.weight * 1000).toLocaleString()} кг</p>
            </div>
          `);

          mapLayersRef.current.set(`loading-${index}`, loadingMarker);
        }

        // Маркер розвантаження
        if (unloadingCoords) {
          bounds.extend(unloadingCoords);
          
          const unloadingMarker = L.marker(unloadingCoords, {
            icon: L.divIcon({
              html: `<div style="background: #ef4444; color: white; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${index + 1}</div>`,
              className: 'custom-unloading-icon',
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            })
          }).addTo(map);

          unloadingMarker.bindPopup(`
            <div style="padding: 6px;">
              <h4 style="margin: 0 0 4px 0; color: #dc2626;">📤 Розвантаження ${index + 1}</h4>
              <p style="margin: 1px 0; font-size: 12px;"><strong>Вантаж:</strong> ${item.name}</p>
              <p style="margin: 1px 0; font-size: 12px;"><strong>Місце:</strong> ${item.unloadingPoint}</p>
              <p style="margin: 1px 0; font-size: 12px;"><strong>Фрахт:</strong> ${item.freight.toLocaleString()} ${item.currency}</p>
            </div>
          `);

          mapLayersRef.current.set(`unloading-${index}`, unloadingMarker);
        }
      }

      // 2. Додаємо маршрути доставки
      for (let index = 0; index < cargo.length; index++) {
        const item = cargo[index];
        const routeKey = `${item.loadingPoint}-${item.unloadingPoint}`;
        const routeData = routes.get(routeKey);
        const isLoading = loadingRoutes.has(routeKey);
        const color = colors[index % colors.length];

        if (routeData?.coordinates && routeData.coordinates.length > 0) {
          // Конвертуємо координати
          const routeCoords = routeData.coordinates
            .map(([lng, lat]: [number, number]) => [lat, lng] as [number, number])
            .filter(([lat, lng]: [number, number]) => 
              !isNaN(lat) && !isNaN(lng) && 
              Math.abs(lat) <= 90 && Math.abs(lng) <= 180
            );

          if (routeCoords.length > 0) {
            const routeLine = L.polyline(routeCoords, {
              color,
              weight: 5,
              opacity: 0.8
            }).addTo(map);

            // Додаємо до bounds
            routeCoords.forEach((coord: [number, number]) => bounds.extend(coord));

            const distanceKm = Math.round(routeData.distance / 1000);
            routeLine.bindPopup(`
              <div style="padding: 6px;">
                <h4 style="margin: 0 0 4px 0; color: ${color};">🛣️ Доставка ${index + 1}</h4>
                <p style="margin: 1px 0; font-size: 12px;"><strong>Відстань:</strong> ${distanceKm.toLocaleString()} км</p>
                <p style="margin: 1px 0; font-size: 12px;"><strong>Від:</strong> ${item.loadingPoint}</p>
                <p style="margin: 1px 0; font-size: 12px;"><strong>До:</strong> ${item.unloadingPoint}</p>
              </div>
            `);

            mapLayersRef.current.set(`route-${routeKey}`, routeLine);
          }
        } else if (!isLoading) {
          // Запасна пряма лінія
          const fromCoords = await getCityCoordinates(item.loadingPoint);
          const toCoords = await getCityCoordinates(item.unloadingPoint);
          
          if (fromCoords && toCoords) {
            const straightLine = L.polyline([fromCoords, toCoords], {
              color,
              weight: 3,
              opacity: 0.5,
              dashArray: '8, 4'
            }).addTo(map);

            straightLine.bindPopup(`
              <div style="padding: 6px;">
                <h4 style="margin: 0 0 4px 0; color: ${color};">📏 Доставка ${index + 1}</h4>
                <p style="margin: 1px 0; font-size: 12px;">Приблизна відстань</p>
              </div>
            `);

            mapLayersRef.current.set(`straight-${routeKey}`, straightLine);
          }
        }
      }

      // 3. Додаємо маршрути переїздів
      for (let i = 0; i < cargo.length - 1; i++) {
        const from = cargo[i].unloadingPoint;
        const to = cargo[i + 1].loadingPoint;
        
        if (from.toLowerCase() !== to.toLowerCase()) {
          const repositionKey = `reposition-${from}-${to}`;
          const repositionData = routes.get(repositionKey);
          const isLoadingReposition = loadingRoutes.has(repositionKey);

          if (repositionData?.coordinates && repositionData.coordinates.length > 0) {
            const repositionCoords = repositionData.coordinates
              .map(([lng, lat]: [number, number]) => [lat, lng] as [number, number])
              .filter(([lat, lng]: [number, number]) => 
                !isNaN(lat) && !isNaN(lng) && 
                Math.abs(lat) <= 90 && Math.abs(lng) <= 180
              );

            if (repositionCoords.length > 0) {
              const repositionLine = L.polyline(repositionCoords, {
                color: '#f97316',
                weight: 4,
                opacity: 0.7,
                dashArray: '12, 8'
              }).addTo(map);

              repositionCoords.forEach((coord: [number, number]) => bounds.extend(coord));

              const distanceKm = Math.round(repositionData.distance / 1000);
              repositionLine.bindPopup(`
                <div style="padding: 6px;">
                  <h4 style="margin: 0 0 4px 0; color: #f97316;">🔄 Переїзд ${i + 1}→${i + 2}</h4>
                  <p style="margin: 1px 0; font-size: 12px;"><strong>Відстань:</strong> ${distanceKm.toLocaleString()} км</p>
                  <p style="margin: 1px 0; font-size: 12px;"><strong>Від:</strong> ${from}</p>
                  <p style="margin: 1px 0; font-size: 12px;"><strong>До:</strong> ${to}</p>
                </div>
              `);

              mapLayersRef.current.set(`reposition-${repositionKey}`, repositionLine);
            }
          } else if (!isLoadingReposition) {
            // Запасна лінія переїзду
            const fromCoords = await getCityCoordinates(from);
            const toCoords = await getCityCoordinates(to);
            
            if (fromCoords && toCoords) {
              const straightReposition = L.polyline([fromCoords, toCoords], {
                color: '#f97316',
                weight: 2,
                opacity: 0.4,
                dashArray: '4, 8'
              }).addTo(map);

              straightReposition.bindPopup(`
                <div style="padding: 6px;">
                  <h4 style="margin: 0 0 4px 0; color: #f97316;">🔄 Переїзд ${i + 1}→${i + 2}</h4>
                  <p style="margin: 1px 0; font-size: 12px;">Приблизна відстань</p>
                </div>
              `);

              mapLayersRef.current.set(`straight-reposition-${repositionKey}`, straightReposition);
            }
          }
        }
      }

      // 4. Підлаштовуємо карту
      if (bounds.isValid()) {
        setTimeout(() => {
          map.fitBounds(bounds.pad(0.1));
        }, 200);
      }
    };

    renderMap();
  }, [cargo, routes, loadingRoutes, isInitialized]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg border border-gray-200"
        style={{ minHeight: '500px' }}
      />
      
      {cargo.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl">
          <div className="text-center text-gray-300">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
              🗺️
            </div>
            <p className="font-semibold text-white">Додайте вантаж</p>
            <p className="text-sm text-gray-400">Маршрути з'являться на карті</p>
          </div>
        </div>
      )}
      
      {cargo.length > 0 && (
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-lg rounded-lg border border-white/20 shadow-lg p-2 text-xs">
          <h4 className="font-bold text-cyan-300 mb-2 text-xs">🎯 Легенда</h4>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-300">Завантаження</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-red-300">Розвантаження</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-1 bg-blue-500 mr-2"></div>
              <span className="text-blue-300">Доставка</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-1 bg-orange-500 mr-2" style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #f97316 0px, #f97316 3px, transparent 3px, transparent 6px)'
              }}></div>
              <span className="text-orange-300">Переїзди</span>
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-white/20 text-xs text-gray-400">
            <div>📦 Вантажів: {cargo.length}</div>
            <div>✅ Маршрутів: {routes.size}</div>
            {loadingRoutes.size > 0 && (
              <div className="text-cyan-300">⏳ Завантаження: {loadingRoutes.size}</div>
            )}
          </div>
          
          <button
            onClick={() => {
              setRoutes(new Map());
              setLoadingRoutes(new Set());
              clearCoordinatesCache();
              clearAllLayers();
            }}
            className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            🔄 Очистити кеш
          </button>
        </div>
      )}
    </div>
  );
} 