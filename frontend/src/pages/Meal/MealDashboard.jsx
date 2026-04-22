import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import MealSidebar from './MealSidebar';
import MealNavbar from './MealNavbar';
import { 
  CalendarDays, 
  ShoppingBag, 
  Clock, 
  PackageCheck, 
  CircleDollarSign,
  Inbox
} from 'lucide-react';

const MealDashboard = () => {
  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo'));
    } catch {
      return null;
    }
  }, []);

  const [dateFilter, setDateFilter] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.append('date', dateFilter);
      params.append('supplierEmail', userInfo?.email || '');
      const response = await fetch(`http://localhost:5000/api/meals/supplier/orders?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load supplier orders.');
      }
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load supplier orders.');
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!userInfo || userInfo.role !== 'MealSupplier') return;
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    };
    load();
  }, [dateFilter, userInfo]);

  const summary = useMemo(() => {
    const pendingOrders = orders.filter(
      (order) =>
        order.status !== 'Cancelled' &&
        ['AwaitingAcceptance', 'Pending', 'Preparing', 'Out for Delivery'].includes(order.deliveryStatus || 'AwaitingAcceptance')
    ).length;
    const deliveredOrders = orders.filter(
      (order) => order.status !== 'Cancelled' && (order.deliveryStatus || 'AwaitingAcceptance') === 'Delivered'
    ).length;
    const unpaidOrders = orders.filter(
      (order) => order.status !== 'Cancelled' && order.paymentStatus === 'Unpaid'
    ).length;
    const revenueToday = orders
      .filter((order) => order.status !== 'Cancelled' && order.paymentStatus === 'Paid')
      .reduce((sum, order) => sum + (Number(order.externalAmount) || 0), 0);

    return {
      todayOrders: orders.length,
      pendingOrders,
      deliveredOrders,
      unpaidOrders,
      revenueToday,
    };
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 8), [orders]);

  const handleDeliveryStatusChange = async (orderId, deliveryStatus) => {
    // Optimistic UI Update
    setOrders((prev) => 
      prev.map((o) => o._id === orderId ? { ...o, deliveryStatus } : o)
    );

    try {
      const response = await fetch(`http://localhost:5000/api/meals/supplier/orders/${orderId}/delivery-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus, supplierEmail: userInfo?.email }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update delivery status.');
      }
      toast.success('Delivery status updated.');
    } catch (error) {
      toast.error(error.message || 'Failed to update delivery status.');
      await fetchOrders(); // Revert on failure
    }
  };

  // Helper for dynamic dropdown styling based on current status
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500';
      case 'Out for Delivery':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-500';
      case 'Preparing':
        return 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200 focus:ring-red-500';
      case 'AwaitingAcceptance':
        return 'bg-slate-50 text-slate-700 border-slate-200 focus:ring-slate-500';
      case 'Pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <MealSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MealNavbar />
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* Header Section */}
          <div className="flex flex-col gap-6 mb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Orders Dashboard</h2>
              <p className="text-sm text-slate-500 mt-1">Manage external meal orders and track delivery progress in real-time.</p>
            </div>
            
            <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-[#2872A1]">
              <CalendarDays className="w-5 h-5 text-slate-400 mr-3" />
              <div className="flex flex-col">
                <label htmlFor="supplier-order-date" className="text-[10px] font-bold tracking-wider text-slate-400 uppercase leading-none mb-1">
                  Filter by Date
                </label>
                <input
                  id="supplier-order-date"
                  name="supplierOrderDate"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="text-sm font-semibold text-slate-700 bg-transparent border-none outline-none p-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Metrics Grid - Cards Enhanced with subtle light blue gradients */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            
            {/* Card 1: Total Orders */}
            <div className="relative p-6 bg-gradient-to-br from-white via-white to-blue-50 border border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Orders (Today)</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-800">{summary.todayOrders}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl text-[#2872A1] group-hover:scale-110 group-hover:bg-[#2872A1] group-hover:text-white transition-all duration-300">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Card 2: Pending Deliveries */}
            <div className="relative p-6 bg-gradient-to-br from-white via-white to-blue-50/50 border border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Pending Deliveries</p>
                  <p className="mt-2 text-3xl font-extrabold text-orange-500">{summary.pendingOrders}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Card 3: Delivered */}
            <div className="relative p-6 bg-gradient-to-br from-white via-white to-blue-50/50 border border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Delivered Orders</p>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-500">{summary.deliveredOrders}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <PackageCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Card 4: Revenue */}
            <div className="relative p-6 bg-gradient-to-br from-white via-white to-blue-50 border border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Today's Revenue</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-800">Rs. {summary.revenueToday.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                  <CircleDollarSign className="w-6 h-6" />
                </div>
              </div>
              {summary.unpaidOrders > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-red-100 py-1.5 px-6">
                  <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider text-center">
                    {summary.unpaidOrders} Unpaid Order{summary.unpaidOrders !== 1 ? 's' : ''} Pending
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Table Section */}
          <div className="mt-10 bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="text-lg font-bold text-slate-800">Incoming Orders</h3>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                {recentOrders.length} Order{recentOrders.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-16 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2872A1]"></div>
                <p className="text-sm font-medium text-slate-500">Loading your orders...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No orders yet</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">There are no incoming orders matching the selected date criteria. Change the date to view past orders.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-widest">
                      <th className="px-6 py-4 font-semibold">Student Details</th>
                      <th className="px-6 py-4 font-semibold">Date & Time</th>
                      <th className="px-6 py-4 font-semibold">Order Item</th>
                      <th className="px-6 py-4 font-semibold">Payment</th>
                      <th className="px-6 py-4 font-semibold text-right">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/50 transition-colors duration-200">
                        
                        {/* Student Column */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{order.studentName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{order.studentEmail}</p>
                        </td>

                        {/* Date Column */}
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-700">{order.bookingDate}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{order.slotLabel}</p>
                        </td>

                        {/* Order Column */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{order.externalMenuItem || 'Kitchen Booking'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{order.externalShopName || '-'}</p>
                        </td>

                        {/* Payment Column */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50'
                                : 'bg-amber-50 text-amber-600 border-amber-200/50'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>

                        {/* Delivery Dropdown Column */}
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block w-40">
                            <select
                              id={`supplier-delivery-${order._id}`}
                              name={`supplierDelivery-${order._id}`}
                              value={order.deliveryStatus || 'AwaitingAcceptance'}
                              onChange={(e) => handleDeliveryStatusChange(order._id, e.target.value)}
                              disabled={order.status === 'Cancelled' || (order.paymentStatus !== 'Paid' && order.deliveryStatus !== 'AwaitingAcceptance')}
                              className={`w-full appearance-none px-3 py-2 pr-8 text-xs font-bold tracking-wide rounded-lg border outline-none transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-offset-1 ${getStatusStyles(order.deliveryStatus || 'AwaitingAcceptance')}`}
                            >
                              <option value="AwaitingAcceptance" disabled>
                                Awaiting Acceptance
                              </option>
                              <option value="Pending">Order Accepted</option>
                              <option value="Preparing">Preparation Started</option>
                              <option value="Out for Delivery">Preparation Completed</option>
                              <option value="Delivered">Ready for Pickup</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            {/* Custom dropdown arrow to replace the native one removed by appearance-none */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                              </svg>
                            </div>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default MealDashboard;