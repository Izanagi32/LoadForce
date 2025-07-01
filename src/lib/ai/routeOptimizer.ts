// 🛣️ Оптимізація маршрутів та пошук альтернатив
import type { AIHistoricalData, AIPrediction, AIRecommendation } from './index';

export interface RouteOption {
  id: string;
  from: string;
  to: string;
  distance: number;
  estimatedTime: number;
  fuelCost: number;
  tolls: number;
  score: number;
  factors: string[];
}

export class RouteOptimizer {
  private historicalRoutes: AIHistoricalData[] = [];

  constructor(data?: AIHistoricalData[]) {
    if (data) {
      this.historicalRoutes = data;
    }
  }

  /**
   * Знайти оптимальний маршрут на основі різних критеріїв
   */
  findOptimalRoute(
    from: string, 
    to: string, 
    priorities: {
      costWeight: number;
      timeWeight: number;
      distanceWeight: number;
    } = { costWeight: 0.4, timeWeight: 0.3, distanceWeight: 0.3 }
  ): RouteOption[] {
    
    // Симуляція кількох варіантів маршруту
    const routes = this.generateRouteOptions(from, to);
    
    // Оцінка кожного маршруту
    return routes.map(route => ({
      ...route,
      score: this.calculateRouteScore(route, priorities)
    })).sort((a, b) => b.score - a.score);
  }

  /**
   * Генерація варіантів маршрутів
   */
  private generateRouteOptions(from: string, to: string): RouteOption[] {
    const baseDistance = this.calculateBaseDistance(from, to);
    
    return [
      {
        id: 'optimal',
        from,
        to,
        distance: baseDistance,
        estimatedTime: baseDistance / 80, // 80 км/год середня швидкість
        fuelCost: this.estimateFuelCost(baseDistance),
        tolls: this.estimateTolls(baseDistance),
        score: 0,
        factors: ['shortest_distance', 'main_roads']
      },
      {
        id: 'economic',
        from,
        to,
        distance: baseDistance * 1.1,
        estimatedTime: baseDistance * 1.1 / 75,
        fuelCost: this.estimateFuelCost(baseDistance * 1.1) * 0.9, // економніший
        tolls: this.estimateTolls(baseDistance * 1.1) * 0.5, // менше платних доріг
        score: 0,
        factors: ['fuel_efficient', 'avoid_tolls', 'secondary_roads']
      },
      {
        id: 'fast',
        from,
        to,
        distance: baseDistance * 0.95,
        estimatedTime: baseDistance * 0.95 / 90, // швидші дороги
        fuelCost: this.estimateFuelCost(baseDistance * 0.95) * 1.1,
        tolls: this.estimateTolls(baseDistance * 0.95) * 1.5, // більше платних доріг
        score: 0,
        factors: ['highways', 'high_speed', 'toll_roads']
      }
    ];
  }

  /**
   * Розрахунок оцінки маршруту
   */
  private calculateRouteScore(route: RouteOption, priorities: any): number {
    // Нормалізація значень (0-1)
    const normalizedCost = 1 - (route.fuelCost + route.tolls) / 5000; // максимум 5000 грн
    const normalizedTime = 1 - route.estimatedTime / 20; // максимум 20 годин
    const normalizedDistance = 1 - route.distance / 2000; // максимум 2000 км
    
    return (
      normalizedCost * priorities.costWeight +
      normalizedTime * priorities.timeWeight +
      normalizedDistance * priorities.distanceWeight
    ) * 100;
  }

  /**
   * Базовий розрахунок відстані
   */
  private calculateBaseDistance(from: string, to: string): number {
    // Тут можна інтегрувати з реальним API маршрутизації
    // Поки що базовий розрахунок
    const distances: { [key: string]: number } = {
      'київ-львів': 540,
      'львів-київ': 540,
      'київ-одеса': 475,
      'одеса-київ': 475,
      'львів-одеса': 790,
      'одеса-львів': 790,
      'київ-харків': 480,
      'харків-київ': 480,
      'київ-дніпро': 480,
      'дніпро-київ': 480
    };

    const key = `${from.toLowerCase()}-${to.toLowerCase()}`;
    return distances[key] || 500; // середня відстань
  }

  /**
   * Оцінка витрат на паливо
   */
  private estimateFuelCost(distance: number): number {
    const fuelConsumption = 25; // л/100км
    const fuelPrice = 50; // грн/л
    return (distance / 100) * fuelConsumption * fuelPrice;
  }

  /**
   * Оцінка витрат на платні дороги
   */
  private estimateTolls(distance: number): number {
    // Базовий розрахунок платних доріг
    return Math.round(distance * 0.5); // 0.5 грн/км в середньому
  }

  /**
   * Аналіз історичних маршрутів
   */
  analyzeHistoricalRoutes(from: string, to: string): AIPrediction | null {
    const relevantRoutes = this.historicalRoutes.filter(
      route => route.route.from.toLowerCase() === from.toLowerCase() && 
               route.route.to.toLowerCase() === to.toLowerCase()
    );

    if (relevantRoutes.length === 0) {
      return null;
    }

    const avgDistance = relevantRoutes.reduce((sum, route) => sum + route.distance, 0) / relevantRoutes.length;
    const avgFuelCost = relevantRoutes.reduce((sum, route) => sum + route.fuelCost, 0) / relevantRoutes.length;
    const avgTime = relevantRoutes.reduce((sum, route) => sum + route.deliveryTime, 0) / relevantRoutes.length;

    const confidence = Math.min(relevantRoutes.length / 10, 0.9); // більше даних = більша довіра

    return {
      predicted: avgFuelCost,
      confidence,
      factors: ['historical_average', 'route_frequency', 'seasonal_adjustment'],
      recommendation: this.generateRouteRecommendation(avgDistance, avgFuelCost, avgTime)
    };
  }

  /**
   * Генерація рекомендацій для маршруту
   */
  private generateRouteRecommendation(distance: number, fuelCost: number, time: number): string {
    const costPerKm = fuelCost / distance;
    
    if (costPerKm > 12) {
      return 'Розгляньте альтернативні маршрути для зменшення витрат на паливо.';
    }
    
    if (time > distance / 60) { // менше 60 км/год
      return 'Маршрут може мати затримки. Закладіть додатковий час на доставку.';
    }
    
    return 'Оптимальний маршрут з хорошим співвідношенням часу та витрат.';
  }

  /**
   * Отримання рекомендацій по покращенню маршрутів
   */
  getRouteRecommendations(): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Аналіз частоти маршрутів
    const routeFrequency = this.analyzeRouteFrequency();
    
    if (routeFrequency.topRoute && routeFrequency.topRoute.frequency > 5) {
      recommendations.push({
        type: 'route',
        priority: 'high',
        title: 'Оптимізація частого маршруту',
        description: `Маршрут ${routeFrequency.topRoute.from} → ${routeFrequency.topRoute.to} використовується часто. Розгляньте укладання договору з постійними клієнтами.`,
        expectedSaving: routeFrequency.topRoute.frequency * 500,
        currency: 'UAH'
      });
    }

    // Аналіз витрат на паливо
    const highCostRoutes = this.findHighCostRoutes();
    if (highCostRoutes.length > 0) {
      recommendations.push({
        type: 'fuel',
        priority: 'medium',
        title: 'Високі витрати на паливо',
        description: 'Виявлено маршрути з підвищеними витратами на паливо. Рекомендується оптимізація.',
        expectedSaving: 1000,
        currency: 'UAH'
      });
    }

    return recommendations;
  }

  /**
   * Аналіз частоти маршрутів
   */
  private analyzeRouteFrequency() {
    const frequency: { [key: string]: number } = {};
    
    this.historicalRoutes.forEach(route => {
      const key = `${route.route.from}-${route.route.to}`;
      frequency[key] = (frequency[key] || 0) + 1;
    });

    const sortedRoutes = Object.entries(frequency)
      .map(([route, freq]) => {
        const [from, to] = route.split('-');
        return { from, to, frequency: freq };
      })
      .sort((a, b) => b.frequency - a.frequency);

    return {
      topRoute: sortedRoutes[0] || null,
      allRoutes: sortedRoutes
    };
  }

  /**
   * Пошук маршрутів з високими витратами
   */
  private findHighCostRoutes(): any[] {
    return this.historicalRoutes
      .filter(route => (route.fuelCost / route.distance) > 12)
      .map(route => ({
        route: route.route,
        costPerKm: route.fuelCost / route.distance,
        date: route.date
      }));
  }
} 