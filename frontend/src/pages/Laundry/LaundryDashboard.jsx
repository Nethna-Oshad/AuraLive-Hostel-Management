import React from 'react';
import LaundrySidebar from './LaundrySidebar';
import LaundryNavbar from './LaundryNavbar';

const LaundryDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <LaundrySidebar />
      <div className="flex flex-col flex-1">
        <LaundryNavbar />
        <main className="flex-1 p-8">
          <h2 className="mb-6 text-3xl font-bold text-gray-800">Laundry Overview</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Pending Pickups</h3>
              <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Clothes Washing (Kg)</h3>
              <p className="mt-2 text-3xl font-bold text-gray-800">0 Kg</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Today's Earnings</h3>
              <p className="mt-2 text-3xl font-bold text-gray-800">Rs. 0</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LaundryDashboard;