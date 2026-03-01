import React from 'react';
import MaintainersSidebar from './MaintainersSidebar';
import MaintainersNavbar from './MaintainersNavbar';

const MaintainersDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <MaintainersSidebar />
      <div className="flex flex-col flex-1">
        <MaintainersNavbar />
        <main className="flex-1 p-8">
          <h2 className="mb-6 text-3xl font-bold text-gray-800">Task Overview</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">New Assignments</h3>
              <p className="mt-2 text-3xl font-bold text-emerald-600">0</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Tasks In Progress</h3>
              <p className="mt-2 text-3xl font-bold text-yellow-500">0</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Resolved nnn Today</h3>
              <p className="mt-2 text-3xl font-bold text-gray-800">0</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MaintainersDashboard;