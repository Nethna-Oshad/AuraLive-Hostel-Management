import React, { useEffect, useMemo, useState } from 'react';
import MealSidebar from './MealSidebar';
import MealNavbar from './MealNavbar';
import toast from 'react-hot-toast';

const MealInsights = () => {
  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo'));
    } catch {
      return null;
    }
  }, []);

  const [summary, setSummary] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    revenueToday: 0,
    unpaidOrders: 0,
  });
  const [orders, setOrders] = useState([]);
  const normalize = (value) => String(value || '').trim().toLowerCase();

  useEffect(() => {
    const loadInsights = async () => {
      if (!userInfo || userInfo.role !== 'MealSupplier') return;
      try {
        const [summaryRes, ordersRes] = await Promise.all([
          fetch(`http://localhost:5000/api/meals/supplier/summary?supplierName=${encodeURIComponent(userInfo?.name || '')}`),
          fetch(`http://localhost:5000/api/meals/supplier/orders`),
        ]);

        const summaryData = await summaryRes.json();
        const ordersData = await ordersRes.json();

        setSummary({
          todayOrders: summaryData.todayOrders || 0,
          pendingOrders: summaryData.pendingOrders || 0,
          deliveredOrders: summaryData.deliveredOrders || 0,
          revenueToday: summaryData.revenueToday || 0,
          unpaidOrders: summaryData.unpaidOrders || 0,
        });
        const externalOrders = Array.isArray(ordersData) ? ordersData.filter((order) => order.type === 'External') : [];
        const hasShopMapped = externalOrders.some(
          (order) => normalize(order.externalShopName) === normalize(userInfo?.name)
        );
        const scopedOrders = hasShopMapped
          ? externalOrders.filter((order) => normalize(order.externalShopName) === normalize(userInfo?.name))
          : externalOrders;
        setOrders(scopedOrders);
      } catch {
        toast.error('Failed to load insights.');
      }
    };

    loadInsights();
  }, [userInfo]);

  const deliveryRate = summary.todayOrders > 0
    ? Math.round((summary.deliveredOrders / summary.todayOrders) * 100)
    : 0;

  const avgOrderValue = summary.deliveredOrders > 0
    ? Math.round(summary.revenueToday / summary.deliveredOrders)
    : 0;

  const topItems = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      const key = order.externalMenuItem || 'Unknown Item';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MealSidebar />
      <div className="flex flex-col flex-1">
        <MealNavbar />
        <main className="flex-1 p-8">
          <h2 className="text-3xl font-bold text-gray-800">3rd Party Business Insights</h2>
          <p className="mb-6 text-sm text-gray-500">Track external order KPIs and student demand patterns for your meal shop.</p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="p-6 bg-white border border-gray-100 rounded-xl">
              <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Delivery Completion Rate</p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-600">{deliveryRate}%</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 rounded-xl">
              <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Average Delivered Order Value</p>
              <p className="mt-2 text-3xl font-extrabold text-gray-800">Rs. {avgOrderValue}</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 rounded-xl">
              <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Pending Orders (Today)</p>
              <p className="mt-2 text-3xl font-extrabold text-orange-500">{summary.pendingOrders}</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 rounded-xl">
              <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Unpaid Orders (Today)</p>
              <p className="mt-2 text-3xl font-extrabold text-red-500">{summary.unpaidOrders}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
            <div className="p-6 bg-white border border-gray-100 rounded-xl">
              <h3 className="mb-4 text-lg font-bold text-gray-800">Top Ordered Items</h3>
              {topItems.length === 0 ? (
                <p className="text-sm text-gray-500">No order data yet.</p>
              ) : (
                <div className="space-y-3">
                  {topItems.map((item) => (
                    <div key={item.item} className="flex items-center justify-between px-3 py-2 border border-gray-100 rounded-lg">
                      <p className="text-sm font-semibold text-gray-800">{item.item}</p>
                      <span className="px-2 py-1 text-xs font-bold text-orange-700 bg-orange-100 rounded-full">{item.count} orders</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-white border border-gray-100 rounded-xl">
              <h3 className="mb-4 text-lg font-bold text-gray-800">Today Snapshot</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-bold text-gray-800">{summary.todayOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Delivered</span>
                  <span className="font-bold text-emerald-600">{summary.deliveredOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Revenue (Paid)</span>
                  <span className="font-bold text-gray-800">Rs. {summary.revenueToday.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Unpaid</span>
                  <span className="font-bold text-red-500">{summary.unpaidOrders}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MealInsights;
