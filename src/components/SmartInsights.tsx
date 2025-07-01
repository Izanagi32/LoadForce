'use client';

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Zap, Target, Lightbulb, CheckCircle } from 'lucide-react';
import { businessAnalyzer } from '@/lib/ai/businessAnalyzer';
import type { CargoItem, CalculationResult } from '@/types/calculation';

interface SmartInsightsProps {
  cargoItems: CargoItem[];
  calculationResult: CalculationResult | null;
  className?: string;
}

export default function SmartInsights({ cargoItems, calculationResult, className = '' }: SmartInsightsProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (calculationResult && cargoItems.length > 0) {
      setIsAnalyzing(true);
      
      setTimeout(() => {
        try {
          const result = businessAnalyzer.analyzeBusinessSituation(cargoItems, calculationResult);
          setAnalysis(result);
        } catch (error) {
          console.error('AI Analysis error:', error);
        }
        setIsAnalyzing(false);
      }, 1000);
    }
  }, [cargoItems, calculationResult]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!calculationResult || cargoItems.length === 0) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Додайте вантаж для Smart AI аналізу</p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-blue-400 animate-pulse mx-auto mb-4" />
          <p className="text-blue-300">🧠 AI аналізує ваш бізнес...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Smart AI</h2>
      </div>

      {analysis ? (
        <div className="space-y-4">
          {/* Business Score */}
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <h3 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Business Score
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis.metrics?.profitabilityScore || 0)}`}>
                  {analysis.metrics?.profitabilityScore || 0}
                </div>
                <div className="text-xs text-gray-400">Рентабельність</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis.metrics?.efficiencyScore || 0)}`}>
                  {analysis.metrics?.efficiencyScore || 0}
                </div>
                <div className="text-xs text-gray-400">Ефективність</div>
              </div>
            </div>
          </div>

          {/* Top Recommendation */}
          {analysis.recommendations && analysis.recommendations.length > 0 ? (
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
              <h3 className="text-yellow-300 font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Головна рекомендація
              </h3>
              <div className="space-y-2">
                <h4 className="text-white font-medium">{analysis.recommendations[0].title}</h4>
                <p className="text-gray-300 text-sm">{analysis.recommendations[0].description}</p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                  <p className="text-yellow-200 text-sm">{analysis.recommendations[0].actionable}</p>
                </div>
                <div className="text-green-400 font-bold text-sm">
                  💰 Економія: {analysis.recommendations[0].potentialSavings?.toLocaleString() || 0} ₴
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-green-300 font-semibold">Відмінно!</h3>
                  <p className="text-green-200 text-sm">AI не знайшов критичних проблем</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Insights */}
          {analysis.insights && analysis.insights.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-gray-300 font-semibold text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Швидкі інсайти
              </h3>
              {analysis.insights.slice(0, 2).map((insight: any, index: number) => (
                <div key={index} className="bg-gray-800/30 border border-gray-600 rounded p-3">
                  <p className="text-gray-300 text-sm">{insight.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">Помилка AI аналізу</p>
        </div>
      )}

      <div className="mt-6 text-center pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          🧠 Smart AI • Розумна аналітика • Локальний процесинг
        </p>
      </div>
    </div>
  );
} 