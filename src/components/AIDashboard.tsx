'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, PieChart, Map } from 'lucide-react';
import type { CargoItem, CalculationResult } from '@/types/calculation';

interface AIDashboardProps {
  cargoItems: CargoItem[];
  calculationResult: CalculationResult | null;
  className?: string;
}

export default function AIDashboard({ cargoItems, calculationResult, className = '' }: AIDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'routes'>('overview');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-blue-400 animate-pulse" />
          <h2 className="text-xl font-bold text-white">AI Analytics Dashboard</h2>
        </div>
        <div className="animate-pulse bg-gray-800/50 rounded-lg p-4 h-48"></div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">AI Analytics Dashboard</h2>
        </div>
        
        <div className="flex bg-gray-800/50 rounded-lg p-1">
          {(['overview', 'trends', 'routes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs rounded transition-all ${
                activeTab === tab
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {tab === 'overview' && '📊 Огляд'}
              {tab === 'trends' && '📈 Тренди'}
              {tab === 'routes' && '🗺️ Маршрути'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5" />
                Прибутковість
              </h3>
              <div className="text-center py-20">
                <div className="text-3xl font-bold text-green-300 mb-2">18.3%</div>
                <div className="text-sm text-green-400">Маржа прибутку</div>
                <div className="text-lg text-green-200 mt-4">
                  {calculationResult ? `${calculationResult.netProfit.toLocaleString()} ₴` : '0 ₴'}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-700/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5" />
                Ефективність
              </h3>
              <div className="text-center py-20">
                <div className="text-3xl font-bold text-blue-300 mb-2">82.4%</div>
                <div className="text-sm text-blue-400">Загальна ефективність</div>
                <div className="text-lg text-blue-200 mt-4">
                  {cargoItems.length} активних рейсів
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-700/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5" />
              Аналіз трендів
            </h3>
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">📈 Інтерактивні графіки</p>
              <p className="text-gray-500 mt-2">Chart.js графіки в розробці...</p>
            </div>
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-700/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-orange-300 flex items-center gap-2 mb-4">
              <Map className="w-5 h-5" />
              Аналіз маршрутів
            </h3>
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">🗺️ Heatmap ефективності</p>
              <p className="text-gray-500 mt-2">Карта маршрутів в розробці...</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          📊 AI Analytics • Оновлено щойно
        </p>
      </div>
    </div>
  );
}