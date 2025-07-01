// 🤖 EuroTandemFORCE AI Module
// Локальний штучний інтелект для логістики

export { FuelCostPredictor } from './fuelPredictor';
export { RouteOptimizer } from './routeOptimizer';
export { AnomalyDetector } from './anomalyDetector';
export { DeliveryTimePredictor } from './deliveryTimePredictor';
export { PriceOptimizer } from './priceOptimizer';
export { RouteRecommendationEngine } from './recommendations';

// Типи для AI
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
  weather?: string;
  traffic?: number;
}

export interface AIPrediction {
  predicted: number;
  confidence: number;
  factors: string[];
  recommendation?: string;
}

export interface AIRecommendation {
  type: 'route' | 'pricing' | 'timing' | 'fuel';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedSaving: number;
  currency: string;
} 