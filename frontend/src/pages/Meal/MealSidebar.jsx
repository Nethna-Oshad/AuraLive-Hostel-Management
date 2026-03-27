import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, ChartNoAxesCombined } from 'lucide-react';

const MealSidebar = () => {
  const location = useLocation();
  const isActive = (path) =>
    location.pathname.startsWith(path) ? "bg-orange-900 border-l-4 border-orange-500" : "hover:bg-gray-800";

  return (
    <aside className="flex flex-col w-64 min-h-screen text-white bg-gray-900">
      <div className="p-6 text-2xl font-extrabold tracking-tight border-b border-gray-800">
        Aura<span className="text-orange-500">Meals</span>
      </div>
      <nav className="flex-1 py-4 space-y-1">
        <Link to="/meal/dashboard" className={`flex items-center gap-2 px-6 py-3 ${isActive('/meal/dashboard')}`}>
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </Link>
        <Link to="/meal/orders" className={`flex items-center gap-2 px-6 py-3 ${isActive('/meal/orders')}`}>
          <ClipboardList className="w-4 h-4" /> Orders
        </Link>
        <Link to="/meal/menu" className={`flex items-center gap-2 px-6 py-3 ${isActive('/meal/menu')}`}>
          <UtensilsCrossed className="w-4 h-4" /> Menu Management
        </Link>
        <Link to="/meal/insights" className={`flex items-center gap-2 px-6 py-3 ${isActive('/meal/insights')}`}>
          <ChartNoAxesCombined className="w-4 h-4" /> Insights
        </Link>
      </nav>
    </aside>
  );
};

export default MealSidebar;
