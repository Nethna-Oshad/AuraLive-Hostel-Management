import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const MealSidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "bg-orange-900 border-l-4 border-orange-500" : "hover:bg-gray-800";

  return (
    <aside className="flex flex-col w-64 min-h-screen text-white bg-gray-900">
      <div className="p-6 text-2xl font-extrabold tracking-tight border-b border-gray-800">
        Aura<span className="text-orange-500">Meals</span>
      </div>
      <nav className="flex-1 py-4 space-y-1">
        <Link to="/meal/dashboard" className={`block px-6 py-3 ${isActive('/meal/dashboard')}`}>Dashboard</Link>
        <Link to="/meal/menu" className={`block px-6 py-3 ${isActive('/meal/menu')}`}>Today's Menu</Link>
        <Link to="/meal/orders" className={`block px-6 py-3 ${isActive('/meal/orders')}`}>Student Orders</Link>
      </nav>
    </aside>
  );
};

export default MealSidebar;
