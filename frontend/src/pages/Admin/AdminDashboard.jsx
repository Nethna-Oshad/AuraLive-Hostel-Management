import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <main className="flex-1 p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
          
          {/* Stats Cards Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium">Available Rooms</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium">Pending Complaints</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;