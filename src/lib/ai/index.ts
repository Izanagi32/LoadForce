/**
 * EuroTandemFORCE AI System
 * Локальна система штучного інтелекту для логістики
 */

// Основні AI типи та інтерфейси
export interface AIHistoricalData {
  id: string;
  date: string;
  distance: number;
  fuelCost: number;
  deliveryTime: number;
  route: {
    from: string;
    to: string;
  };
  cargoWeight: number;
  cargoVolume: number;
  weather: string;
}

export interface AIPrediction {
  predicted: number;
  confidence: number;
  factors: string[];
  recommendation?: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  expectedSaving: number;
  currency: string;
  category: string;
}

// Експорт AI модулів
export { FuelCostPredictor } from './fuelPredictor';
export { RouteOptimizer } from './routeOptimizer';
export { AnomalyDetector } from './anomalyDetector';
export { DeliveryTimePredictor } from './deliveryTimePredictor';
export { PriceOptimizer } from './priceOptimizer';
export { RouteRecommendationEngine } from './recommendations';

// Нові розумні модулі
export { businessAnalyzer, type SmartRecommendation, type BusinessMetrics, type BusinessInsight } from './businessAnalyzer'; 