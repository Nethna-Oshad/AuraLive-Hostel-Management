import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully!'); // <-- Pro Toast Notification!
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 border-b border-gray-100 backdrop-blur-md shadow-sm">
      <div className="container flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        
        {/* Brand Logo */}
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-gray-900 hover:opacity-90 transition-opacity">
          Aura<span className="text-[#2872A1]">Live</span>
        </Link>
        
        {/* Navigation Links & Auth Buttons */}
        <div className="flex items-center space-x-8 text-sm font-medium">
          
          <Link to="/home" className="flex items-center gap-1.5 text-gray-500 font-semibold transition-colors duration-200 hover:text-[#2872A1]">
            <Home className="w-4 h-4" />
            Home
          </Link>
          
          {userInfo ? (
            <div className="flex items-center space-x-5 pl-4 border-l border-gray-200">
              {/* User Badge */}
              <div className="flex items-center gap-2 bg-[#CBDDE9]/20 px-4 py-1.5 rounded-full border border-[#CBDDE9]/50">
                <User className="w-4 h-4 text-[#2872A1]" />
                <span className="text-gray-600">
                  Hi, <span className="font-bold text-[#2872A1]">{userInfo.name}</span>
                </span>
              </div>
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-red-500 transition-all duration-200 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white hover:shadow-md hover:-translate-y-0.5"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-5 pl-4 border-l border-gray-200">
              {/* Login Link */}
              <Link to="/login" className="flex items-center gap-1.5 text-gray-600 font-bold transition-colors duration-200 hover:text-[#2872A1]">
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              
              {/* Register Button */}
              <Link 
                to="/register" 
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 bg-[#2872A1] rounded-xl shadow-md shadow-[#CBDDE9] hover:bg-[#1f5a80] hover:-translate-y-0.5"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;