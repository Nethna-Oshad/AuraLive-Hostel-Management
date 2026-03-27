import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import MealSidebar from './MealSidebar';
import MealNavbar from './MealNavbar';

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

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.append('date', dateFilter);
      const response = await fetch(`http://localhost:5000/api/meals/supplier/orders?${params.toString()}`);
      const data = await response.json();
      const externalOrders = Array.isArray(data) ? data.filter((order) => order.type === 'External') : [];
      const hasShopMapped = externalOrders.some(
        (order) => normalize(order.externalShopName) === normalize(userInfo?.name)
      );
      const scopedOrders = hasShopMapped
        ? externalOrders.filter((order) => normalize(order.externalShopName) === normalize(userInfo?.name))
        : externalOrders;
      setOrders(scopedOrders);
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
        ['Pending', 'Preparing', 'Out for Delivery'].includes(order.deliveryStatus || 'Pending')
    ).length;
    const deliveredOrders = orders.filter(
      (order) => order.status !== 'Cancelled' && (order.deliveryStatus || 'Pending') === 'Delivered'
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
    try {
      const response = await fetch(`http://localhost:5000/api/meals/supplier/orders/${orderId}/delivery-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus, supplierName: userInfo?.name }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update delivery status.');
      }
      toast.success('Delivery status updated.');
      await fetchOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to update delivery status.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MealSidebar />
      <div className="flex flex-col flex-1">
        <MealNavbar />
        <main className="flex-1 p-8">
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">3rd Party Orders Dashboard</h2>
              <p className="text-sm text-gray-500">Manage student external meal orders and track delivery progress.</p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="supplier-order-date" className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                Date
              </label>
              <input
                id="supplier-order-date"
                name="supplierOrderDate"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Total Orders (Today)</h3>
              <p className="mt-2 text-3xl font-bold text-gray-800">{summary.todayOrders}</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Pending Deliveries</h3>
              <p className="mt-2 text-3xl font-bold text-orange-500">{summary.pendingOrders}</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Delivered Orders</h3>
              <p className="mt-2 text-3xl font-bold text-emerald-600">{summary.deliveredOrders}</p>
            </div>
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Today's Revenue</h3>
              <p className="mt-2 text-3xl font-bold text-gray-800">Rs. {summary.revenueToday.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-red-500">Unpaid: {summary.unpaidOrders}</p>
            </div>
          </div>

          <div className="mt-8 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800">Incoming Student External Orders</h3>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-500">Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No orders found for the selected date.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs tracking-wider text-gray-500 uppercase border-b border-gray-100">
                      <th className="p-4 font-bold">Student</th>
                      <th className="p-4 font-bold">Date & Slot</th>
                      <th className="p-4 font-bold">Order</th>
                      <th className="p-4 font-bold">Payment</th>
                      <th className="p-4 font-bold">Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-semibold text-gray-800">{order.studentName}</p>
                          <p className="text-xs text-gray-500">{order.studentEmail}</p>
                        </td>
                        <td className="p-4 text-gray-600">
                          <p>{order.bookingDate}</p>
                          <p className="text-xs">{order.slotLabel}</p>
                        </td>
                        <td className="p-4 text-gray-700">
                          <p className="font-semibold">{order.externalMenuItem || 'Kitchen Booking'}</p>
                          <p className="text-xs text-gray-500">{order.externalShopName || '-'}</p>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            id={`supplier-delivery-${order._id}`}
                            name={`supplierDelivery-${order._id}`}
                            value={order.deliveryStatus || 'Pending'}
                            onChange={(e) => handleDeliveryStatusChange(order._id, e.target.value)}
                            className="px-2 py-1 text-xs font-semibold bg-white border border-gray-200 rounded-md"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
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