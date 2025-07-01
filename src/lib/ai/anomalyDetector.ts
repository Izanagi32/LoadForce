// 🚨 Виявлення аномалій у витратах та операціях
import type { AIHistoricalData, AIRecommendation } from './index';

export interface Anomaly {
  id: string;
  type: 'fuel' | 'time' | 'distance' | 'cost';
  severity: 'low' | 'medium' | 'high';
  description: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  date: string;
  route: {
    from: string;
    to: string;
  };
  suggestions: string[];
}

export class AnomalyDetector {
  private historicalData: AIHistoricalData[] = [];
  private thresholds = {
    fuel: { moderate: 1.5, severe: 2.0 }, // стандартні відхилення
    time: { moderate: 1.3, severe: 1.8 },
    distance: { moderate: 1.2, severe: 1.5 },
    cost: { moderate: 1.4, severe: 2.0 }
  };

  constructor(data?: AIHistoricalData[]) {
    if (data) {
      this.historicalData = data;
    }
  }

  /**
   * Виявлення аномалій у новому рейсі
   */
  detectAnomalies(newTrip: AIHistoricalData): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Аналіз витрат палива
    const fuelAnomaly = this.detectFuelAnomaly(newTrip);
    if (fuelAnomaly) anomalies.push(fuelAnomaly);

    // Аналіз часу доставки
    const timeAnomaly = this.detectTimeAnomaly(newTrip);
    if (timeAnomaly) anomalies.push(timeAnomaly);

    // Аналіз відстані
    const distanceAnomaly = this.detectDistanceAnomaly(newTrip);
    if (distanceAnomaly) anomalies.push(distanceAnomaly);

    // Аналіз загальних витрат
    const costAnomaly = this.detectCostAnomaly(newTrip);
    if (costAnomaly) anomalies.push(costAnomaly);

    return anomalies;
  }

  /**
   * Виявлення аномалій у витратах палива
   */
  private detectFuelAnomaly(trip: AIHistoricalData): Anomaly | null {
    const similarTrips = this.findSimilarTrips(trip);
    if (similarTrips.length < 3) return null;

    const stats = this.calculateStatistics(similarTrips.map(t => t.fuelCost));
    const zScore = Math.abs((trip.fuelCost - stats.mean) / stats.stdDev);

    if (zScore > this.thresholds.fuel.moderate) {
      const severity = zScore > this.thresholds.fuel.severe ? 'high' : 'medium';
      
      return {
        id: `fuel-${trip.id}`,
        type: 'fuel',
        severity,
        description: `Витрати палива ${trip.fuelCost} грн значно відрізняються від очікуваних ${Math.round(stats.mean)} грн`,
        expectedValue: Math.round(stats.mean),
        actualValue: trip.fuelCost,
        deviation: Math.round(((trip.fuelCost - stats.mean) / stats.mean) * 100),
        date: trip.date,
        route: trip.route,
        suggestions: this.generateFuelSuggestions(trip, stats.mean)
      };
    }

    return null;
  }

  /**
   * Виявлення аномалій у часі доставки
   */
  private detectTimeAnomaly(trip: AIHistoricalData): Anomaly | null {
    const similarTrips = this.findSimilarTrips(trip);
    if (similarTrips.length < 3) return null;

    const stats = this.calculateStatistics(similarTrips.map(t => t.deliveryTime));
    const zScore = Math.abs((trip.deliveryTime - stats.mean) / stats.stdDev);

    if (zScore > this.thresholds.time.moderate) {
      const severity = zScore > this.thresholds.time.severe ? 'high' : 'medium';
      
      return {
        id: `time-${trip.id}`,
        type: 'time',
        severity,
        description: `Час доставки ${trip.deliveryTime} год відрізняється від очікуваного ${Math.round(stats.mean * 10) / 10} год`,
        expectedValue: Math.round(stats.mean * 10) / 10,
        actualValue: trip.deliveryTime,
        deviation: Math.round(((trip.deliveryTime - stats.mean) / stats.mean) * 100),
        date: trip.date,
        route: trip.route,
        suggestions: this.generateTimeSuggestions(trip, stats.mean)
      };
    }

    return null;
  }

  /**
   * Виявлення аномалій у відстані
   */
  private detectDistanceAnomaly(trip: AIHistoricalData): Anomaly | null {
    const sameRouteTrips = this.historicalData.filter(
      t => t.route.from === trip.route.from && t.route.to === trip.route.to
    );

    if (sameRouteTrips.length < 3) return null;

    const stats = this.calculateStatistics(sameRouteTrips.map(t => t.distance));
    const zScore = Math.abs((trip.distance - stats.mean) / stats.stdDev);

    if (zScore > this.thresholds.distance.moderate) {
      const severity = zScore > this.thresholds.distance.severe ? 'high' : 'medium';
      
      return {
        id: `distance-${trip.id}`,
        type: 'distance',
        severity,
        description: `Відстань ${trip.distance} км відрізняється від стандартної ${Math.round(stats.mean)} км для цього маршруту`,
        expectedValue: Math.round(stats.mean),
        actualValue: trip.distance,
        deviation: Math.round(((trip.distance - stats.mean) / stats.mean) * 100),
        date: trip.date,
        route: trip.route,
        suggestions: this.generateDistanceSuggestions(trip, stats.mean)
      };
    }

    return null;
  }

  /**
   * Виявлення аномалій у загальних витратах
   */
  private detectCostAnomaly(trip: AIHistoricalData): Anomaly | null {
    const costPerKm = trip.fuelCost / trip.distance;
    const similarTrips = this.findSimilarTrips(trip);
    
    if (similarTrips.length < 3) return null;

    const similarCostPerKm = similarTrips.map(t => t.fuelCost / t.distance);
    const stats = this.calculateStatistics(similarCostPerKm);
    const zScore = Math.abs((costPerKm - stats.mean) / stats.stdDev);

    if (zScore > this.thresholds.cost.moderate) {
      const severity = zScore > this.thresholds.cost.severe ? 'high' : 'medium';
      
      return {
        id: `cost-${trip.id}`,
        type: 'cost',
        severity,
        description: `Вартість за км ${Math.round(costPerKm)} грн/км відрізняється від очікуваної ${Math.round(stats.mean)} грн/км`,
        expectedValue: Math.round(stats.mean),
        actualValue: Math.round(costPerKm),
        deviation: Math.round(((costPerKm - stats.mean) / stats.mean) * 100),
        date: trip.date,
        route: trip.route,
        suggestions: this.generateCostSuggestions(trip, stats.mean * trip.distance)
      };
    }

    return null;
  }

  /**
   * Пошук схожих рейсів для порівняння
   */
  private findSimilarTrips(trip: AIHistoricalData): AIHistoricalData[] {
    return this.historicalData.filter(t => {
      const distanceDiff = Math.abs(t.distance - trip.distance) / trip.distance;
      const weightDiff = Math.abs(t.cargoWeight - trip.cargoWeight) / trip.cargoWeight;
      
      return distanceDiff < 0.3 && weightDiff < 0.4; // 30% відхилення по відстані, 40% по вазі
    });
  }

  /**
   * Розрахунок статистичних показників
   */
  private calculateStatistics(values: number[]) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, variance, stdDev };
  }

  /**
   * Генерація рекомендацій для аномалій палива
   */
  private generateFuelSuggestions(trip: AIHistoricalData, expectedFuelCost: number): string[] {
    const suggestions: string[] = [];
    
    if (trip.fuelCost > expectedFuelCost) {
      suggestions.push('Перевірте технічний стан автомобіля');
      suggestions.push('Оптимізуйте маршрут для зменшення витрат');
      if (trip.cargoWeight > 20000) {
        suggestions.push('Розгляньте розподіл важкого вантажу на декілька рейсів');
      }
    } else {
      suggestions.push('Чудовий результат! Проаналізуйте фактори успіху');
      suggestions.push('Використайте цей досвід для інших маршрутів');
    }

    return suggestions;
  }

  /**
   * Генерація рекомендацій для аномалій часу
   */
  private generateTimeSuggestions(trip: AIHistoricalData, expectedTime: number): string[] {
    const suggestions: string[] = [];
    
    if (trip.deliveryTime > expectedTime) {
      suggestions.push('Перевірте дорожню обстановку та затори');
      suggestions.push('Заплануйте альтернативний маршрут');
      suggestions.push('Врахуйте час відпочинку водія');
    } else {
      suggestions.push('Відмінний час доставки!');
      suggestions.push('Документуйте успішні практики');
    }

    return suggestions;
  }

  /**
   * Генерація рекомендацій для аномалій відстані
   */
  private generateDistanceSuggestions(trip: AIHistoricalData, expectedDistance: number): string[] {
    const suggestions: string[] = [];
    
    if (trip.distance > expectedDistance) {
      suggestions.push('Перевірте правильність маршруту');
      suggestions.push('Можливо, використовувався об\'їзд');
      suggestions.push('Оновіть базу стандартних відстаней');
    } else {
      suggestions.push('Знайдено короткий маршрут!');
      suggestions.push('Використайте цей маршрут для майбутніх рейсів');
    }

    return suggestions;
  }

  /**
   * Генерація рекомендацій для аномалій вартості
   */
  private generateCostSuggestions(trip: AIHistoricalData, expectedCost: number): string[] {
    const suggestions: string[] = [];
    
    if (trip.fuelCost > expectedCost) {
      suggestions.push('Аналіз цін на АЗС по маршруту');
      suggestions.push('Перевірка ефективності використання палива');
      suggestions.push('Можливе підвищення цін на паливо');
    } else {
      suggestions.push('Економний рейс!');
      suggestions.push('Вдалий вибір АЗС або маршруту');
    }

    return suggestions;
  }

  /**
   * Отримання загального звіту по аномаліях
   */
  getAnomalyReport(): {
    totalAnomalies: number;
    byType: { [key: string]: number };
    bySeverity: { [key: string]: number };
    recommendations: AIRecommendation[];
  } {
    const allAnomalies: Anomaly[] = [];
    
    // Аналіз всіх історичних даних
    this.historicalData.forEach(trip => {
      const anomalies = this.detectAnomalies(trip);
      allAnomalies.push(...anomalies);
    });

    const byType: { [key: string]: number } = {};
    const bySeverity: { [key: string]: number } = {};

    allAnomalies.forEach(anomaly => {
      byType[anomaly.type] = (byType[anomaly.type] || 0) + 1;
      bySeverity[anomaly.severity] = (bySeverity[anomaly.severity] || 0) + 1;
    });

    const recommendations: AIRecommendation[] = [];

    // Генерація рекомендацій на основі аномалій
    if (byType.fuel > 5) {
      recommendations.push({
        type: 'fuel',
        priority: 'high',
        title: 'Часті аномалії витрат палива',
        description: 'Виявлено багато відхилень у витратах палива. Рекомендується технічний огляд автопарку.',
        expectedSaving: byType.fuel * 300,
        currency: 'UAH'
      });
    }

    if (byType.time > 3) {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        title: 'Проблеми з часом доставки',
        description: 'Часті затримки в доставці. Необхідно переглянути планування маршрутів.',
        expectedSaving: byType.time * 200,
        currency: 'UAH'
      });
    }

    return {
      totalAnomalies: allAnomalies.length,
      byType,
      bySeverity,
      recommendations
    };
  }
} 