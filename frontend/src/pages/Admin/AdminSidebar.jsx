import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const adminInfo = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Admin User', email: 'admin@auralive.com' };
  
  const isActive = (path) => 
    location.pathname.startsWith(path) // Changed to startsWith so sub-pages stay highlighted
      ? "bg-blue-50 text-blue-600 font-semibold shadow-sm" 
      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium";

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0">
      {/* Logo Area */}
      <div className="pt-8 pb-6 px-8 text-xl font-bold tracking-wide text-gray-900 uppercase">
        Aura<span className="text-blue-600">Live</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 space-y-2 px-4 overflow-y-auto">
        <Link to="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin/dashboard')}`}>
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span className="text-sm">Dashboard</span>
        </Link>
        
        <Link to="/admin/rooms" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin/rooms')}`}>
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <span className="text-sm">Manage Rooms</span>
        </Link>
        
        <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User Management</div>

        <Link to="/admin/students" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin/students')}`}>
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span className="text-sm">Students</span>
        </Link>

        <Link to="/admin/laundry" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin/laundry')}`}>
          <span className="text-xl leading-none w-5 text-center">👕</span>
          <span className="text-sm">Laundry Partners</span>
        </Link>

        <Link to="/admin/meals" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin/meals')}`}>
          <span className="text-xl leading-none w-5 text-center">🍲</span>
          <span className="text-sm">Meal Suppliers</span>
        </Link>
        
        <Link to="/admin/maintainers" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin/maintainers')}`}>
          <span className="text-xl leading-none w-5 text-center">🔧</span>
          <span className="text-sm">Maintainers</span>
        </Link>
      </nav>

      {/* Bottom Actions Section */}
      <div className="px-4 pb-4 space-y-2">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 font-medium rounded-xl transition-colors cursor-pointer">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span className="text-sm">Log Out</span>
        </button>
      </div>

      {/* User Profile Block */}
      <div className="border-t border-gray-100 p-4 mx-4 mb-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-200">
            {adminInfo.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 truncate">{adminInfo.name}</p>
            <p className="text-xs text-gray-500 truncate">{adminInfo.email}</p>
          </div>
        </div>
      </div>
      
    </aside>
  );
};

export default AdminSidebar;