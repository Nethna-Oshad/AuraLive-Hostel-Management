import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const MaintainersSidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "bg-emerald-900 border-l-4 border-emerald-400" : "hover:bg-gray-800";

  return (
    <aside className="flex flex-col w-64 min-h-screen text-white bg-gray-900">
      <div className="p-6 text-2xl font-extrabold tracking-tight border-b border-gray-800">
        Aura<span className="text-emerald-500">Fix</span>
      </div>
      <nav className="flex-1 py-4 space-y-1">
        <Link to="/maintainer/dashboard" className={`block px-6 py-3 ${isActive('/maintainer/dashboard')}`}>Dashboard</Link>
        <Link to="/maintainer/tasks" className={`block px-6 py-3 ${isActive('/maintainer/tasks')}`}>Assigned Tasks</Link>
        <Link to="/maintainer/completed" className={`block px-6 py-3 ${isActive('/maintainer/completed')}`}>Task History</Link>
      </nav>
    </aside>
  );
};

export default MaintainersSidebar;