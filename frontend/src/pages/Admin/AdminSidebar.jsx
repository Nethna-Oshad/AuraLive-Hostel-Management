import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// 👇 UPDATE: 'ClipboardList' icon eka import kala tickets pennanna
import { LayoutDashboard, BedDouble, Users, Shirt, Utensils, Wrench, LogOut, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const adminInfo = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Admin User', email: 'admin@auralive.com' };
  
  // Upgraded styling for the active state using brand colors
  const isActive = (path) => 
    location.pathname.startsWith(path)
      ? "bg-[#2872A1] text-white font-bold shadow-md shadow-[#2872A1]/30" 
      : "text-gray-500 hover:bg-[#CBDDE9]/30 hover:text-[#2872A1] font-semibold";

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success('Admin logged out securely');
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 font-sans z-20 shadow-sm">
      
      {/* Logo Area */}
      <div className="pt-8 pb-6 px-8 text-2xl font-extrabold tracking-tight text-gray-900">
        Aura<span className="text-[#2872A1]">Live</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 space-y-1.5 px-4 overflow-y-auto custom-scrollbar">
        <Link to="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/admin/dashboard')}`}>
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <span className="text-sm tracking-wide">Dashboard</span>
        </Link>
        
        <Link to="/admin/rooms" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/admin/rooms')}`}>
          <BedDouble className="w-5 h-5 shrink-0" />
          <span className="text-sm tracking-wide">Manage Rooms</span>
        </Link>

        {/* 👇 ALUTH: Maintenance Tickets Link Eka 👇 */}
        <Link to="/admin/maintenance" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/admin/maintenance')}`}>
          <ClipboardList className="w-5 h-5 shrink-0" />
          <span className="text-sm tracking-wide">Maintenance Tickets</span>
        </Link>
        {/* 👆 ------------------------------------ 👆 */}
        
        <div className="pt-6 pb-2 px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">User Management</div>

        <Link to="/admin/students" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/admin/students')}`}>
          <Users className="w-5 h-5 shrink-0" />
          <span className="text-sm tracking-wide">Students</span>
        </Link>

        <Link to="/admin/laundry" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/admin/laundry')}`}>
          <Shirt className="w-5 h-5 shrink-0" />
          <span className="text-sm tracking-wide">Laundry Partners</span>
        </Link>

        <Link to="/admin/meals" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/admin/meals')}`}>
          <Utensils className="w-5 h-5 shrink-0" />
          <span className="text-sm tracking-wide">Meal Suppliers</span>
        </Link>
        
        <Link to="/admin/maintainers" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/admin/maintainers')}`}>
          <Wrench className="w-5 h-5 shrink-0" />
          <span className="text-sm tracking-wide">Maintainers</span>
        </Link>
      </nav>

      {/* Bottom Actions Section */}
      <div className="px-4 pb-4 mt-auto">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 font-bold rounded-xl transition-colors cursor-pointer group">
          <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Log Out</span>
        </button>
      </div>

      {/* User Profile Block */}
      <div className="border-t border-gray-100 p-5 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2872A1] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {adminInfo.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-extrabold text-gray-800 truncate">{adminInfo.name}</p>
            <p className="text-xs text-gray-500 font-medium truncate">{adminInfo.email || 'Admin'}</p>
          </div>
        </div>
      </div>
      
    </aside>
  );
};

export default AdminSidebar;