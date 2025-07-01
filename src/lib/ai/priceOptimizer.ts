// 💰 Оптимізація ціноутворення та маржі
import type { AIHistoricalData, AIRecommendation } from './index';

export interface PriceRecommendation {
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  margin: number;
  confidence: number;
  factors: string[];
}

export class PriceOptimizer {
  private historicalData: AIHistoricalData[] = [];
  private targetMargin = 0.25; // 25% цільова маржа

  constructor(data?: AIHistoricalData[], targetMargin = 0.25) {
    if (data) {
      this.historicalData = data;
    }
    this.targetMargin = targetMargin;
  }

  /**
   * Рекомендація ціни для клієнта
   */
  recommendPrice(
    totalCosts: number,
    distance: number,
    cargoType: string,
    urgency: 'standard' | 'urgent' | 'express',
    clientType: 'new' | 'regular' | 'vip'
  ): PriceRecommendation {

    let basePrice = totalCosts * (1 + this.targetMargin);

    // Корекція на тип вантажу
    basePrice *= this.getCargoTypeFactor(cargoType);

    // Корекція на терміновість
    basePrice *= this.getUrgencyFactor(urgency);

    // Корекція на тип клієнта
    basePrice *= this.getClientTypeFactor(clientType);

    // Історичний аналіз ринку
    const marketAnalysis = this.analyzeMarketPrices(distance, cargoType);
    
    const recommendedPrice = this.adjustForMarket(basePrice, marketAnalysis);
    const minPrice = totalCosts * 1.1; // мінімум 10% маржі
    const maxPrice = recommendedPrice * 1.3; // максимум +30%

    return {
      recommendedPrice: Math.round(recommendedPrice),
      minPrice: Math.round(minPrice),
      maxPrice: Math.round(maxPrice),
      margin: (recommendedPrice - totalCosts) / totalCosts,
      confidence: marketAnalysis.confidence,
      factors: ['costs', 'cargo_type', urgency, clientType, 'market_analysis']
    };
  }

  /**
   * Фактор ціни за типом вантажу
   */
  private getCargoTypeFactor(cargoType: string): number {
    const factors: { [key: string]: number } = {
      'general': 1.0,
      'fragile': 1.15, // крихкий вантаж
      'dangerous': 1.25, // небезпечний вантаж
      'oversized': 1.2, // негабаритний
      'refrigerated': 1.3, // рефрижератор
      'express': 1.4 // експрес доставка
    };
    return factors[cargoType] || 1.0;
  }

  /**
   * Фактор ціни за терміновістю
   */
  private getUrgencyFactor(urgency: string): number {
    const factors = {
      'standard': 1.0,
      'urgent': 1.2,
      'express': 1.5
    };
    return factors[urgency as keyof typeof factors] || 1.0;
  }

  /**
   * Фактор ціни за типом клієнта
   */
  private getClientTypeFactor(clientType: string): number {
    const factors = {
      'new': 1.1, // нові клієнти - стандартна ціна
      'regular': 0.95, // постійні клієнти - знижка
      'vip': 0.9 // VIP клієнти - більша знижка
    };
    return factors[clientType as keyof typeof factors] || 1.0;
  }

  /**
   * Аналіз ринкових цін
   */
  private analyzeMarketPrices(distance: number, cargoType: string) {
    const similarTrips = this.historicalData.filter(trip => {
      const distDiff = Math.abs(trip.distance - distance) / distance;
      return distDiff < 0.4; // 40% відхилення по відстані
    });

    if (similarTrips.length < 3) {
      return { averagePrice: null, confidence: 0.5 };
    }

    // Розрахунок середньої ціни за км
    const pricesPerKm = similarTrips.map(trip => {
      // Припускаємо, що вартість рейсу = fuel cost * 2 (приблизна формула)
      const estimatedPrice = trip.fuelCost * 2;
      return estimatedPrice / trip.distance;
    });

    const averagePricePerKm = pricesPerKm.reduce((sum, price) => sum + price, 0) / pricesPerKm.length;
    const confidence = Math.min(similarTrips.length / 10, 0.9);

    return {
      averagePrice: averagePricePerKm * distance,
      confidence
    };
  }

  /**
   * Корекція ціни на основі ринкового аналізу
   */
  private adjustForMarket(basePrice: number, marketAnalysis: any): number {
    if (!marketAnalysis.averagePrice) {
      return basePrice;
    }

    // Зважене усереднення базової та ринкової ціни
    const marketWeight = marketAnalysis.confidence;
    const baseWeight = 1 - marketWeight;

    return basePrice * baseWeight + marketAnalysis.averagePrice * marketWeight;
  }

  /**
   * Аналіз прибутковості по клієнтах
   */
  analyzeClientProfitability(): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Аналіз маржі по рейсах
    const lowMarginTrips = this.historicalData.filter(trip => {
      const estimatedCost = trip.fuelCost * 1.8; // приблизна формула витрат
      const estimatedPrice = trip.fuelCost * 2;
      const margin = (estimatedPrice - estimatedCost) / estimatedCost;
      return margin < 0.15; // менше 15% маржі
    });

    if (lowMarginTrips.length > 5) {
      recommendations.push({
        type: 'pricing',
        priority: 'high',
        title: 'Низька маржа рейсів',
        description: `Виявлено ${lowMarginTrips.length} рейсів з низькою маржею. Необхідно переглянути ціноутворення.`,
        expectedSaving: lowMarginTrips.length * 500,
        currency: 'UAH'
      });
    }

    // Аналіз частих маршрутів
    const routeFrequency: { [key: string]: number } = {};
    this.historicalData.forEach(trip => {
      const route = `${trip.route.from}-${trip.route.to}`;
      routeFrequency[route] = (routeFrequency[route] || 0) + 1;
    });

    const frequentRoutes = Object.entries(routeFrequency)
      .filter(([_, count]) => count >= 5)
      .map(([route, count]) => ({ route, count }));

    if (frequentRoutes.length > 0) {
      recommendations.push({
        type: 'pricing',
        priority: 'medium',
        title: 'Оптимізація цін частих маршрутів',
        description: 'Для частих маршрутів можна запропонувати пакетні тарифи клієнтам.',
        expectedSaving: frequentRoutes.length * 1000,
        currency: 'UAH'
      });
    }

    return recommendations;
  }

  /**
   * Динамічне ціноутворення на основі попиту
   */
  dynamicPricing(
    basePrice: number,
    currentDemand: 'low' | 'medium' | 'high',
    seasonality: 'low' | 'medium' | 'high',
    competitionLevel: 'low' | 'medium' | 'high'
  ): number {
    let adjustedPrice = basePrice;

    // Корекція на попит
    const demandFactors = { low: 0.9, medium: 1.0, high: 1.15 };
    adjustedPrice *= demandFactors[currentDemand];

    // Корекція на сезонність
    const seasonalityFactors = { low: 0.95, medium: 1.0, high: 1.1 };
    adjustedPrice *= seasonalityFactors[seasonality];

    // Корекція на конкуренцію
    const competitionFactors = { low: 1.05, medium: 1.0, high: 0.95 };
    adjustedPrice *= competitionFactors[competitionLevel];

    return Math.round(adjustedPrice);
  }

  /**
   * Розрахунок точки беззбитковості
   */
  calculateBreakEven(
    fixedCosts: number,
    variableCostPerKm: number,
    averagePricePerKm: number
  ): {
    breakEvenDistance: number;
    breakEvenPrice: number;
    recommendation: string;
  } {
    const contribution = averagePricePerKm - variableCostPerKm;
    const breakEvenDistance = fixedCosts / contribution;
    const breakEvenPrice = fixedCosts + (breakEvenDistance * variableCostPerKm);

    let recommendation = '';
    if (breakEvenDistance > 2000) {
      recommendation = 'Висока точка беззбитковості. Розгляньте зниження фіксованих витрат.';
    } else if (breakEvenDistance < 500) {
      recommendation = 'Низька точка беззбитковості. Гарні перспективи для прибутковості.';
    } else {
      recommendation = 'Помірна точка беззбитковості. Стандартні показники для галузі.';
    }

    return {
      breakEvenDistance: Math.round(breakEvenDistance),
      breakEvenPrice: Math.round(breakEvenPrice),
      recommendation
    };
  }
} 