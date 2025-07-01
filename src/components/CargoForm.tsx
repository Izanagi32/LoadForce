'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Package, Weight, Box, DollarSign, MapPin, FileText, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

import type { CargoItem } from '@/types/calculation';

const cargoSchema = z.object({
  name: z.string().min(1, 'Назва вантажу обов\'язкова'),
  weight: z.number().min(100, 'Мінімальна вага 100 кг').max(40000, 'Максимальна вага 40 тонн'),
  volume: z.number().min(0.1, 'Мінімальний об\'єм 0.1 м³').max(120, 'Максимальний об\'єм 120 м³'),
  freight: z.number().min(1, 'Сума фрахту обов\'язкова'),
  currency: z.enum(['UAH', 'EUR', 'USD']),
  loadingPoint: z.string().min(1, 'Точка завантаження обов\'язкова'),
  unloadingPoint: z.string().min(1, 'Точка розвантаження обов\'язкова'),
  loadingType: z.enum(['full', 'partial']),
  notes: z.string().optional(),
});

type CargoFormData = z.infer<typeof cargoSchema>;

interface CargoFormProps {
  onAddCargo: (cargo: Omit<CargoItem, 'id'>) => void;
  isLoading?: boolean;
}

export default function CargoForm({ onAddCargo, isLoading = false }: CargoFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CargoFormData>({
    resolver: zodResolver(cargoSchema),
    defaultValues: {
      currency: 'EUR',
      weight: 20000, // 20 тонн в кг
      volume: 80,
      loadingType: 'full',
    },
  });

  const loadingType = watch('loadingType');

  const handleFormSubmit = (data: CargoFormData) => {
    onAddCargo({
      name: data.name,
      weight: data.weight / 1000, // конвертуємо кг в тонни для розрахунків
      volume: data.volume,
      freight: data.freight,
      currency: data.currency,
      loadingPoint: data.loadingPoint,
      unloadingPoint: data.unloadingPoint,
      distance: 0, // відстань буде оновлена через API маршрутів
      notes: data.notes,
    });
    reset();
    setIsExpanded(false);
  };

  return (
    <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-cyan-500/10">
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left group"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl shadow-lg shadow-cyan-500/25">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">Додати вантаж</h3>
              <p className="text-xs text-gray-400">Новий пункт маршруту</p>
            </div>
          </div>
          <div className={cn(
            "transition-all duration-300 text-gray-400 group-hover:text-cyan-400",
            isExpanded ? "rotate-45 scale-110" : "rotate-0"
          )}>
            <Plus className="w-5 h-5" />
          </div>
        </button>

        {isExpanded && (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-6 space-y-4">
            
            {/* Технологічна назва вантажу */}
            <div className="bg-black/30 border border-cyan-500/30 p-4 rounded-xl backdrop-blur-sm">
              <h4 className="font-bold text-cyan-300 mb-3 text-sm flex items-center">
                <Package className="w-4 h-4 mr-2" />
                📦 Вантаж
                <div className="ml-2 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-2 flex items-center">
                    ✨ Назва вантажу
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className={cn(
                      "w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner",
                      errors.name ? "border-red-400 focus:border-red-400 focus:ring-red-500/50 bg-red-500/10" : ""
                    )}
                    placeholder="Будівельні матеріали"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400 flex items-center">
                      ⚠️ {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Технологічний тип завантаження */}
                <div>
                  <label className="block text-xs font-bold text-purple-300 mb-2 flex items-center">
                    <Truck className="w-3 h-3 inline mr-2" />
                    🚛 Тип завантаження
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={cn(
                      "flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-300",
                      loadingType === 'full' 
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/25" 
                        : "border-white/30 bg-white/10 text-gray-300 hover:border-cyan-400/50 hover:bg-white/20"
                    )}>
                      <input
                        {...register('loadingType')}
                        type="radio"
                        value="full"
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="font-bold text-sm">Повне</div>
                        <div className="text-xs opacity-80">100%</div>
                      </div>
                    </label>
                    
                    <label className={cn(
                      "flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-300",
                      loadingType === 'partial' 
                        ? "border-purple-400 bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/25" 
                        : "border-white/30 bg-white/10 text-gray-300 hover:border-purple-400/50 hover:bg-white/20"
                    )}>
                      <input
                        {...register('loadingType')}
                        type="radio"
                        value="partial"
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="font-bold text-sm">Часткове</div>
                        <div className="text-xs opacity-80">Збірний</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Технологічна вага та об'єм */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-orange-300 mb-2 flex items-center">
                      <Weight className="w-3 h-3 inline mr-2" />
                      ⚖️ Вага (кг)
                    </label>
                    <input
                      {...register('weight', { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="40000"
                      className={cn(
                        "w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner",
                        errors.weight ? "border-red-400 focus:border-red-400 focus:ring-red-500/50 bg-red-500/10" : ""
                      )}
                      placeholder="20000"
                      disabled={isLoading}
                    />
                    {errors.weight && (
                      <p className="mt-1 text-xs text-red-400 flex items-center">
                        ⚠️ {errors.weight.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 mb-2 flex items-center">
                      <Box className="w-3 h-3 inline mr-2" />
                      📦 Об'єм (м³)
                    </label>
                    <input
                      {...register('volume', { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="120"
                      className={cn(
                        "w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner",
                        errors.volume ? "border-red-400 focus:border-red-400 focus:ring-red-500/50 bg-red-500/10" : ""
                      )}
                      placeholder="80"
                      disabled={isLoading}
                    />
                    {errors.volume && (
                      <p className="mt-1 text-xs text-red-400 flex items-center">
                        ⚠️ {errors.volume.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Технологічний фрахт */}
            <div className="bg-black/30 border border-emerald-500/30 p-4 rounded-xl backdrop-blur-sm">
              <h4 className="font-bold text-emerald-300 mb-3 text-sm flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                💰 Фрахт
                <div className="ml-2 w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
              </h4>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-emerald-300 mb-2 flex items-center">
                    💵 Сума
                  </label>
                  <input
                    {...register('freight', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className={cn(
                      "w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner",
                      errors.freight ? "border-red-400 focus:border-red-400 focus:ring-red-500/50 bg-red-500/10" : ""
                    )}
                    placeholder="2500"
                    disabled={isLoading}
                  />
                  {errors.freight && (
                    <p className="mt-1 text-xs text-red-400 flex items-center">
                      ⚠️ {errors.freight.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-yellow-300 mb-2 flex items-center">
                    🏷️ Валюта
                  </label>
                  <select
                    {...register('currency')}
                    className="w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner"
                    disabled={isLoading}
                  >
                    <option value="EUR" className="bg-gray-800 text-white">EUR</option>
                    <option value="UAH" className="bg-gray-800 text-white">UAH</option>
                    <option value="USD" className="bg-gray-800 text-white">USD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Технологічний маршрут */}
            <div className="bg-black/30 border border-blue-500/30 p-4 rounded-xl backdrop-blur-sm">
              <h4 className="font-bold text-blue-300 mb-3 text-sm flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                🗺️ Маршрут
                <div className="ml-2 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-green-300 mb-2 flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-2 shadow-sm shadow-green-400/50"></div>
                    📍 Завантаження
                  </label>
                  <input
                    {...register('loadingPoint')}
                    type="text"
                    className={cn(
                      "w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-green-400 focus:ring-2 focus:ring-green-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner",
                      errors.loadingPoint ? "border-red-400 focus:border-red-400 focus:ring-red-500/50 bg-red-500/10" : ""
                    )}
                    placeholder="Назва міста"
                    disabled={isLoading}
                  />
                  {errors.loadingPoint && (
                    <p className="mt-1 text-xs text-red-400 flex items-center">
                      ⚠️ {errors.loadingPoint.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-red-300 mb-2 flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full mr-2 shadow-sm shadow-red-400/50"></div>
                    📍 Розвантаження
                  </label>
                  <input
                    {...register('unloadingPoint')}
                    type="text"
                    className={cn(
                      "w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner",
                      errors.unloadingPoint ? "border-red-400 focus:border-red-400 focus:ring-red-500/50 bg-red-500/10" : ""
                    )}
                    placeholder="Назва міста"
                    disabled={isLoading}
                  />
                  {errors.unloadingPoint && (
                    <p className="mt-1 text-xs text-red-400 flex items-center">
                      ⚠️ {errors.unloadingPoint.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Технологічні нотатки */}
            <div className="bg-black/30 border border-indigo-500/30 p-4 rounded-xl backdrop-blur-sm">
              <label className="block text-xs font-bold text-indigo-300 mb-2 flex items-center">
                <FileText className="w-3 h-3 inline mr-2" />
                📝 Нотатки
                <div className="ml-2 w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></div>
              </label>
              <textarea
                {...register('notes')}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-white/20 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/30 transition-all duration-300 shadow-inner resize-none"
                placeholder="Особливості вантажу, вимоги до транспортування..."
                disabled={isLoading}
              />
            </div>

            {/* Технологічні кнопки */}
            <div className="flex space-x-3 pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "flex-1 relative group flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300",
                  isLoading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative">
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Додавання...
                    </div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Додати вантаж
                    </>
                  )}
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  reset();
                }}
                className="px-6 py-3 border border-white/20 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                disabled={isLoading}
              >
                Скасувати
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
