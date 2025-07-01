'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Calculator, TrendingUp, Activity, Zap, Brain } from 'lucide-react';
import AIDashboard from '@/components/AIDashboard';
import type { CargoItem, CalculationResult } from '@/types/calculation';

export default function DashboardPage() {
  const [mockCargoItems] = useState<CargoItem[]>([
    {
      id: 'demo-1',
      name: 'Промислове обладнання',
      loadingPoint: 'Київ',
      unloadingPoint: 'Львів',
      weight: 22.5,
      volume: 45,
      freight: 25000,
      currency: 'UAH',
      distance: 540
    },
    {
      id: 'demo-2',
      name: 'Харчові продукти',
      loadingPoint: 'Львів',
      unloadingPoint: 'Одеса',
      weight: 18.2,
      volume: 65,
      freight: 18500,
      currency: 'UAH',
      distance: 790
    }
  ]);

  const [mockCalculationResult] = useState<CalculationResult>({
    totalDistance: 1330,
    totalWeight: 40.7,
    totalVolume: 110,
    totalFreight: 43500,
    grossProfit: 8775,
    distanceBreakdown: {
      deliveryDistance: 1330,
      repositioningDistance: 0
    },
    costs: {
      fuel: 19950,
      driver: 6525,
      daily: 8250,
      additional: 800,
      total: 35525
    },
    costBreakdown: {
      fuel: {
        amount: 19950,
        percentage: 56.2,
        details: {
          delivery: 19950,
          repositioning: 0,
          totalLiters: 399,
          deliveryLiters: 399,
          repositioningLiters: 0,
          pricePerLiter: 50,
          currency: 'UAH'
        }
      },
      driver: {
        amount: 6525,
        percentage: 18.4,
        details: {
          basePercentage: 15,
          adjustedPercentage: 15,
          totalFreight: 43500,
          isFullLoad: true
        }
      },
      daily: {
        amount: 8250,
        percentage: 23.2,
        details: {
          ratePerDay: 550,
          numberOfDays: 15,
          originalAmount: 8250,
          currency: 'UAH'
        }
      },
      additional: {
        amount: 800,
        percentage: 2.2,
        details: {
          parking: 300,
          tolls: 400,
          other: 100,
          totalInOriginalCurrency: 800,
          currency: 'UAH'
        }
      }
    },
    netProfit: 7975,
    profitMargin: 18.3,
    costPerKm: 26.7,
    revenuePerKm: 32.7
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  EuroTandemFORCE Dashboard
                </h1>
                <p className="text-xs text-gray-400">AI-powered Analytics & Insights</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* KPI Cards */}
              <div className="hidden lg:flex items-center space-x-3">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 border border-green-500/30">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <div>
                      <div className="text-xs text-green-400">Прибутковість</div>
                      <div className="text-sm font-bold text-white">18.3%</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-500/30">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-xs text-blue-400">Ефективність</div>
                      <div className="text-sm font-bold text-white">82.4%</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 border border-purple-500/30">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-xs text-purple-400">AI Score</div>
                      <div className="text-sm font-bold text-white">94/100</div>
                    </div>
                  </div>
                </div>
              </div>

              <button className="group relative flex items-center px-4 py-2 text-sm text-blue-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-blue-500/50 transition-all duration-300">
                <Calculator className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                Калькулятор
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 lg:px-6 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-blue-700/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  🎉 Вітаємо в EuroTandemFORCE!
                </h2>
                <p className="text-blue-200 mb-4">
                  Розумна аналітика для оптимізації логістичних операцій
                </p>
                <div className="flex items-center gap-4 text-sm text-blue-300">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>AI-прогнозування</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Інтерактивні графіки</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Аналіз трендів</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Brain className="w-12 h-12 text-white animate-pulse" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-50 animate-ping"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Dashboard */}
        <AIDashboard 
          cargoItems={mockCargoItems}
          calculationResult={mockCalculationResult}
          className="w-full"
        />

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700/30 rounded-lg p-4 hover:border-green-500/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <Calculator className="w-6 h-6 text-green-400 group-hover:animate-bounce" />
              <h3 className="text-green-300 font-semibold">Новий розрахунок</h3>
            </div>
            <p className="text-sm text-green-400/70">Створити розрахунок рейсу</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-700/30 rounded-lg p-4 hover:border-blue-500/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-6 h-6 text-blue-400 group-hover:animate-bounce" />
              <h3 className="text-blue-300 font-semibold">Звіти</h3>
            </div>
            <p className="text-sm text-blue-400/70">Детальна аналітика</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/30 rounded-lg p-4 hover:border-purple-500/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-6 h-6 text-purple-400 group-hover:animate-bounce" />
              <h3 className="text-purple-300 font-semibold">AI Рекомендації</h3>
            </div>
            <p className="text-sm text-purple-400/70">Оптимізація маршрутів</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-700/30 rounded-lg p-4 hover:border-orange-500/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-orange-400 group-hover:animate-bounce" />
              <h3 className="text-orange-300 font-semibold">Тренди</h3>
            </div>
            <p className="text-sm text-orange-400/70">Аналіз прибутковості</p>
          </div>
        </div>
      </div>
    </div>
  );
} 