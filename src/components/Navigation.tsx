'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, BarChart3, Brain, Zap } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Головна',
      icon: '🏠',
      description: 'Початкова сторінка'
    },
    {
      href: '/calculator',
      label: 'Калькулятор',
      icon: Calculator,
      description: 'Розрахунок рейсів'
    },
    {
      href: '/dashboard',
      label: 'AI Dashboard',
      icon: BarChart3,
      description: 'Аналітика та графіки'
    }
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-2xl shadow-purple-500/20">
        <div className="flex items-center space-x-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = typeof item.icon === 'string' ? null : item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-500/50 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {typeof item.icon === 'string' ? (
                    <span className="text-lg">{item.icon}</span>
                  ) : IconComponent ? (
                    <IconComponent className={`w-4 h-4 ${isActive ? 'animate-pulse' : 'group-hover:animate-bounce'}`} />
                  ) : null}
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 