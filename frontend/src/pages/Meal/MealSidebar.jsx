import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, ChartNoAxesCombined } from 'lucide-react';

const MealSidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/meal/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/meal/menu', name: 'Menu Management', icon: UtensilsCrossed },
    { path: '/meal/insights', name: 'Insights', icon: ChartNoAxesCombined },
  ];

  return (
    <aside className="flex flex-col w-64 min-h-screen text-white bg-[#0f293e] shadow-xl border-r border-[#1a415b]/50">
      <div className="p-6 text-2xl font-extrabold tracking-tight border-b border-white/5">
        Aura<span className="text-[#60a5fa]">Live</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ease-in-out relative overflow-hidden ${
                active
                  ? 'bg-gradient-to-r from-[#2872A1] to-[#1f5a80] text-white shadow-md shadow-blue-900/20'
                  : 'text-gray-400 hover:bg-[#163650] hover:text-gray-100'
              }`}
            >
              {/* Subtle accent line for the active state */}
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#9FD3FF]" />
              )}
              
              <Icon 
                className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
                  active ? 'text-[#9FD3FF]' : 'group-hover:scale-110 group-hover:text-[#60a5fa]'
                }`} 
              />
              <span className="relative z-10 tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default MealSidebar;