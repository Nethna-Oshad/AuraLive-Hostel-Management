import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MealNavbar = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <h1 className="text-xl font-bold text-gray-800">Meal Operations</h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600">{userInfo?.name || 'Meal Supplier'}</span>
        <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default MealNavbar;