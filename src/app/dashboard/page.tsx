export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Вітаємо в EuroTanemFORCE!
          </h1>
          <p className="text-gray-600 mb-6">
            Ви успішно увійшли в систему. Тут буде розміщено дашборд з розрахунками прибутковості рейсів.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">📊 Аналітика</h3>
              <p className="text-blue-700 text-sm">Статистика прибутковості рейсів</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">🗺️ Карта маршрутів</h3>
              <p className="text-green-700 text-sm">Інтерактивна карта з маршрутами</p>
            </div>
            
            <a 
              href="/calculator"
              className="bg-purple-50 p-6 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer block"
            >
              <h3 className="font-semibold text-purple-900 mb-2">💰 Розрахунки</h3>
              <p className="text-purple-700 text-sm">Калькулятор прибутковості</p>
              <p className="text-purple-600 text-xs mt-2">Натисніть для переходу ➜</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 