import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const ManageMaintainers = () => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-2xl font-semibold mb-6">Manage Maintainers</h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Maintainer list will go here.</p>
          </div>
        </main>
      </div>
    </div>
  );
};
export default ManageMaintainers;