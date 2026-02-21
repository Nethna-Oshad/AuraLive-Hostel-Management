import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const LaundrySidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "bg-blue-800 border-l-4 border-blue-400" : "hover:bg-gray-800";

  return (
    <aside className="flex flex-col w-64 min-h-screen text-white bg-gray-900">
      <div className="p-6 text-2xl font-extrabold tracking-tight border-b border-gray-800">
        Aura<span className="text-blue-500">Laundry</span>
      </div>
      <nav className="flex-1 py-4 space-y-1">
        <Link to="/laundry/dashboard" className={`block px-6 py-3 ${isActive('/laundry/dashboard')}`}>Dashboard</Link>
        <Link to="/laundry/orders" className={`block px-6 py-3 ${isActive('/laundry/orders')}`}>New Orders</Link>
        <Link to="/laundry/history" className={`block px-6 py-3 ${isActive('/laundry/history')}`}>Order History</Link>
        <Link to="/laundry/pricing" className={`block px-6 py-3 ${isActive('/laundry/pricing')}`}>Update Pricing</Link>
      </nav>
    </aside>
  );
};

export default LaundrySidebar;