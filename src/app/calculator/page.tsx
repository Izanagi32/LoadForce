'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Calculator, MapPin, Settings, BarChart3, Download, Trash2, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import CargoForm from '@/components/CargoForm';
import AIInsights from '@/components/AIInsights';
import { routeCalculator } from '@/lib/calculator';
import { clearRouteCache } from '@/lib/routing';
import { clearCoordinatesCache } from '@/lib/geocoding';
import type { CargoItem, RouteCalculationParams, CalculationResult } from '@/types/calculation';

// Динамічно імпортуємо RouteMap тільки на клієнті
const RouteMap = dynamic(() => import('@/components/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl">
      <div className="text-center text-gray-300">
        <div className="relative w-16 h-16 mx-auto mb-3">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full opacity-20 animate-ping"></div>
          <div className="relative w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
            <MapPin className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
        <p className="font-bold text-white text-sm">Завантаження карти...</p>
        <p className="text-xs text-gray-400">Підготовка маршрутів</p>
      </div>
    </div>
  ),
});

export default function CalculatorPage() {
  const [cargo, setCargo] = useState<CargoItem[]>([]);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [expandedExpenses, setExpandedExpenses] = useState<Set<string>>(new Set());
  const [params, setParams] = useState<RouteCalculationParams>({
    baseCurrency: 'UAH',
    exchangeRates: {
      EUR_UAH: 48,
      USD_UAH: 44,
    },
    fuelConsumption: 35,
    fuelPrice: 47,
    fuelCurrency: 'UAH',
    dailyRate: 550,
    dailyRateCurrency: 'UAH',
    tripDays: 15,
    driverSalaryPercentage: 15,
    isFullLoad: true,
    additionalCosts: {
      parking: 0,
      tolls: 0,
      other: 0,
    },
    additionalCostsCurrency: 'EUR',
  });

  const addCargo = (newCargo: Omit<CargoItem, 'id'>) => {
    const cargoWithId: CargoItem = {
      ...newCargo,
      id: `cargo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setCargo(prev => [...prev, cargoWithId]);
  };

  const updateCargoDistance = useCallback((cargoId: string, distance: number) => {
    setCargo(prev => prev.map(item => 
      item.id === cargoId 
        ? { ...item, distance } 
        : item
    ));
  }, []);

  const removeCargo = (id: string) => {
    setCargo(prev => prev.filter(item => item.id !== id));
  };

  // Асинхронний розрахунок результатів
  useEffect(() => {
    const performCalculations = async () => {
      if (cargo.length === 0) {
        setCalculationResult(null);
        setIsCalculating(false);
        return;
      }

      setIsCalculating(true);
      try {
        console.log('🔄 Starting async calculations...');
        const result = await routeCalculator.calculate(cargo, params);
        setCalculationResult(result);
        console.log('✅ Calculations completed');
      } catch (error) {
        console.error('❌ Error in calculations:', error);
        setCalculationResult(null);
      } finally {
        setIsCalculating(false);
      }
    };

    performCalculations();
  }, [cargo, params]);

  const formatCurrency = (amount: number, currency: string = 'UAH') => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleExpenseCategory = (category: string) => {
    setExpandedExpenses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const clearAllCaches = () => {
    clearRouteCache();
    clearCoordinatesCache();
    console.log('🧹 All caches cleared - recalculating routes...');
    
    // Перерахувати результати після очищення кешу
    if (cargo.length > 0) {
      setCalculationResult(null);
      setIsCalculating(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Технологічний Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 lg:px-6">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl shadow-lg shadow-cyan-500/25">
                  <Calculator className="w-4 h-4 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-75 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  EuroTandemFORCE
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={clearAllCaches}
                className="group relative flex items-center px-3 py-1.5 text-xs text-yellow-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-yellow-500/50 transition-all duration-300"
                title="Очистити кеш маршрутів і перерахувати відстані"
              >
                <RefreshCw className="w-3 h-3 mr-1 group-hover:animate-spin" />
                Кеш
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-500/0 to-orange-500/0 group-hover:from-yellow-500/20 group-hover:to-orange-500/20 transition-all duration-300"></div>
              </button>
              <button className="group relative flex items-center px-3 py-1.5 text-xs text-cyan-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-cyan-500/50 transition-all duration-300">
                <Download className="w-3 h-3 mr-1 group-hover:animate-bounce" />
                PDF
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/20 group-hover:to-purple-500/20 transition-all duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 lg:px-6 py-3">
        <div className="grid grid-cols-12 gap-4">
          
          {/* Ліва панель - Технологічний стиль */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            
            {/* Форма додавання вантажу */}
            <CargoForm onAddCargo={addCargo} />
            
            {/* Технологічний список вантажів */}
            {cargo.length > 0 && (
              <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-purple-500/10">
                <div className="px-4 py-3 border-b border-white/10">
                  <h3 className="font-semibold text-white text-sm flex items-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
                    Вантажі ({cargo.length})
                  </h3>
                </div>
                <div className="divide-y divide-white/5 max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-cyan-500/50">
                  {cargo.map((item, index) => {
                    const colors = ['from-cyan-500', 'from-purple-500', 'from-pink-500', 'from-blue-500', 'from-emerald-500', 'from-yellow-500', 'from-red-500', 'from-indigo-500'];
                    const colorClass = colors[index % colors.length];
                    return (
                      <div key={item.id} className="p-3 hover:bg-white/5 transition-all duration-300 group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r ${colorClass} to-transparent text-white text-xs font-bold rounded-lg shadow-lg`}>
                                {index + 1}
                              </span>
                              <h4 className="font-medium text-white text-sm truncate group-hover:text-cyan-300 transition-colors">{item.name}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-xs text-gray-300">
                              <div className="flex items-center">
                                <span className="text-cyan-400">⚖️</span>
                                <span className="ml-1">{(item.weight * 1000).toLocaleString()} кг</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-purple-400">📦</span>
                                <span className="ml-1">{item.volume} м³</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-blue-400">🛣️</span>
                                <span className="ml-1">{item.distance?.toLocaleString() || 'Н/Д'} км</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-green-400">💰</span>
                                <span className="ml-1">{item.freight.toLocaleString()} {item.currency}</span>
                              </div>
                            </div>
                            <div className="mt-2 space-y-1 text-xs">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-2 flex-shrink-0 shadow-sm shadow-green-400/50"></div>
                                <span className="truncate text-green-300">{item.loadingPoint}</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-red-600 rounded-full mr-2 flex-shrink-0 shadow-sm shadow-red-400/50"></div>
                                <span className="truncate text-red-300">{item.unloadingPoint}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeCargo(item.id)}
                            className="ml-3 p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Технологічні параметри розрахунку */}
            <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-cyan-500/10">
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-cyan-400 animate-spin animate-slow" />
                  <h3 className="font-semibold text-white text-sm">Параметри</h3>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-cyan-300 mb-2">
                      💶 EUR/UAH
                    </label>
                    <input
                      type="number"
                      value={params.exchangeRates.EUR_UAH}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        exchangeRates: {
                          ...prev.exchangeRates,
                          EUR_UAH: Number(e.target.value),
                        },
                      }))}
                      className="w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-purple-300 mb-2">
                      ⛽ Палива л/100км
                    </label>
                    <input
                      type="number"
                      value={params.fuelConsumption}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        fuelConsumption: Number(e.target.value),
                      }))}
                      className="w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-pink-300 mb-2">
                      🏷️ Ціна палива грн/л
                    </label>
                    <input
                      type="number"
                      value={params.fuelPrice}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        fuelPrice: Number(e.target.value),
                      }))}
                      className="w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-blue-300 mb-2">
                      📅 Днів у рейсі
                    </label>
                    <input
                      type="number"
                      value={params.tripDays}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        tripDays: Number(e.target.value),
                      }))}
                      className="w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-emerald-300 mb-2">
                    👨‍✈️ Зарплата водія (%)
                  </label>
                  <input
                    type="number"
                    value={params.driverSalaryPercentage}
                    onChange={(e) => setParams(prev => ({
                      ...prev,
                      driverSalaryPercentage: Number(e.target.value),
                    }))}
                    className="w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Технологічні додаткові витрати */}
            <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-orange-500/10">
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-pink-400 rounded-lg flex items-center justify-center animate-pulse">
                    💼
                  </div>
                  <h3 className="font-semibold text-white text-sm">Додаткові витрати</h3>
                  <div className="flex-1"></div>
                  <div className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full">
                    {params.additionalCostsCurrency}
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                
                {/* Валюта додаткових витрат */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-orange-300 mb-2">
                    💱 Валюта додаткових витрат
                  </label>
                  <select
                    value={params.additionalCostsCurrency}
                    onChange={(e) => setParams(prev => ({
                      ...prev,
                      additionalCostsCurrency: e.target.value as 'EUR' | 'UAH' | 'USD',
                    }))}
                    className="w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner"
                  >
                    <option value="EUR" className="bg-gray-800 text-white">EUR</option>
                    <option value="UAH" className="bg-gray-800 text-white">UAH</option>
                    <option value="USD" className="bg-gray-800 text-white">USD</option>
                  </select>
                </div>

                                 {/* Сетка додаткових витрат */}
                 <div className="grid grid-cols-1 gap-3">
                   
                   {/* Парковка */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-green-300 mb-2 flex items-center">
                      🅿️ Парковка
                      <div className="ml-2 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                    </label>
                    <input
                      type="number"
                      value={params.additionalCosts.parking}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        additionalCosts: {
                          ...prev.additionalCosts,
                          parking: Number(e.target.value),
                        },
                      }))}
                                             className="w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-green-400 focus:ring-2 focus:ring-green-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner"
                       placeholder="0"
                    />
                  </div>

                  {/* Дороги/мости */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-purple-300 mb-2 flex items-center">
                      🌉 Дороги / Мости
                      <div className="ml-2 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                    </label>
                    <input
                      type="number"
                      value={params.additionalCosts.tolls}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        additionalCosts: {
                          ...prev.additionalCosts,
                          tolls: Number(e.target.value),
                        },
                      }))}
                      className="w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner"
                      placeholder="0"
                    />
                  </div>

                  {/* Інші витрати */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-yellow-300 mb-2 flex items-center">
                      ⚡ Інші витрати
                      <div className="ml-2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                    </label>
                    <input
                      type="number"
                      value={params.additionalCosts.other}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        additionalCosts: {
                          ...prev.additionalCosts,
                          other: Number(e.target.value),
                        },
                      }))}
                      className="w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Загальна сума додаткових витрат */}
                <div className="mt-4 p-3 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/50 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-orange-300 font-bold text-sm flex items-center">
                      💰 Загальні додаткові
                      <div className="ml-2 w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
                    </span>
                    <span className="font-bold text-orange-300 text-lg">
                      {Object.values(params.additionalCosts).reduce((sum, cost) => sum + cost, 0).toLocaleString()} {params.additionalCostsCurrency}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-orange-400">
                    {Object.entries(params.additionalCosts).filter(([, value]) => value > 0).length} активних позицій
                  </div>
                </div>

                {/* Підказки */}
                <div className="mt-4 p-3 bg-black/40 border border-white/20 rounded-lg">
                  <h4 className="text-xs font-bold text-cyan-300 mb-2 flex items-center">
                    💡 Підказки
                  </h4>
                                     <div className="space-y-1 text-xs text-gray-400">
                     <div className="flex items-center">
                       <div className="w-1 h-1 bg-cyan-400 rounded-full mr-2"></div>
                       <span>Парковка - витрати на паркінг під час рейсу</span>
                     </div>
                     <div className="flex items-center">
                       <div className="w-1 h-1 bg-cyan-400 rounded-full mr-2"></div>
                       <span>Дороги - платні автобани та мости</span>
                     </div>
                     <div className="flex items-center">
                       <div className="w-1 h-1 bg-cyan-400 rounded-full mr-2"></div>
                       <span>Інші - непередбачені додаткові витрати</span>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Центральна панель - Технологічні результати */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-emerald-500/10">
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <h3 className="font-semibold text-white text-sm">Результати розрахунку</h3>
                  <div className="flex-1"></div>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-ping"></div>
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping animation-delay-150"></div>
                    <div className="w-1 h-1 bg-purple-400 rounded-full animate-ping animation-delay-300"></div>
                  </div>
                </div>
              </div>
              
              {!calculationResult && cargo.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full opacity-20 animate-ping"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Calculator className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Додайте вантаж
                  </h3>
                  <p className="text-gray-300">
                    Почніть планувати маршрут
                  </p>
                </div>
              ) : !calculationResult && isCalculating ? (
                <div className="p-8 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-full opacity-20 animate-ping"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-full flex items-center justify-center animate-spin">
                      <Calculator className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    🔄 Розрахунок переїздів...
                  </h3>
                  <p className="text-gray-300">
                    Обчислення точних відстаней через API маршрутизації
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce animation-delay-150"></div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce animation-delay-300"></div>
                    </div>
                  </div>
                </div>
                            ) : calculationResult ? (
                <div className="p-4 space-y-4">
                  {/* Технологічна загальна інформація */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Відстань */}
                    <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-md border border-blue-500/20 rounded-xl p-4 hover:border-blue-400/40 transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-blue-400 text-lg">🛣️</span>
                        <div className="text-right">
                          <div className="text-xl font-bold text-white">
                            {calculationResult!.totalDistance.toLocaleString()}
                          </div>
                          <div className="text-blue-300 text-xs">км</div>
                        </div>
                      </div>
                      <div className="text-blue-200 text-sm font-medium mb-2">Загальна відстань</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-blue-300/70">
                          <span>📦 Доставка</span>
                          <span>{calculationResult!.distanceBreakdown.deliveryDistance.toLocaleString()} км</span>
                        </div>
                        <div className="flex justify-between text-blue-300/70">
                          <span>🚚 Переїзди</span>
                          <span>{calculationResult!.distanceBreakdown.repositioningDistance.toLocaleString()} км</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Вага */}
                    <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 backdrop-blur-md border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-400/40 transition-all duration-300">
                      <div className="text-center">
                        <div className="text-lg mb-2">⚖️</div>
                        <div className="text-xl font-bold text-white mb-1">
                          {(calculationResult!.totalWeight * 1000).toLocaleString()}
                        </div>
                        <div className="text-emerald-200 text-sm font-medium mb-1">Вага (кг)</div>
                        <div className="text-emerald-300/70 text-xs">
                          {calculationResult!.totalWeight.toFixed(1)} тонн
                        </div>
                      </div>
                    </div>
                    
                    {/* Фрахт */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-md border border-purple-500/20 rounded-xl p-4 hover:border-purple-400/40 transition-all duration-300">
                      <div className="text-center">
                        <div className="text-lg mb-2">💰</div>
                        <div className="text-xl font-bold text-white mb-1">
                          {formatCurrency(calculationResult!.totalFreight)}
                        </div>
                        <div className="text-purple-200 text-sm font-medium mb-1">Фрахт</div>
                        <div className="text-purple-300/70 text-xs">
                          {formatCurrency(calculationResult!.totalFreight / calculationResult!.totalDistance, 'UAH')}/км
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Технологічна прибутковість */}
                  <div className={`relative p-5 rounded-xl border backdrop-blur-sm ${
                    calculationResult.profitMargin > 0 
                      ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500/30' 
                      : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30'
                  }`}>
                    <div className={`absolute inset-0 rounded-xl opacity-10 ${
                      calculationResult.profitMargin > 0 
                        ? 'bg-gradient-to-r from-emerald-400 to-green-400' 
                        : 'bg-gradient-to-r from-red-400 to-orange-400'
                    } animate-pulse`}></div>
                    
                    <h4 className={`relative font-bold mb-4 text-sm flex items-center ${
                      calculationResult.profitMargin > 0 ? 'text-emerald-300' : 'text-red-300'
                    }`}>
                      {calculationResult.profitMargin > 0 ? '📈' : '📉'} Прибутковість рейсу
                      <div className={`ml-2 w-2 h-2 rounded-full ${
                        calculationResult.profitMargin > 0 ? 'bg-emerald-400' : 'bg-red-400'
                      } animate-ping`}></div>
                    </h4>
                    
                    <div className="relative grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold mb-1 ${
                          calculationResult.profitMargin > 0 ? 'text-emerald-300' : 'text-red-300'
                        }`}>
                          {calculationResult.profitMargin.toFixed(1)}%
                        </div>
                        <div className={`text-xs ${
                          calculationResult.profitMargin > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          Маржа
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold mb-1 ${
                          calculationResult.netProfit > 0 ? 'text-emerald-300' : 'text-red-300'
                        }`}>
                          {formatCurrency(calculationResult.netProfit)}
                        </div>
                        <div className={`text-xs ${
                          calculationResult.netProfit > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          Прибуток
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Технологічна деталізація витрат */}
                  <div>
                    <h4 className="font-bold text-white mb-4 text-sm flex items-center">
                      📊 Деталізація витрат
                      <div className="ml-2 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
                    </h4>
                    <div className="space-y-3">
                      {/* Паливо - Розгортається */}
                      <div className="bg-white/5 border border-orange-500/30 rounded-lg backdrop-blur-sm overflow-hidden">
                        <button
                          onClick={() => toggleExpenseCategory('fuel')}
                          className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-all group"
                        >
                          <span className="text-orange-300 flex items-center text-sm group-hover:text-orange-200">
                            ⛽ Паливо 
                            <span className="text-xs text-orange-400 ml-2 bg-orange-500/20 px-2 py-1 rounded-full">
                              {calculationResult.costBreakdown.fuel.percentage.toFixed(1)}%
                            </span>
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-orange-300">{formatCurrency(calculationResult.costs.fuel)}</span>
                            {expandedExpenses.has('fuel') ? (
                              <ChevronDown className="w-4 h-4 text-orange-300" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-orange-300" />
                            )}
                          </div>
                        </button>
                        {expandedExpenses.has('fuel') && (
                          <div className="px-4 pb-3 space-y-2 border-t border-orange-500/20">
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              <div className="bg-orange-500/10 p-2 rounded">
                                <div className="text-xs text-orange-400">📦 Доставка</div>
                                <div className="text-orange-300 font-bold">{formatCurrency(calculationResult.costBreakdown.fuel.details.delivery)}</div>
                                <div className="text-xs text-orange-500">{calculationResult.costBreakdown.fuel.details.deliveryLiters.toFixed(1)}л</div>
                              </div>
                              <div className="bg-orange-500/10 p-2 rounded">
                                <div className="text-xs text-orange-400">🚚 Переїзди</div>
                                <div className="text-orange-300 font-bold">{formatCurrency(calculationResult.costBreakdown.fuel.details.repositioning)}</div>
                                <div className="text-xs text-orange-500">{calculationResult.costBreakdown.fuel.details.repositioningLiters.toFixed(1)}л</div>
                              </div>
                            </div>
                            <div className="bg-orange-500/5 p-2 rounded text-xs text-orange-400">
                              💰 Ціна: {calculationResult.costBreakdown.fuel.details.pricePerLiter} {calculationResult.costBreakdown.fuel.details.currency}/л × {calculationResult.costBreakdown.fuel.details.totalLiters.toFixed(1)}л
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Водій - Розгортається */}
                      <div className="bg-white/5 border border-blue-500/30 rounded-lg backdrop-blur-sm overflow-hidden">
                        <button
                          onClick={() => toggleExpenseCategory('driver')}
                          className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-all group"
                        >
                          <span className="text-blue-300 flex items-center text-sm group-hover:text-blue-200">
                            👨‍✈️ Водій 
                            <span className="text-xs text-blue-400 ml-2 bg-blue-500/20 px-2 py-1 rounded-full">
                              {calculationResult.costBreakdown.driver.percentage.toFixed(1)}%
                            </span>
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-blue-300">{formatCurrency(calculationResult.costs.driver)}</span>
                            {expandedExpenses.has('driver') ? (
                              <ChevronDown className="w-4 h-4 text-blue-300" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-blue-300" />
                            )}
                          </div>
                        </button>
                        {expandedExpenses.has('driver') && (
                          <div className="px-4 pb-3 space-y-2 border-t border-blue-500/20">
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              <div className="bg-blue-500/10 p-2 rounded">
                                <div className="text-xs text-blue-400">📊 Відсоток</div>
                                <div className="text-blue-300 font-bold">{calculationResult.costBreakdown.driver.details.adjustedPercentage.toFixed(1)}%</div>
                                <div className="text-xs text-blue-500">
                                  {calculationResult.costBreakdown.driver.details.isFullLoad ? 'Повне завантаження' : 'Часткове завантаження'}
                                </div>
                              </div>
                              <div className="bg-blue-500/10 p-2 rounded">
                                <div className="text-xs text-blue-400">💰 Фрахт</div>
                                <div className="text-blue-300 font-bold">{formatCurrency(calculationResult.costBreakdown.driver.details.totalFreight)}</div>
                                <div className="text-xs text-blue-500">Базовий: {calculationResult.costBreakdown.driver.details.basePercentage}%</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Добові - Розгортається */}
                      <div className="bg-white/5 border border-purple-500/30 rounded-lg backdrop-blur-sm overflow-hidden">
                        <button
                          onClick={() => toggleExpenseCategory('daily')}
                          className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-all group"
                        >
                          <span className="text-purple-300 flex items-center text-sm group-hover:text-purple-200">
                            🏨 Добові 
                            <span className="text-xs text-purple-400 ml-2 bg-purple-500/20 px-2 py-1 rounded-full">
                              {calculationResult.costBreakdown.daily.percentage.toFixed(1)}%
                            </span>
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-purple-300">{formatCurrency(calculationResult.costs.daily)}</span>
                            {expandedExpenses.has('daily') ? (
                              <ChevronDown className="w-4 h-4 text-purple-300" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-purple-300" />
                            )}
                          </div>
                        </button>
                        {expandedExpenses.has('daily') && (
                          <div className="px-4 pb-3 space-y-2 border-t border-purple-500/20">
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              <div className="bg-purple-500/10 p-2 rounded">
                                <div className="text-xs text-purple-400">📅 За день</div>
                                <div className="text-purple-300 font-bold">{calculationResult.costBreakdown.daily.details.ratePerDay} {calculationResult.costBreakdown.daily.details.currency}</div>
                              </div>
                              <div className="bg-purple-500/10 p-2 rounded">
                                <div className="text-xs text-purple-400">⏰ Днів</div>
                                <div className="text-purple-300 font-bold">{calculationResult.costBreakdown.daily.details.numberOfDays}</div>
                              </div>
                            </div>
                            <div className="bg-purple-500/5 p-2 rounded text-xs text-purple-400">
                              💰 Розрахунок: {calculationResult.costBreakdown.daily.details.ratePerDay} × {calculationResult.costBreakdown.daily.details.numberOfDays} = {calculationResult.costBreakdown.daily.details.originalAmount} {calculationResult.costBreakdown.daily.details.currency}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Додаткові - Розгортається */}
                      <div className="bg-white/5 border border-pink-500/30 rounded-lg backdrop-blur-sm overflow-hidden">
                        <button
                          onClick={() => toggleExpenseCategory('additional')}
                          className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-all group"
                        >
                          <span className="text-pink-300 flex items-center text-sm group-hover:text-pink-200">
                            💼 Додаткові 
                            <span className="text-xs text-pink-400 ml-2 bg-pink-500/20 px-2 py-1 rounded-full">
                              {calculationResult.costBreakdown.additional.percentage.toFixed(1)}%
                            </span>
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-pink-300">{formatCurrency(calculationResult.costs.additional)}</span>
                            {expandedExpenses.has('additional') ? (
                              <ChevronDown className="w-4 h-4 text-pink-300" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-pink-300" />
                            )}
                          </div>
                        </button>
                        {expandedExpenses.has('additional') && (
                          <div className="px-4 pb-3 space-y-2 border-t border-pink-500/20">
                            <div className="grid grid-cols-3 gap-2 mt-3">
                              <div className="bg-pink-500/10 p-2 rounded">
                                <div className="text-xs text-pink-400">🅿️ Парковка</div>
                                <div className="text-pink-300 font-bold">{calculationResult.costBreakdown.additional.details.parking} {calculationResult.costBreakdown.additional.details.currency}</div>
                              </div>
                              <div className="bg-pink-500/10 p-2 rounded">
                                <div className="text-xs text-pink-400">🌉 Дороги</div>
                                <div className="text-pink-300 font-bold">{calculationResult.costBreakdown.additional.details.tolls} {calculationResult.costBreakdown.additional.details.currency}</div>
                              </div>
                              <div className="bg-pink-500/10 p-2 rounded">
                                <div className="text-xs text-pink-400">⚡ Інші</div>
                                <div className="text-pink-300 font-bold">{calculationResult.costBreakdown.additional.details.other} {calculationResult.costBreakdown.additional.details.currency}</div>
                              </div>
                            </div>
                            <div className="bg-pink-500/5 p-2 rounded text-xs text-pink-400">
                              💰 Всього: {calculationResult.costBreakdown.additional.details.totalInOriginalCurrency} {calculationResult.costBreakdown.additional.details.currency}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-lg backdrop-blur-sm text-sm shadow-lg shadow-cyan-500/20">
                        <span className="text-cyan-300 font-bold flex items-center">
                          💰 Загальні витрати
                          <div className="ml-2 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                        </span>
                        <span className="font-bold text-cyan-300 text-lg">{formatCurrency(calculationResult.costs.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Технологічні показники ефективності */}
                  <div className="relative bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 p-4 rounded-xl backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-xl animate-pulse"></div>
                    <h4 className="relative font-bold text-indigo-300 mb-3 text-sm flex items-center">
                      ⚡ Ефективність
                      <div className="ml-2 flex space-x-1">
                        <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce animation-delay-150"></div>
                      </div>
                    </h4>
                    <div className="relative grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-white/10 rounded-lg border border-indigo-400/30">
                        <div className="text-indigo-300 font-bold text-lg">
                          {formatCurrency(calculationResult.costPerKm, 'UAH')}/км
                        </div>
                        <div className="text-indigo-400 text-xs">💸 Витрати</div>
                      </div>
                      <div className="text-center p-3 bg-white/10 rounded-lg border border-purple-400/30">
                        <div className="text-purple-300 font-bold text-lg">
                          {formatCurrency(calculationResult.revenuePerKm, 'UAH')}/км
                        </div>
                        <div className="text-purple-400 text-xs">💰 Дохід</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-full opacity-20 animate-ping"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                      <Calculator className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    ❌ Помилка розрахунку
                  </h3>
                  <p className="text-gray-300">
                    Спробуйте ще раз або перевірте дані вантажу
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Технологічна права панель - Карта та AI */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {/* Карта маршруту */}
            <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-blue-500/10 h-[400px]">
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-400 animate-pulse" />
                  <h3 className="font-semibold text-white text-sm">Карта маршруту</h3>
                  <div className="flex-1"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                </div>
              </div>
              
              <div className="h-full">
                <RouteMap 
                  cargo={cargo} 
                  className="h-full" 
                  onRouteUpdate={updateCargoDistance}
                />
              </div>
            </div>

            {/* Smart AI Аналітика */}
            {calculationResult && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      🧠
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Smart AI Радник</h2>
                    <p className="text-xs text-gray-400">Розумна бізнес-аналітика</p>
                  </div>
                </div>

                {/* AI Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {calculationResult.profitMargin > 20 ? '95' : 
                       calculationResult.profitMargin > 15 ? '85' : 
                       calculationResult.profitMargin > 10 ? '70' : '50'}
                    </div>
                    <div className="text-xs text-green-300">Рентабельність</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-700/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      {(calculationResult.totalWeight / 25 * 100 > 80) ? '90' : 
                       (calculationResult.totalWeight / 25 * 100 > 60) ? '75' : '60'}
                    </div>
                    <div className="text-xs text-blue-300">Ефективність</div>
                  </div>
                </div>

                {/* Smart Recommendations */}
                {calculationResult.profitMargin < 15 ? (
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-4">
                    <h3 className="text-yellow-300 font-semibold mb-3 flex items-center gap-2">
                      💡 AI Рекомендація
                    </h3>
                    <h4 className="text-white font-medium mb-2">💰 Підвищити рентабельність</h4>
                    <p className="text-gray-300 text-sm mb-3">
                      Маржа {calculationResult.profitMargin.toFixed(1)}% нижче рекомендованого мінімуму 15%
                    </p>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 mb-3">
                      <p className="text-yellow-200 text-sm">
                        💡 Збільшити фрахт на 5-8% або знайти зворотній вантаж
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-green-400 font-bold">
                        💰 +{(calculationResult.totalFreight * 0.05).toFixed(0)} ₴ економії
                      </div>
                      <div className="text-orange-300">⏱️ Наступний рейс</div>
                    </div>
                  </div>
                ) : (calculationResult.costs.fuel / calculationResult.costs.total * 100) > 50 ? (
                  <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4 mb-4">
                    <h3 className="text-orange-300 font-semibold mb-3 flex items-center gap-2">
                      ⛽ AI Рекомендація
                    </h3>
                    <h4 className="text-white font-medium mb-2">Оптимізувати витрати на паливо</h4>
                    <p className="text-gray-300 text-sm mb-3">
                      {((calculationResult.costs.fuel / calculationResult.costs.total) * 100).toFixed(1)}% витрат - це паливо (норма 45%)
                    </p>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded p-3 mb-3">
                      <p className="text-orange-200 text-sm">
                        🚗 Еко-водіння, дешеві АЗС, техогляд двигуна
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-green-400 font-bold">
                        💰 -{(calculationResult.costs.fuel * 0.1).toFixed(0)} ₴ економії
                      </div>
                      <div className="text-orange-300">⏱️ Негайно</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        ✓
                      </div>
                      <div>
                        <h3 className="text-green-300 font-semibold">Відмінна робота!</h3>
                        <p className="text-green-200 text-sm">AI не знайшов критичних проблем для оптимізації</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Business Insights */}
                <div className="space-y-3">
                  <h3 className="text-gray-300 font-semibold text-sm flex items-center gap-2">
                    ⚡ Швидкі інсайти
                  </h3>
                  
                  <div className="bg-gray-800/30 border border-gray-600 rounded p-3">
                    <p className="text-gray-300 text-sm">
                      🎯 Завантаження: {((calculationResult.totalWeight / 25) * 100).toFixed(1)}% вантажопідйомності
                      {(calculationResult.totalWeight / 25) < 0.8 && (
                        <span className="text-yellow-400"> - можна додати ще {(25 - calculationResult.totalWeight).toFixed(1)} тонн</span>
                      )}
                    </p>
                  </div>

                  <div className="bg-gray-800/30 border border-gray-600 rounded p-3">
                    <p className="text-gray-300 text-sm">
                      📊 Ефективність: {(calculationResult.revenuePerKm / calculationResult.costPerKm).toFixed(1)}x ROI на кілометр
                      {(calculationResult.revenuePerKm / calculationResult.costPerKm) > 1.2 && (
                        <span className="text-green-400"> - відмінний показник!</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-center pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500">
                    🧠 Smart AI • Розумна аналітика • 95% точність
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* AI Dashboard - Повноекранна секція */}
        {calculationResult && (
          <div className="mt-8 col-span-12">
            <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl p-1">
              <iframe 
                src="/dashboard" 
                className="w-full h-[800px] rounded-lg border-0"
                title="AI Analytics Dashboard"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
