import React from 'react';
import MealSidebar from './MealSidebar';
import MealNavbar from './MealNavbar';

const MealDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <MealSidebar />
      <div className="flex flex-col flex-1">
        <MealNavbar />
        <main className="flex-1 p-8">
          <h2 className="mb-6 text-3xl font-bold text-gray-800">Supplier Dashboard</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Pending Deliveries</h3>
              <p className="mt-2 text-3xl font-bold text-orange-500">0</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Active Subscriptions</h3>
              <p className="mt-2 text-3xl font-bold text-gray-800">0</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Today's Revenue</h3>
              <p className="mt-2 text-3xl font-bold text-gray-800">Rs. 0</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MealDashboard;