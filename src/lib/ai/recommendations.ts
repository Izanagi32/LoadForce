// 🎯 Рекомендаційна система для логістики
import type { AIHistoricalData, AIRecommendation } from './index';
import { FuelCostPredictor } from './fuelPredictor';
import { RouteOptimizer } from './routeOptimizer';
import { AnomalyDetector } from './anomalyDetector';
import { PriceOptimizer } from './priceOptimizer';

export class RouteRecommendationEngine {
  private fuelPredictor: FuelCostPredictor;
  private routeOptimizer: RouteOptimizer;
  private anomalyDetector: AnomalyDetector;
  private priceOptimizer: PriceOptimizer;

  constructor(historicalData: AIHistoricalData[] = []) {
    this.fuelPredictor = new FuelCostPredictor(historicalData);
    this.routeOptimizer = new RouteOptimizer(historicalData);
    this.anomalyDetector = new AnomalyDetector(historicalData);
    this.priceOptimizer = new PriceOptimizer(historicalData);
  }

  /**
   * Генерація комплексних рекомендацій для бізнесу
   */
  generateBusinessRecommendations(): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Рекомендації по маршрутах
    recommendations.push(...this.routeOptimizer.getRouteRecommendations());

    // Рекомендації по ціноутворенню
    recommendations.push(...this.priceOptimizer.analyzeClientProfitability());

    // Рекомендації на основі аномалій
    const anomalyReport = this.anomalyDetector.getAnomalyReport();
    recommendations.push(...anomalyReport.recommendations);

    // Загальні бізнес-рекомендації
    recommendations.push(...this.generateGeneralRecommendations());

    // Сортування за пріоритетом
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Аналіз ефективності операцій
   */
  analyzeOperationalEfficiency(): {
    score: number;
    metrics: {
      fuelEfficiency: number;
      timeEfficiency: number;
      costEfficiency: number;
      routeOptimization: number;
    };
    recommendations: string[];
  } {
    const stats = this.fuelPredictor.getStatistics();
    
    if (!stats) {
      return {
        score: 50,
        metrics: {
          fuelEfficiency: 50,
          timeEfficiency: 50,
          costEfficiency: 50,
          routeOptimization: 50
        },
        recommendations: ['Додайте історичні дані для детального аналізу ефективності']
      };
    }

    // Розрахунок метрик ефективності
    const avgFuelPerKm = stats.averageFuelCost / stats.averageDistance;
    const fuelEfficiency = Math.max(0, Math.min(100, 100 - (avgFuelPerKm - 8) * 10)); // оптимум 8 грн/км

    // Загальна оцінка
    const overallScore = fuelEfficiency; // поки що тільки паливо, можна додати інші метрики

    const recommendations: string[] = [];
    
    if (fuelEfficiency < 70) {
      recommendations.push('Оптимізуйте витрати палива через технічне обслуговування автопарку');
    }
    
    if (overallScore > 80) {
      recommendations.push('Відмінні показники ефективності! Продовжуйте в тому ж дусі');
    }

    return {
      score: Math.round(overallScore),
      metrics: {
        fuelEfficiency: Math.round(fuelEfficiency),
        timeEfficiency: 75, // заглушка
        costEfficiency: 70, // заглушка
        routeOptimization: 80 // заглушка
      },
      recommendations
    };
  }

  /**
   * Прогнозування трендів
   */
  predictTrends(months: number = 3): {
    fuelCostTrend: 'increasing' | 'stable' | 'decreasing';
    demandTrend: 'growing' | 'stable' | 'declining';
    profitabilityTrend: 'improving' | 'stable' | 'declining';
    recommendations: AIRecommendation[];
  } {
    // Простий аналіз трендів на основі історичних даних
    // В реальності тут був би більш складний аналіз

    const recommendations: AIRecommendation[] = [];

    // Симуляція трендів (в реальності - аналіз даних)
    const fuelCostTrend: 'increasing' | 'stable' | 'decreasing' = 'increasing';
    
    if (fuelCostTrend === 'increasing') {
      recommendations.push({
        type: 'fuel',
        priority: 'high',
        title: 'Зростання цін на паливо',
        description: 'Прогнозується зростання цін на паливо. Розгляньте фіксацію цін на послуги або хеджування ризиків.',
        expectedSaving: 5000,
        currency: 'UAH'
      });
    }

    return {
      fuelCostTrend,
      demandTrend: 'stable',
      profitabilityTrend: 'stable',
      recommendations
    };
  }

  /**
   * Персоналізовані рекомендації для конкретного маршруту
   */
  getRouteSpecificRecommendations(
    from: string,
    to: string,
    cargoWeight: number,
    urgency: string
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Аналіз цього маршруту
    const routeAnalysis = this.routeOptimizer.analyzeHistoricalRoutes(from, to);
    
    if (routeAnalysis && routeAnalysis.confidence > 0.7) {
      if (routeAnalysis.predicted > 2000) {
        recommendations.push({
          type: 'route',
          priority: 'medium',
          title: 'Дорогий маршрут',
          description: 'Цей маршрут має високі витрати. Розгляньте альтернативні варіанти або підвищте тариф.',
          expectedSaving: 500,
          currency: 'UAH'
        });
      }
    }

    // Рекомендації по вазі вантажу
    if (cargoWeight > 20000) {
      recommendations.push({
        type: 'route',
        priority: 'low',
        title: 'Важкий вантаж',
        description: 'Важкий вантаж збільшує витрати палива. Врахуйте це в ціноутворенні.',
        expectedSaving: 300,
        currency: 'UAH'
      });
    }

    return recommendations;
  }

  /**
   * Генерація загальних рекомендацій
   */
  private generateGeneralRecommendations(): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Рекомендація по збору даних
    const stats = this.fuelPredictor.getStatistics();
    if (!stats || stats.totalTrips < 10) {
      recommendations.push({
        type: 'route',
        priority: 'medium',
        title: 'Збір історичних даних',
        description: 'Додайте більше історичних даних для покращення точності AI прогнозів.',
        expectedSaving: 1000,
        currency: 'UAH'
      });
    }

    // Рекомендація по автоматизації
    if (stats && stats.totalTrips > 50) {
      recommendations.push({
        type: 'route',
        priority: 'low',
        title: 'Автоматизація процесів',
        description: 'У вас достатньо даних для впровадження автоматичного планування маршрутів.',
        expectedSaving: 2000,
        currency: 'UAH'
      });
    }

    return recommendations;
  }

  /**
   * Отримання швидких інсайтів
   */
  getQuickInsights(): {
    totalTrips: number;
    averageProfitability: number;
    topRoute: string | null;
    riskLevel: 'low' | 'medium' | 'high';
    nextRecommendation: string;
  } {
    const stats = this.fuelPredictor.getStatistics();
    const anomalyReport = this.anomalyDetector.getAnomalyReport();

    if (!stats) {
      return {
        totalTrips: 0,
        averageProfitability: 0,
        topRoute: null,
        riskLevel: 'medium',
        nextRecommendation: 'Почніть збирати дані про рейси для аналізу'
      };
    }

    // Простий розрахунок прибутковості
    const avgRevenue = stats.averageFuelCost * 2; // припущення
    const avgProfit = avgRevenue - stats.averageFuelCost;
    const avgProfitability = (avgProfit / avgRevenue) * 100;

    // Оцінка ризику на основі аномалій
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (anomalyReport.totalAnomalies > 10) riskLevel = 'medium';
    if (anomalyReport.totalAnomalies > 20) riskLevel = 'high';

    return {
      totalTrips: stats.totalTrips,
      averageProfitability: Math.round(avgProfitability),
      topRoute: 'Київ → Львів', // заглушка
      riskLevel,
      nextRecommendation: this.getNextActionRecommendation(stats, anomalyReport)
    };
  }

  /**
   * Наступна рекомендована дія
   */
  private getNextActionRecommendation(stats: any, anomalyReport: any): string {
    if (stats.totalTrips < 5) {
      return 'Додайте більше історичних даних для кращого аналізу';
    }

    if (anomalyReport.totalAnomalies > 5) {
      return 'Проаналізуйте виявлені аномалії у витратах';
    }

    if (stats.averageFuelCost / stats.averageDistance > 12) {
      return 'Оптимізуйте витрати палива - вони вище середніх';
    }

    return 'Все виглядає добре! Продовжуйте збирати дані для покращення прогнозів';
  }
} 