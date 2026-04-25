import React from 'react';
import { useNavigate } from 'react-router-dom';

const LaundryNavbar = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
// Handle logout by clearing user info and navigating to login page
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };
  // If userInfo is not available, you can redirect to login or show a default name
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <h1 className="text-xl font-bold text-gray-800">Laundry Management</h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600">{userInfo?.name || 'Laundry Partner'}</span>
        <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default LaundryNavbar;