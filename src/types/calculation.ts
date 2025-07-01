export interface CargoItem {
  id: string;
  name: string;
  weight: number; // тонни
  volume: number; // м³
  freight: number; // сума фрахту
  currency: 'UAH' | 'EUR' | 'USD';
  loadingPoint: string;
  unloadingPoint: string;
  distance?: number; // км
  notes?: string;
}

export interface RouteCalculationParams {
  // Загальні налаштування
  baseCurrency: 'UAH' | 'EUR' | 'USD';
  exchangeRates: {
    EUR_UAH: number;
    USD_UAH: number;
  };
  
  // Витрати на пальне
  fuelConsumption: number; // л/100км
  fuelPrice: number; // ціна за літр
  fuelCurrency: 'UAH' | 'EUR' | 'USD';
  
  // Добові витрати
  dailyRate: number; // добові ставка
  dailyRateCurrency: 'UAH' | 'EUR' | 'USD';
  tripDays: number; // кількість днів
  
  // Зарплата водія
  driverSalaryPercentage: number; // % від фрахту
  isFullLoad: boolean; // повне чи часткове завантаження
  
  // Додаткові витрати
  additionalCosts: {
    parking: number;
    tolls: number;
    other: number;
  };
  additionalCostsCurrency: 'UAH' | 'EUR' | 'USD';
}

export interface CalculationResult {
  // Загальна інформація
  totalDistance: number;
  distanceBreakdown: {
    deliveryDistance: number; // відстань доставки вантажів
    repositioningDistance: number; // відстань переїздів між точками
  };
  totalWeight: number;
  totalVolume: number;
  totalFreight: number; // в базовій валюті
  
  // Витрати
  costs: {
    fuel: number;
    driver: number;
    daily: number;
    additional: number;
    total: number;
  };
  
  // Результати
  grossProfit: number;
  netProfit: number;
  profitMargin: number; // %
  costPerKm: number;
  revenuePerKm: number;
  
  // Деталізація
  costBreakdown: {
    fuel: { 
      amount: number; 
      percentage: number;
      details: {
        delivery: number;
        repositioning: number;
        totalLiters: number;
        deliveryLiters: number;
        repositioningLiters: number;
        pricePerLiter: number;
        currency: string;
      };
    };
    driver: { 
      amount: number; 
      percentage: number;
      details: {
        basePercentage: number;
        adjustedPercentage: number;
        isFullLoad: boolean;
        totalFreight: number;
      };
    };
    daily: { 
      amount: number; 
      percentage: number;
      details: {
        ratePerDay: number;
        numberOfDays: number;
        currency: string;
        originalAmount: number;
      };
    };
    additional: { 
      amount: number; 
      percentage: number;
      details: {
        parking: number;
        tolls: number;
        other: number;
        currency: string;
        totalInOriginalCurrency: number;
      };
    };
  };
}

export interface RoutePoint {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number]; // [lng, lat]
  type: 'loading' | 'unloading';
  cargoId: string;
} 