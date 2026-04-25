import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, History, Settings, LogOut } from 'lucide-react';

const LaundrySidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => 
    location.pathname === path 
      ? "bg-[#2872A1] text-white font-bold shadow-md shadow-[#2872A1]/30" 
      : "text-gray-500 hover:bg-[#CBDDE9]/30 hover:text-[#2872A1]";
// Handle logout by clearing user info and navigating to login page
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 font-sans z-20 shadow-sm">
      {/* Brand Logo */}
      <div className="p-8 text-2xl font-extrabold tracking-tight text-gray-900">
        Aura<span className="text-[#2872A1]">Wash</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 space-y-2 px-4">
        <Link 
          to="/laundry/dashboard" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/laundry/dashboard')}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Dashboard</span>
        </Link>
        
        <Link 
          to="/laundry/orders" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/laundry/orders')}`}
        >
          <List className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">New Orders</span>
        </Link>

        <Link 
          to="/laundry/history" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/laundry/history')}`}
        >
          <History className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">History</span>
        </Link>

        
        <Link 
          to="/laundry/settings" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/laundry/settings')}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Pricing Settings</span>
        </Link>
      </nav>

      {/* Logout Button */}
      <div className="px-4 pb-8">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 font-bold rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm uppercase tracking-wide">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default LaundrySidebar;