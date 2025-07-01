'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import type { LoginFormData } from '@/lib/validations';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Тимчасово симулюємо вхід
      console.log('Login attempt:', data);
      
      // Симуляція API запиту
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Тимчасова перевірка для демо
      if (data.email === 'admin@logistics.com' && data.password === 'password123') {
        // Успішний вхід - перенаправляємо на дашборд
        router.push('/dashboard');
      } else {
        setError('Невірний email або пароль');
      }
    } catch {
      setError('Помилка з\'єднання. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        
        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            🔑 Демо облікові дані:
          </h3>
          <p className="text-xs text-yellow-700">
            Email: admin@logistics.com
            <br />
            Пароль: password123
          </p>
        </div>
      </div>
    </div>
  );
} 