'use client';

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, Zap } from 'lucide-react';
import type { CargoItem } from '@/types/calculation';
import { FuelCostPredictor, RouteRecommendationEngine, type AIHistoricalData, type AIPrediction } from '@/lib/ai';

interface AIInsightsProps {
  cargoItems: CargoItem[];
  routeDistance: number;
  totalWeight: number;
  fuelCosts: number;
}

export default function AIInsights({ cargoItems, routeDistance, totalWeight, fuelCosts }: AIInsightsProps) {
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Симуляція історичних даних для демонстрації AI
  const generateMockHistoricalData = (): AIHistoricalData[] => {
    const routes = [
      { from: 'Київ', to: 'Львів', baseDistance: 540 },
      { from: 'Львів', to: 'Одеса', baseDistance: 790 },
      { from: 'Київ', to: 'Харків', baseDistance: 480 },
      { from: 'Одеса', to: 'Київ', baseDistance: 475 }
    ];

    const mockData: AIHistoricalData[] = [];
    
    for (let i = 0; i < 20; i++) {
      const route = routes[Math.floor(Math.random() * routes.length)];
      const variation = 0.8 + Math.random() * 0.4; // ±20% варіація
      const distance = Math.round(route.baseDistance * variation);
      const weight = 5000 + Math.random() * 20000; // 5-25 тонн
      const fuelCost = Math.round((distance / 100) * 25 * 50 * (1 + weight / 25000 * 0.3)); // базова формула

      mockData.push({
        id: `trip-${i}`,
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        distance,
        fuelCost,
        deliveryTime: distance / (60 + Math.random() * 30), // 60-90 км/год
        route: { from: route.from, to: route.to },
        cargoWeight: weight,
        cargoVolume: weight / 400, // приблизна щільність
        weather: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
      });
    }

    return mockData;
  };

  useEffect(() => {
    if (routeDistance > 0 && totalWeight > 0) {
      setIsLoading(true);
      
      // Симуляція AI обчислень
      setTimeout(() => {
        const historicalData = generateMockHistoricalData();
        const fuelPredictor = new FuelCostPredictor(historicalData);
        const recommendationEngine = new RouteRecommendationEngine(historicalData);

        // Прогнозування витрат палива
        const prediction = fuelPredictor.predictFuelCost(routeDistance, totalWeight, 50);
        setAiPrediction(prediction);

        // Генерація інсайтів
        const efficiency = recommendationEngine.analyzeOperationalEfficiency();
        const quickInsights = recommendationEngine.getQuickInsights();
        
        setInsights({
          efficiency,
          quickInsights,
          recommendations: recommendationEngine.generateBusinessRecommendations().slice(0, 3)
        });

        setIsLoading(false);
      }, 1000);
    }
  }, [routeDistance, totalWeight, fuelCosts]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!cargoItems.length || routeDistance === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">AI Аналітика</h2>
        </div>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-gray-400 mb-2">Додайте вантаж та маршрут</p>
          <p className="text-sm text-gray-500">AI проаналізує ваші дані та надасть рекомендації</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-bold text-white">AI Аналітика</h2>
        {isLoading && (
          <div className="flex items-center gap-2 text-purple-400">
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Аналізую...</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-800/50 rounded-lg p-4 h-20"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Прогноз витрат палива */}
          {aiPrediction && (
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-700/30">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">AI Прогноз витрат</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-400">Прогнозовані витрати</p>
                  <p className="text-2xl font-bold text-white">{aiPrediction.predicted} ₴</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Точність прогнозу</p>
                  <p className={`text-xl font-bold ${getConfidenceColor(aiPrediction.confidence)}`}>
                    {Math.round(aiPrediction.confidence * 100)}%
                  </p>
                </div>
              </div>

              {aiPrediction.recommendation && (
                <div className="bg-gray-800/50 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">{aiPrediction.recommendation}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1 mt-3">
                {aiPrediction.factors.map((factor, index) => (
                  <span
                    key={index}
                    className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Швидкі інсайти */}
          {insights?.quickInsights && (
            <div className="bg-gradient-to-r from-cyan-900/30 to-teal-900/30 rounded-lg p-4 border border-cyan-700/30">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Швидкі інсайти</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-400">Загальна оцінка</p>
                  <p className={`text-2xl font-bold ${getScoreColor(insights.quickInsights.averageProfitability)}`}>
                    {insights.quickInsights.averageProfitability}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Рівень ризику</p>
                  <p className={`text-lg font-bold ${
                    insights.quickInsights.riskLevel === 'low' ? 'text-green-400' :
                    insights.quickInsights.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {insights.quickInsights.riskLevel === 'low' ? 'Низький' :
                     insights.quickInsights.riskLevel === 'medium' ? 'Середній' : 'Високий'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-sm text-gray-300">{insights.quickInsights.nextRecommendation}</p>
              </div>
            </div>
          )}

          {/* AI Рекомендації */}
          {insights?.recommendations && insights.recommendations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">AI Рекомендації</h3>
              </div>

              {insights.recommendations.map((rec: any, index: number) => (
                <div
                  key={index}
                  className={`bg-gradient-to-r rounded-lg p-3 border ${
                    rec.priority === 'high'
                      ? 'from-red-900/30 to-orange-900/30 border-red-700/30'
                      : rec.priority === 'medium'
                      ? 'from-yellow-900/30 to-amber-900/30 border-yellow-700/30'
                      : 'from-blue-900/30 to-indigo-900/30 border-blue-700/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm mb-1">{rec.title}</h4>
                      <p className="text-xs text-gray-300 mb-2">{rec.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Пріоритет: {rec.priority === 'high' ? 'Високий' : rec.priority === 'medium' ? 'Середній' : 'Низький'}</span>
                        <span>Потенційна економія: {rec.expectedSaving} {rec.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Статус AI */}
          <div className="text-center pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              🤖 Локальний AI аналіз на основі {insights?.quickInsights?.totalTrips || 20} рейсів
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 