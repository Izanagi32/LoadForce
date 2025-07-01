'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, BarChart3, MapPin } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправляємо на логін через 3 секунди
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center text-white max-w-4xl mx-auto">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-8 backdrop-blur-sm">
            <Truck className="w-12 h-12 text-white" />
          </div>

          {/* Hero Section */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            EuroTanemFORCE
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Розрахунок прибутковості рейсів для логістичної компанії
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <BarChart3 className="w-12 h-12 text-blue-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Аналітика прибутковості</h3>
              <p className="text-blue-100 text-sm">
                Детальний розрахунок витрат та доходів по кожному рейсу
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <MapPin className="w-12 h-12 text-blue-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Інтерактивна карта</h3>
              <p className="text-blue-100 text-sm">
                Планування маршрутів з розрахунком відстаней та часу
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <Truck className="w-12 h-12 text-blue-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Управління</h3>
              <p className="text-blue-100 text-sm">
                Оптимізація використання транспортних засобів
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <button
              onClick={handleLoginRedirect}
              className="bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Увійти в систему
            </button>
            <p className="text-blue-200 text-sm">
              Автоматичне перенаправлення через 3 секунди...
            </p>
          </div>

          {/* Loading animation */}
          <div className="mt-8">
            <div className="w-64 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
