import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "bg-indigo-800 border-l-4 border-indigo-400" : "hover:bg-gray-800";

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 text-2xl font-extrabold tracking-tight border-b border-gray-800">
        Aura<span className="text-indigo-500">Live</span>
      </div>
      <nav className="flex-1 py-4 space-y-1">
        <Link to="/admin/dashboard" className={`block px-6 py-3 ${isActive('/admin/dashboard')}`}>Dashboard</Link>
        <Link to="/admin/rooms" className={`block px-6 py-3 ${isActive('/admin/rooms')}`}>Manage Rooms</Link>
        <Link to="/admin/students" className={`block px-6 py-3 ${isActive('/admin/students')}`}>Manage Students</Link>
        <Link to="/admin/complaints" className={`block px-6 py-3 ${isActive('/admin/complaints')}`}>Maintenance Requests</Link>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
