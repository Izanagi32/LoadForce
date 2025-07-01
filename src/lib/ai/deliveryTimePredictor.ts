// ⏰ Прогнозування часу доставки
import type { AIHistoricalData, AIPrediction } from './index';

export class DeliveryTimePredictor {
  private historicalData: AIHistoricalData[] = [];

  constructor(data?: AIHistoricalData[]) {
    if (data) {
      this.historicalData = data;
    }
  }

  /**
   * Прогнозування часу доставки
   */
  predictDeliveryTime(
    distance: number,
    cargoWeight: number,
    weather?: string,
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'
  ): AIPrediction {
    
    const baseTime = this.calculateBaseTime(distance);
    let adjustedTime = baseTime;

    // Корекція на вагу вантажу
    adjustedTime *= this.getWeightFactor(cargoWeight);

    // Корекція на погоду
    if (weather) {
      adjustedTime *= this.getWeatherFactor(weather);
    }

    // Корекція на час доби
    if (timeOfDay) {
      adjustedTime *= this.getTimeOfDayFactor(timeOfDay);
    }

    // Історичний аналіз
    const historicalAdjustment = this.getHistoricalAdjustment(distance, cargoWeight);
    adjustedTime *= historicalAdjustment.factor;

    return {
      predicted: Math.round(adjustedTime * 10) / 10,
      confidence: historicalAdjustment.confidence,
      factors: ['distance', 'cargo_weight', weather, timeOfDay, 'historical_data'].filter(Boolean) as string[],
      recommendation: this.generateTimeRecommendation(adjustedTime, distance)
    };
  }

  private calculateBaseTime(distance: number): number {
    // Базова швидкість залежно від типу доріг
    if (distance < 100) return distance / 60; // міські дороги
    if (distance < 500) return distance / 75; // змішані дороги
    return distance / 80; // переважно траси
  }

  private getWeightFactor(weight: number): number {
    if (weight < 5000) return 1.0;
    if (weight < 15000) return 1.1;
    if (weight < 25000) return 1.2;
    return 1.3;
  }

  private getWeatherFactor(weather: string): number {
    const factors: { [key: string]: number } = {
      'sunny': 1.0,
      'cloudy': 1.05,
      'rainy': 1.2,
      'snowy': 1.4,
      'foggy': 1.3
    };
    return factors[weather] || 1.1;
  }

  private getTimeOfDayFactor(timeOfDay: string): number {
    const factors = {
      'morning': 1.1, // ранковий трафік
      'afternoon': 1.0,
      'evening': 1.2, // вечірній трафік
      'night': 0.9
    };
    return factors[timeOfDay as keyof typeof factors] || 1.0;
  }

  private getHistoricalAdjustment(distance: number, weight: number) {
    const similarTrips = this.historicalData.filter(trip => {
      const distDiff = Math.abs(trip.distance - distance) / distance;
      const weightDiff = Math.abs(trip.cargoWeight - weight) / weight;
      return distDiff < 0.3 && weightDiff < 0.4;
    });

    if (similarTrips.length < 2) {
      return { factor: 1.0, confidence: 0.6 };
    }

    const avgHistoricalTime = similarTrips.reduce((sum, trip) => sum + trip.deliveryTime, 0) / similarTrips.length;
    const expectedTime = this.calculateBaseTime(distance);
    const factor = avgHistoricalTime / expectedTime;

    const confidence = Math.min(similarTrips.length / 10, 0.9);

    return { factor: Math.max(0.7, Math.min(1.5, factor)), confidence };
  }

  private generateTimeRecommendation(predictedTime: number, distance: number): string {
    const speed = distance / predictedTime;

    if (speed < 50) {
      return 'Повільна доставка. Перевірте маршрут та дорожні умови.';
    }
    if (speed > 90) {
      return 'Швидка доставка. Переконайтеся в дотриманні ПДР.';
    }
    return 'Оптимальний час доставки для даного маршруту.';
  }
} 