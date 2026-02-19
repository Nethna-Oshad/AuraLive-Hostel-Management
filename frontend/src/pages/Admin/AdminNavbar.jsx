import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));

  const handleLogout = () => {
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600">{adminInfo?.name || 'Admin'}</span>
        <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;