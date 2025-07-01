// 🔮 Прогнозування витрат палива на основі історичних даних
import type { AIHistoricalData, AIPrediction } from './index';

export class FuelCostPredictor {
  private historicalData: AIHistoricalData[] = [];

  constructor(data?: AIHistoricalData[]) {
    if (data) {
      this.historicalData = data;
    }
  }

  /**
   * Додати історичні дані для навчання
   */
  addHistoricalData(data: AIHistoricalData[]) {
    this.historicalData.push(...data);
  }

  /**
   * Прогнозування витрат палива на основі лінійної регресії
   */
  predictFuelCost(distance: number, cargoWeight: number, currentFuelPrice: number): AIPrediction {
    if (this.historicalData.length === 0) {
      // Базовий розрахунок без історичних даних
      const baseFuelConsumption = 25; // л/100км
      const weightFactor = 1 + (cargoWeight / 25000) * 0.3; // +30% на максимальне навантаження
      const predictedConsumption = (distance / 100) * baseFuelConsumption * weightFactor;
      const predictedCost = predictedConsumption * currentFuelPrice;

      return {
        predicted: Math.round(predictedCost),
        confidence: 0.7,
        factors: ['distance', 'cargo_weight', 'fuel_price'],
        recommendation: 'Додайте історичні дані для покращення точності прогнозування'
      };
    }

    // Лінійна регресія на основі історичних даних
    const regression = this.performLinearRegression();
    const predicted = regression.slope * distance + regression.intercept;
    
    // Корекція на вагу вантажу
    const weightCorrection = this.calculateWeightCorrection(cargoWeight);
    const adjustedPrediction = predicted * weightCorrection;

    // Корекція на поточну ціну палива
    const averageHistoricalFuelPrice = this.getAverageFuelPrice();
    const priceCorrection = currentFuelPrice / averageHistoricalFuelPrice;
    const finalPrediction = adjustedPrediction * priceCorrection;

    const confidence = this.calculateConfidence(regression.correlation);

    return {
      predicted: Math.round(finalPrediction),
      confidence,
      factors: ['historical_data', 'distance', 'cargo_weight', 'fuel_price_trend'],
      recommendation: this.generateRecommendation(finalPrediction, distance, cargoWeight)
    };
  }

  /**
   * Виконання лінійної регресії
   */
  private performLinearRegression() {
    const n = this.historicalData.length;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (const data of this.historicalData) {
      const x = data.distance;
      const y = data.fuelCost;
      
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Розрахунок коефіцієнта кореляції
    const meanX = sumX / n;
    const meanY = sumY / n;
    
    let numerator = 0, denominatorX = 0, denominatorY = 0;
    
    for (const data of this.historicalData) {
      const diffX = data.distance - meanX;
      const diffY = data.fuelCost - meanY;
      
      numerator += diffX * diffY;
      denominatorX += diffX * diffX;
      denominatorY += diffY * diffY;
    }
    
    const correlation = numerator / Math.sqrt(denominatorX * denominatorY);
    
    return { slope, intercept, correlation };
  }

  /**
   * Розрахунок корекції на вагу вантажу
   */
  private calculateWeightCorrection(cargoWeight: number): number {
    if (this.historicalData.length === 0) return 1;

    // Аналіз впливу ваги на витрати
    const weightImpact = this.historicalData.reduce((acc, data) => {
      const normalizedWeight = data.cargoWeight / 25000; // нормалізація до максимальної ваги
      const fuelPerKm = data.fuelCost / data.distance;
      return acc + fuelPerKm * normalizedWeight;
    }, 0) / this.historicalData.length;

    const normalizedNewWeight = cargoWeight / 25000;
    return 1 + (normalizedNewWeight * weightImpact * 0.1); // максимум 10% збільшення
  }

  /**
   * Отримання середньої ціни палива з історії
   */
  private getAverageFuelPrice(): number {
    if (this.historicalData.length === 0) return 50; // базова ціна

    const totalDistance = this.historicalData.reduce((acc, data) => acc + data.distance, 0);
    const totalFuelCost = this.historicalData.reduce((acc, data) => acc + data.fuelCost, 0);
    
    const averageConsumption = 25; // л/100км
    const totalFuelLiters = (totalDistance / 100) * averageConsumption;
    
    return totalFuelCost / totalFuelLiters;
  }

  /**
   * Розрахунок довіри до прогнозу
   */
  private calculateConfidence(correlation: number): number {
    const dataQuality = Math.min(this.historicalData.length / 50, 1); // більше даних = більша довіра
    const correlationQuality = Math.abs(correlation);
    
    return Math.min((dataQuality * 0.4 + correlationQuality * 0.6) * 0.95, 0.95);
  }

  /**
   * Генерація рекомендацій
   */
  private generateRecommendation(predictedCost: number, distance: number, cargoWeight: number): string {
    const costPerKm = predictedCost / distance;
    
    if (costPerKm > 15) {
      return 'Високі витрати на паливо. Розгляньте оптимізацію маршруту або зменшення ваги вантажу.';
    }
    
    if (cargoWeight > 20000) {
      return 'Важкий вантаж збільшує витрати палива. Розгляньте розподіл на кілька рейсів.';
    }
    
    if (costPerKm < 8) {
      return 'Ефективний маршрут з низькими витратами на паливо.';
    }
    
    return 'Стандартні витрати на паливо для даного маршруту.';
  }

  /**
   * Отримання статистики по історичним даним
   */
  getStatistics() {
    if (this.historicalData.length === 0) {
      return null;
    }

    const distances = this.historicalData.map(d => d.distance);
    const fuelCosts = this.historicalData.map(d => d.fuelCost);
    
    return {
      totalTrips: this.historicalData.length,
      averageDistance: distances.reduce((a, b) => a + b, 0) / distances.length,
      averageFuelCost: fuelCosts.reduce((a, b) => a + b, 0) / fuelCosts.length,
      minDistance: Math.min(...distances),
      maxDistance: Math.max(...distances),
      minFuelCost: Math.min(...fuelCosts),
      maxFuelCost: Math.max(...fuelCosts)
    };
  }
} 