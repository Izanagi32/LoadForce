'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, AlertTriangle, Target, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { businessAnalyzer, type SmartRecommendation, type BusinessMetrics, type BusinessInsight } from '@/lib/ai/businessAnalyzer';
import type { CargoItem, CalculationResult } from '@/types/calculation';

interface SmartAIInsightsProps {
  cargoItems: CargoItem[];
  calculationResult: CalculationResult | null;
  className?: string;
}

export default function SmartAIInsights({ cargoItems, calculationResult, className = '' }: SmartAIInsightsProps) {
  const [analysis, setAnalysis] = useState<{
    metrics: BusinessMetrics;
    recommendations: SmartRecommendation[];
    insights: BusinessInsight[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'insights' | 'coaching'>('recommendations');

  useEffect(() => {
    if (calculationResult && cargoItems.length > 0) {
      setIsAnalyzing(true);
      
      // Симуляція AI аналізу
      setTimeout(() => {
        const result = businessAnalyzer.analyzeBusinessSituation(cargoItems, calculationResult);
        setAnalysis(result);
        setIsAnalyzing(false);
      }, 1500);
    }
  }, [cargoItems, calculationResult]);

  if (!calculationResult || cargoItems.length === 0) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-gray-400 font-medium mb-2">AI Аналіз недоступний</h3>
          <p className="text-gray-500 text-sm">Додайте вантаж для розумного аналізу</p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
        <div className="text-center py-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <Brain className="w-16 h-16 text-blue-400 animate-pulse" />
            <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-white font-bold mb-2">🧠 AI аналізує ваш бізнес...</h3>
          <p className="text-blue-300 text-sm mb-4">Розумна обробка даних</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-yellow-400 font-medium mb-2">Помилка аналізу</h3>
          <p className="text-gray-500 text-sm">Спробуйте оновити дані</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 40) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return '🎯';
      case 'threat': return '⚠️';
      case 'optimization': return '⚡';
      case 'warning': return '🚨';
      default: return '💡';
    }
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-6 h-6 text-blue-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Smart AI Радник</h2>
              <p className="text-xs text-gray-400">Розумна аналітика та рекомендації</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              {analysis.metrics.profitabilityScore}
            </div>
            <div className="text-xs text-gray-400">AI Score</div>
          </div>
        </div>

        {/* AI Metrics Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg border ${getScoreBg(analysis.metrics.profitabilityScore)}`}>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Рентабельність</span>
            </div>
            <div className={`text-lg font-bold ${getScoreColor(analysis.metrics.profitabilityScore)}`}>
              {analysis.metrics.profitabilityScore}/100
            </div>
          </div>

          <div className={`p-3 rounded-lg border ${getScoreBg(analysis.metrics.efficiencyScore)}`}>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-medium">Ефективність</span>
            </div>
            <div className={`text-lg font-bold ${getScoreColor(analysis.metrics.efficiencyScore)}`}>
              {analysis.metrics.efficiencyScore}/100
            </div>
          </div>

          <div className={`p-3 rounded-lg border ${getScoreBg(100 - analysis.metrics.riskScore)}`}>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium">Безпека</span>
            </div>
            <div className={`text-lg font-bold ${getScoreColor(100 - analysis.metrics.riskScore)}`}>
              {100 - analysis.metrics.riskScore}/100
            </div>
          </div>

          <div className={`p-3 rounded-lg border ${getScoreBg(analysis.metrics.competitivenessScore)}`}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Конкуренція</span>
            </div>
            <div className={`text-lg font-bold ${getScoreColor(analysis.metrics.competitivenessScore)}`}>
              {analysis.metrics.competitivenessScore}/100
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-800/50 rounded-lg p-1 mt-4">
          {(['recommendations', 'insights', 'coaching'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 text-xs rounded transition-all ${
                activeTab === tab
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {tab === 'recommendations' && '💡 Рекомендації'}
              {tab === 'insights' && '🎯 Інсайти'}
              {tab === 'coaching' && '🤖 AI Коуч'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {analysis.recommendations.length > 0 ? (
              analysis.recommendations.map((rec, index) => (
                <div key={rec.id} className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 hover:border-blue-500/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPriorityIcon(rec.priority)}</span>
                      <h3 className="font-semibold text-white text-sm">{rec.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                        {rec.confidence}% впевненості
                      </div>
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-400">{rec.implementationTime}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{rec.description}</p>
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 mb-3">
                    <h4 className="text-blue-300 font-medium text-xs mb-1">💡 Дія:</h4>
                    <p className="text-blue-200 text-sm">{rec.actionable}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-green-400 font-bold text-sm">
                      💰 Економія: {rec.potentialSavings.toLocaleString()} ₴
                    </div>
                    <div className="text-orange-300 text-sm">
                      {rec.impact}
                    </div>
                  </div>

                  {rec.reasoning.length > 0 && (
                    <details className="mt-3">
                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-white">
                        🧠 AI обґрунтування
                      </summary>
                      <ul className="mt-2 space-y-1 text-xs text-gray-300 ml-4">
                        {rec.reasoning.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-cyan-400 mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-green-400 font-medium mb-2">Відмінна робота!</h3>
                <p className="text-gray-500 text-sm">AI не знайшов критичних проблем для оптимізації</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            {analysis.insights.map((insight, index) => (
              <div key={index} className="bg-gray-800/30 border border-gray-600 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getInsightIcon(insight.type)}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{insight.message}</p>
                    {insight.actionRequired && (
                      <div className="mt-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded inline-block">
                        ⚡ Потрібна дія
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'coaching' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
              <h3 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                🎯 Ваші сильні сторони
              </h3>
              <div className="space-y-2">
                {analysis.metrics.profitabilityScore > 70 && (
                  <div className="text-green-200 text-sm">• Висока рентабельність - ви ефективніше конкурентів</div>
                )}
                {analysis.metrics.efficiencyScore > 70 && (
                  <div className="text-green-200 text-sm">• Відмінна операційна ефективність</div>
                )}
                {analysis.metrics.competitivenessScore > 70 && (
                  <div className="text-green-200 text-sm">• Конкурентоспроможні тарифи</div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h3 className="text-yellow-300 font-semibold mb-2 flex items-center gap-2">
                <Target className="w-5 h-5" />
                🎯 Можливості для росту
              </h3>
              <div className="space-y-2">
                <div className="text-yellow-200 text-sm">• Збільшення завантаження може додати доходу</div>
                <div className="text-yellow-200 text-sm">• Оптимізація маршрутів зменшить витрати</div>
                <div className="text-yellow-200 text-sm">• Використання сезонності для підвищення цін</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                🚀 Наступні кроки
              </h3>
              <div className="space-y-2">
                <div className="text-blue-200 text-sm">📊 Впровадити щотижневий моніторинг KPI</div>
                <div className="text-blue-200 text-sm">🎯 Встановити цільові показники на квартал</div>
                <div className="text-blue-200 text-sm">🤝 Розширити клієнтську базу</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-700 bg-gray-800/30">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            🧠 Powered by EuroTandemFORCE AI • Оновлено щойно
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            AI активний
          </div>
        </div>
      </div>
    </div>
  );
} 