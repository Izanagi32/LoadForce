import type { CargoItem, RouteCalculationParams, CalculationResult } from '@/types/calculation';
import { getCachedRoute } from './routing';

export class RouteCalculator {
  /**
   * Конвертує суму з однієї валюти в іншу
   */
  private convertCurrency(
    amount: number, 
    fromCurrency: 'UAH' | 'EUR' | 'USD', 
    toCurrency: 'UAH' | 'EUR' | 'USD',
    exchangeRates: RouteCalculationParams['exchangeRates']
  ): number {
    if (fromCurrency === toCurrency) return amount;
    
    // Конвертуємо все через UAH як базову валюту
    let amountInUAH = amount;
    
    if (fromCurrency === 'EUR') {
      amountInUAH = amount * exchangeRates.EUR_UAH;
    } else if (fromCurrency === 'USD') {
      amountInUAH = amount * exchangeRates.USD_UAH;
    }
    
    if (toCurrency === 'EUR') {
      return amountInUAH / exchangeRates.EUR_UAH;
    } else if (toCurrency === 'USD') {
      return amountInUAH / exchangeRates.USD_UAH;
    }
    
    return amountInUAH;
  }

  /**
   * Розраховує точну відстань між містами використовуючи геокодінг API
   */
  private async calculateAccurateDistance(fromCity: string, toCity: string): Promise<number> {
    try {
      console.log(`🔍 Calculating accurate distance: ${fromCity} → ${toCity}`);
      const routeData = await getCachedRoute(fromCity, toCity);
      const distanceKm = Math.round(routeData.distance / 1000);
      console.log(`✅ Accurate distance found: ${distanceKm} km`);
      return distanceKm;
    } catch (error) {
      console.warn(`❌ Error calculating distance ${fromCity} → ${toCity}:`, error);
      // Fallback до приблизної відстані
      return 500; // Більш реалістична дефолтна відстань
    }
  }

  /**
   * Розраховує загальну відстань маршруту включаючи переїзди між точками розвантаження та завантаження
   */
  private async calculateTotalDistance(cargo: CargoItem[]): Promise<{ 
    totalDistance: number; 
    deliveryDistance: number; 
    repositioningDistance: number; 
  }> {
    if (cargo.length === 0) return { totalDistance: 0, deliveryDistance: 0, repositioningDistance: 0 };
    
    let deliveryDistance = 0;
    let repositioningDistance = 0;
    
    // Рахуємо точні відстані доставки (не покладаємося на item.distance)
    console.log('📊 Розрахунок відстаней доставки:');
    for (let i = 0; i < cargo.length; i++) {
      const item = cargo[i];
      const distance = await this.calculateAccurateDistance(item.loadingPoint, item.unloadingPoint);
      deliveryDistance += distance;
      console.log(`  📦 Вантаж ${i + 1}: ${item.loadingPoint} → ${item.unloadingPoint} = ${distance} км`);
    }
    
    // Рахуємо відстані переїздів між точками розвантаження та завантаження
    console.log('🚚 Розрахунок відстаней переїздів:');
    for (let i = 0; i < cargo.length - 1; i++) {
      const currentUnloadingPoint = cargo[i].unloadingPoint;
      const nextLoadingPoint = cargo[i + 1].loadingPoint;
      
      // Якщо точки різні, додаємо відстань переїзду
      if (currentUnloadingPoint.toLowerCase() !== nextLoadingPoint.toLowerCase()) {
        const distance = await this.calculateAccurateDistance(currentUnloadingPoint, nextLoadingPoint);
        repositioningDistance += distance;
        console.log(`  🔄 Переїзд ${i + 1}→${i + 2}: ${currentUnloadingPoint} → ${nextLoadingPoint} = ${distance} км`);
      } else {
        console.log(`  ⏭️ Переїзд ${i + 1}→${i + 2}: Те саме місце (${currentUnloadingPoint}) = 0 км`);
      }
    }
    
    const totalDistance = deliveryDistance + repositioningDistance;
    
    console.log(`📋 Підсумок відстаней:`);
    console.log(`  📦 Доставка: ${deliveryDistance} км`);
    console.log(`  🚚 Переїзди: ${repositioningDistance} км`);
    console.log(`  🎯 Загалом: ${totalDistance} км`);
    
    return { totalDistance, deliveryDistance, repositioningDistance };
  }

  /**
   * Розраховує витрати на пальне з деталізацією
   */
  private calculateFuelCosts(
    distanceData: { totalDistance: number; deliveryDistance: number; repositioningDistance: number },
    params: RouteCalculationParams
  ): { total: number; delivery: number; repositioning: number } {
    const deliveryFuel = (distanceData.deliveryDistance / 100) * params.fuelConsumption;
    const repositioningFuel = (distanceData.repositioningDistance / 100) * params.fuelConsumption;
    const totalFuel = deliveryFuel + repositioningFuel;
    
    const deliveryCost = deliveryFuel * params.fuelPrice;
    const repositioningCost = repositioningFuel * params.fuelPrice;
    const totalCostInOriginalCurrency = deliveryCost + repositioningCost;
    
    const totalCost = this.convertCurrency(
      totalCostInOriginalCurrency,
      params.fuelCurrency,
      params.baseCurrency,
      params.exchangeRates
    );
    
    const deliveryCostConverted = this.convertCurrency(
      deliveryCost,
      params.fuelCurrency,
      params.baseCurrency,
      params.exchangeRates
    );
    
    const repositioningCostConverted = this.convertCurrency(
      repositioningCost,
      params.fuelCurrency,
      params.baseCurrency,
      params.exchangeRates
    );
    
    console.log(`⛽ Витрати на паливо:`);
    console.log(`  📦 Доставка: ${distanceData.deliveryDistance} км × ${params.fuelConsumption}л/100км = ${deliveryFuel.toFixed(1)}л = ${deliveryCostConverted.toFixed(0)} ${params.baseCurrency}`);
    console.log(`  🚚 Переїзди: ${distanceData.repositioningDistance} км × ${params.fuelConsumption}л/100км = ${repositioningFuel.toFixed(1)}л = ${repositioningCostConverted.toFixed(0)} ${params.baseCurrency}`);
    console.log(`  🎯 Загалом: ${distanceData.totalDistance} км = ${totalFuel.toFixed(1)}л = ${totalCost.toFixed(0)} ${params.baseCurrency}`);
    
    return {
      total: totalCost,
      delivery: deliveryCostConverted,
      repositioning: repositioningCostConverted
    };
  }

  /**
   * Розраховує добові витрати
   */
  private calculateDailyCosts(params: RouteCalculationParams): number {
    const dailyCostInOriginalCurrency = params.dailyRate * params.tripDays;
    
    return this.convertCurrency(
      dailyCostInOriginalCurrency,
      params.dailyRateCurrency,
      params.baseCurrency,
      params.exchangeRates
    );
  }

  /**
   * Розраховує зарплату водія
   */
  private calculateDriverSalary(
    totalFreight: number,
    params: RouteCalculationParams
  ): number {
    const basePercentage = params.driverSalaryPercentage;
    // Якщо часткове завантаження, зменшуємо відсоток на 20%
    const adjustedPercentage = params.isFullLoad ? basePercentage : basePercentage * 0.8;
    
    return (totalFreight * adjustedPercentage) / 100;
  }

  /**
   * Розраховує додаткові витрати
   */
  private calculateAdditionalCosts(params: RouteCalculationParams): number {
    const { additionalCosts } = params;
    const totalAdditionalInOriginalCurrency = 
      additionalCosts.parking + 
      additionalCosts.tolls + 
      additionalCosts.other;
    
    return this.convertCurrency(
      totalAdditionalInOriginalCurrency,
      params.additionalCostsCurrency,
      params.baseCurrency,
      params.exchangeRates
    );
  }

  /**
   * Основний метод розрахунку
   */
  public async calculate(
    cargo: CargoItem[], 
    params: RouteCalculationParams
  ): Promise<CalculationResult> {
    // Загальна інформація
    const distanceData = await this.calculateTotalDistance(cargo);
    const totalWeight = cargo.reduce((sum, item) => sum + item.weight, 0);
    const totalVolume = cargo.reduce((sum, item) => sum + item.volume, 0);
    
    // Конвертуємо всі фрахти в базову валюту
    const totalFreight = cargo.reduce((sum, item) => {
      const freightInBaseCurrency = this.convertCurrency(
        item.freight,
        item.currency,
        params.baseCurrency,
        params.exchangeRates
      );
      return sum + freightInBaseCurrency;
    }, 0);

    // Розрахунок витрат
    const fuelCosts = this.calculateFuelCosts(distanceData, params);
    const dailyCosts = this.calculateDailyCosts(params);
    const driverSalary = this.calculateDriverSalary(totalFreight, params);
    const additionalCosts = this.calculateAdditionalCosts(params);
    
    const totalCosts = fuelCosts.total + dailyCosts + driverSalary + additionalCosts;

    // Результати
    const grossProfit = totalFreight - totalCosts;
    const netProfit = grossProfit; // Можна додати податки пізніше
    const profitMargin = totalFreight > 0 ? (netProfit / totalFreight) * 100 : 0;
    const costPerKm = distanceData.totalDistance > 0 ? totalCosts / distanceData.totalDistance : 0;
    const revenuePerKm = distanceData.totalDistance > 0 ? totalFreight / distanceData.totalDistance : 0;

    // Деталізація витрат (у відсотках)
    const costBreakdown = {
      fuel: {
        amount: fuelCosts.total,
        percentage: totalCosts > 0 ? (fuelCosts.total / totalCosts) * 100 : 0,
        details: {
          delivery: fuelCosts.delivery,
          repositioning: fuelCosts.repositioning,
          totalLiters: (distanceData.totalDistance / 100) * params.fuelConsumption,
          deliveryLiters: (distanceData.deliveryDistance / 100) * params.fuelConsumption,
          repositioningLiters: (distanceData.repositioningDistance / 100) * params.fuelConsumption,
          pricePerLiter: params.fuelPrice,
          currency: params.fuelCurrency
        }
      },
      driver: {
        amount: driverSalary,
        percentage: totalCosts > 0 ? (driverSalary / totalCosts) * 100 : 0,
        details: {
          basePercentage: params.driverSalaryPercentage,
          adjustedPercentage: params.isFullLoad ? params.driverSalaryPercentage : params.driverSalaryPercentage * 0.8,
          isFullLoad: params.isFullLoad,
          totalFreight: totalFreight
        }
      },
      daily: {
        amount: dailyCosts,
        percentage: totalCosts > 0 ? (dailyCosts / totalCosts) * 100 : 0,
        details: {
          ratePerDay: params.dailyRate,
          numberOfDays: params.tripDays,
          currency: params.dailyRateCurrency,
          originalAmount: params.dailyRate * params.tripDays
        }
      },
      additional: {
        amount: additionalCosts,
        percentage: totalCosts > 0 ? (additionalCosts / totalCosts) * 100 : 0,
        details: {
          parking: params.additionalCosts.parking,
          tolls: params.additionalCosts.tolls,
          other: params.additionalCosts.other,
          currency: params.additionalCostsCurrency,
          totalInOriginalCurrency: params.additionalCosts.parking + params.additionalCosts.tolls + params.additionalCosts.other
        }
      }
    };

    return {
      totalDistance: distanceData.totalDistance,
      distanceBreakdown: {
        deliveryDistance: distanceData.deliveryDistance,
        repositioningDistance: distanceData.repositioningDistance
      },
      totalWeight,
      totalVolume,
      totalFreight,
      costs: {
        fuel: fuelCosts.total,
        driver: driverSalary,
        daily: dailyCosts,
        additional: additionalCosts,
        total: totalCosts
      },
      grossProfit,
      netProfit,
      profitMargin,
      costPerKm,
      revenuePerKm,
      costBreakdown
    };
  }

  /**
   * Розраховує оптимальну ціну фрахту для заданої маржі
   */
  public async calculateOptimalFreight(
    cargo: CargoItem[],
    params: RouteCalculationParams,
    desiredMargin: number // %
  ): Promise<number> {
    const tempParams = { ...params };
    
    // Встановлюємо тимчасовий фрахт для розрахунку витрат
    const tempCargo = cargo.map(item => ({ ...item, freight: 1000, currency: params.baseCurrency as 'UAH' | 'EUR' | 'USD' }));
    
    const tempResult = await this.calculate(tempCargo, tempParams);
    const totalCosts = tempResult.costs.total;
    
    // Розраховуємо необхідний фрахт для досягнення бажаної маржі
    const requiredFreight = totalCosts / (1 - desiredMargin / 100);
    
    return requiredFreight;
  }
}

export const routeCalculator = new RouteCalculator(); 