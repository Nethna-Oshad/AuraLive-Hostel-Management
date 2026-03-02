import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminNavbar = () => {
  const navigate = useNavigate();
  // FIXED: Changed 'adminInfo' to 'userInfo' to match the rest of your app!
  const adminInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success('Admin logged out securely');
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100 z-10 sticky top-0">
      <h1 className="text-xl font-extrabold text-[#2872A1]">Admin Portal</h1>
      
      <div className="flex items-center space-x-6">
        {/* Pro Notification Bell */}
        <button className="relative p-2 text-gray-400 hover:text-[#2872A1] transition-colors rounded-full hover:bg-[#CBDDE9]/30">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="flex items-center space-x-4 pl-6 border-l border-gray-200">
          <span className="text-sm font-bold text-gray-700">{adminInfo?.name || 'System Admin'}</span>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;