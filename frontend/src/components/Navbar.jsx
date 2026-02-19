import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  // Check if student is logged in by looking for token
  const studentInfo = JSON.parse(localStorage.getItem('studentInfo'));

  const handleLogout = () => {
    localStorage.removeItem('studentInfo');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 border-b border-gray-100 backdrop-blur-md">
      <div className="container flex items-center justify-between px-6 py-4 mx-auto">
        
        {/* Logo - Highlighted with a primary color */}
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-gray-900">
          Aura<span className="text-indigo-600">Live</span>
        </Link>
        
        {/* Navigation Links & Auth Buttons */}
        <div className="flex items-center space-x-6 text-sm font-medium">
          <Link to="/home" className="text-gray-500 transition-colors duration-200 hover:text-indigo-600">
            Home
          </Link>
          
          {studentInfo ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Hi, <span className="font-semibold text-gray-900">{studentInfo.name}</span>
              </span>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-500 transition-colors duration-200 hover:text-indigo-600">
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
              >
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