/**
 * 🧠 Розумний бізнес-аналізатор EuroTandemFORCE
 * Надає дієві рекомендації на основі реальної бізнес-логіки
 */

import type { CargoItem, CalculationResult } from '@/types/calculation';

export interface BusinessMetrics {
  profitabilityScore: number; // 0-100
  efficiencyScore: number;    // 0-100
  riskScore: number;          // 0-100
  competitivenessScore: number; // 0-100
}

export interface MarketConditions {
  fuelPriceTrend: 'rising' | 'falling' | 'stable';
  demandLevel: 'high' | 'medium' | 'low';
  seasonality: 'peak' | 'normal' | 'low';
  competition: 'high' | 'medium' | 'low';
}

export interface SmartRecommendation {
  id: string;
  category: 'pricing' | 'route' | 'fuel' | 'timing' | 'risk' | 'strategy';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  actionable: string;
  potentialSavings: number;
  implementationTime: string;
  confidence: number; // 0-100%
  reasoning: string[];
}

export interface BusinessInsight {
  type: 'opportunity' | 'threat' | 'optimization' | 'warning';
  message: string;
  data: any;
  actionRequired: boolean;
}

class BusinessAnalyzer {
  
  /**
   * 🎯 Аналізує поточну ситуацію та генерує розумні рекомендації
   */
  analyzeBusinessSituation(
    cargoItems: CargoItem[], 
    calculation: CalculationResult,
    historicalData?: any[]
  ) {
    
    // 📊 Розрахунок бізнес-метрик
    const metrics = this.calculateBusinessMetrics(cargoItems, calculation);
    
    // 🌍 Аналіз ринкових умов
    const marketConditions = this.analyzeMarketConditions(cargoItems, calculation);
    
    // 🎯 Генерація розумних рекомендацій
    const recommendations = this.generateSmartRecommendations(
      cargoItems, 
      calculation, 
      metrics, 
      marketConditions
    );
    
    // 💡 Бізнес-інсайти
    const insights = this.generateBusinessInsights(cargoItems, calculation, metrics);
    
    return {
      metrics,
      recommendations,
      insights,
      marketConditions
    };
  }

  /**
   * 📊 Розрахунок ключових бізнес-метрик
   */
  private calculateBusinessMetrics(
    cargoItems: CargoItem[], 
    calculation: CalculationResult
  ): BusinessMetrics {
    
    // Рентабельність (0-100)
    let profitabilityScore = 0;
    if (calculation.profitMargin > 25) profitabilityScore = 100;
    else if (calculation.profitMargin > 20) profitabilityScore = 85;
    else if (calculation.profitMargin > 15) profitabilityScore = 70;
    else if (calculation.profitMargin > 10) profitabilityScore = 50;
    else if (calculation.profitMargin > 5) profitabilityScore = 30;
    else if (calculation.profitMargin > 0) profitabilityScore = 15;
    else profitabilityScore = 0;

    // Ефективність
    const avgDistancePerCargo = calculation.totalDistance / cargoItems.length;
    const totalWeight = calculation.totalWeight;
    const loadFactor = totalWeight / 25; // Макс 25 тонн
    
    let efficiencyScore = 0;
    if (loadFactor > 0.9 && avgDistancePerCargo < 600) efficiencyScore = 100;
    else if (loadFactor > 0.8 && avgDistancePerCargo < 800) efficiencyScore = 85;
    else if (loadFactor > 0.7 && avgDistancePerCargo < 1000) efficiencyScore = 70;
    else if (loadFactor > 0.5) efficiencyScore = 50;
    else efficiencyScore = 30;

    // Оцінка ризиків
    let riskScore = 0;
    
    if (calculation.profitMargin < 5) riskScore += 40;
    else if (calculation.profitMargin < 10) riskScore += 25;
    else if (calculation.profitMargin < 15) riskScore += 10;
    
    const repositioningRatio = calculation.distanceBreakdown.repositioningDistance / calculation.totalDistance;
    if (repositioningRatio > 0.3) riskScore += 30;
    else if (repositioningRatio > 0.2) riskScore += 15;
    
    if (loadFactor < 0.5) riskScore += 20;
    else if (loadFactor < 0.7) riskScore += 10;
    
    const fuelPercentage = (calculation.costs.fuel / calculation.costs.total) * 100;
    if (fuelPercentage > 60) riskScore += 10;
    
    riskScore = Math.min(riskScore, 100);

    // Конкурентоспроможність
    const pricePerKm = calculation.totalFreight / calculation.totalDistance;
    let competitivenessScore = 70;
    
    if (pricePerKm > 35) competitivenessScore = 40;
    else if (pricePerKm > 30) competitivenessScore = 60;
    else if (pricePerKm > 25) competitivenessScore = 80;
    else competitivenessScore = 90;

    return {
      profitabilityScore,
      efficiencyScore,
      riskScore,
      competitivenessScore
    };
  }

  /**
   * 🌍 Аналіз ринкових умов
   */
  private analyzeMarketConditions(cargoItems: CargoItem[], calculation: CalculationResult): MarketConditions {
    const currentMonth = new Date().getMonth();
    
    return {
      fuelPriceTrend: currentMonth < 3 || currentMonth > 10 ? 'rising' : 'stable',
      demandLevel: currentMonth >= 3 && currentMonth <= 9 ? 'high' : 'medium',
      seasonality: currentMonth >= 4 && currentMonth <= 8 ? 'peak' : 'normal',
      competition: 'medium'
    };
  }

  /**
   * 🎯 Генерація розумних рекомендацій
   */
  private generateSmartRecommendations(
    cargoItems: CargoItem[],
    calculation: CalculationResult,
    metrics: BusinessMetrics,
    market: MarketConditions
  ): SmartRecommendation[] {
    
    const recommendations: SmartRecommendation[] = [];

    // 💰 Ціноутворення
    if (calculation.profitMargin < 15) {
      recommendations.push({
        id: 'pricing-optimization',
        category: 'pricing',
        priority: 'high',
        title: '💰 Підвищити рентабельність',
        description: `Маржа ${calculation.profitMargin.toFixed(1)}% нижче мінімуму 15%`,
        impact: `+${(calculation.totalFreight * 0.05).toFixed(0)} ₴ до прибутку`,
        actionable: 'Збільшити фрахт на 5-8% або знайти зворотній вантаж',
        potentialSavings: calculation.totalFreight * 0.05,
        implementationTime: 'Наступний рейс',
        confidence: 85,
        reasoning: [
          'Мінімальна безпечна маржа - 15%',
          'Ринкові умови дозволяють підвищення',
          'Конкуренти працюють з вищими тарифами'
        ]
      });
    }

    // ⛽ Паливо
    const fuelPercentage = (calculation.costs.fuel / calculation.costs.total) * 100;
    if (fuelPercentage > 50) {
      recommendations.push({
        id: 'fuel-optimization',
        category: 'fuel',
        priority: 'high',
        title: '⛽ Зменшити витрати на паливо',
        description: `${fuelPercentage.toFixed(1)}% витрат - це паливо (норма 45%)`,
        impact: `-${(calculation.costs.fuel * 0.1).toFixed(0)} ₴ економії`,
        actionable: 'Еко-водіння, дешеві АЗС, техогляд двигуна',
        potentialSavings: calculation.costs.fuel * 0.1,
        implementationTime: 'Негайно',
        confidence: 90,
        reasoning: [
          'Еко-водіння дає 10-15% економії',
          'Вибір АЗС економить 3-7 грн/л',
          'Техстан впливає на витрату до 20%'
        ]
      });
    }

    // 🚚 Маршрут
    const repositioningRatio = calculation.distanceBreakdown.repositioningDistance / calculation.totalDistance;
    if (repositioningRatio > 0.25) {
      recommendations.push({
        id: 'route-optimization',
        category: 'route',
        priority: 'medium',
        title: '🗺️ Зменшити порожні переїзди',
        description: `${(repositioningRatio * 100).toFixed(1)}% відстані без вантажу`,
        impact: `-${(calculation.costs.fuel * repositioningRatio * 0.5).toFixed(0)} ₴ економії`,
        actionable: 'Шукати зворотні вантажі через біржі',
        potentialSavings: calculation.costs.fuel * repositioningRatio * 0.5,
        implementationTime: '1-2 тижні',
        confidence: 75,
        reasoning: [
          'Зворотній вантаж покриває 70-100% витрат',
          'Біржі дають +25% варіантів',
          'Кільцеві маршрути ефективніші'
        ]
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 💡 Бізнес-інсайти
   */
  private generateBusinessInsights(
    cargoItems: CargoItem[],
    calculation: CalculationResult,
    metrics: BusinessMetrics
  ): BusinessInsight[] {
    
    const insights: BusinessInsight[] = [];

    if (calculation.profitMargin > 25) {
      insights.push({
        type: 'opportunity',
        message: `🎯 Відмінна маржа ${calculation.profitMargin.toFixed(1)}%! Час масштабувати`,
        data: { margin: calculation.profitMargin },
        actionRequired: false
      });
    } else if (calculation.profitMargin < 5) {
      insights.push({
        type: 'threat',
        message: `⚠️ Критична маржа ${calculation.profitMargin.toFixed(1)}%! Ризик збитків`,
        data: { margin: calculation.profitMargin },
        actionRequired: true
      });
    }

    const loadUtilization = (calculation.totalWeight / 25) * 100;
    if (loadUtilization < 50) {
      insights.push({
        type: 'optimization',
        message: `📦 Завантаження лише ${loadUtilization.toFixed(1)}% - шукайте додаткові вантажі`,
        data: { utilization: loadUtilization },
        actionRequired: true
      });
    }

    return insights;
  }
}

export const businessAnalyzer = new BusinessAnalyzer();