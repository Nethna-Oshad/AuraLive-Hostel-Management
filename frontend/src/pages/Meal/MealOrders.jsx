import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import MealSidebar from './MealSidebar';
import MealNavbar from './MealNavbar';

const MealOrders = () => {
  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo'));
    } catch {
      return null;
    }
  }, []);

  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    date: '',
    deliveryStatus: '',
    paymentStatus: '',
  });
  const [loading, setLoading] = useState(true);
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('supplierEmail', userInfo?.email || '');
      if (filters.date) params.append('date', filters.date);
      if (filters.deliveryStatus) params.append('deliveryStatus', filters.deliveryStatus);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);

      const response = await fetch(`http://localhost:5000/api/meals/supplier/orders?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load orders.');
      }
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'MealSupplier') return;
    fetchOrders();
  }, [userInfo]);

  const handleDeliveryStatusChange = async (orderId, deliveryStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/meals/supplier/orders/${orderId}/delivery-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus, supplierEmail: userInfo?.email }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Status update failed.');
      }
      toast.success('Order status updated.');
      fetchOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to update order.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MealSidebar />
      <div className="flex flex-col flex-1">
        <MealNavbar />
        <main className="flex-1 p-8">
          <h2 className="text-3xl font-bold text-gray-800">3rd Party Order Operations</h2>
          <p className="mb-6 text-sm text-gray-500">Filter, process, and track all external student orders for your shop.</p>

          <div className="grid grid-cols-1 gap-3 p-4 mb-6 bg-white border border-gray-100 md:grid-cols-4 rounded-xl">
            <input
              id="supplier-filter-date"
              name="supplierFilterDate"
              type="date"
              value={filters.date}
              onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
            />
            <select
              id="supplier-filter-delivery"
              name="supplierFilterDelivery"
              value={filters.deliveryStatus}
              onChange={(e) => setFilters((prev) => ({ ...prev, deliveryStatus: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
            >
              <option value="">All Delivery States</option>
              <option value="Pending">Order Accepted</option>
              <option value="Preparing">Preparation Started</option>
              <option value="Out for Delivery">Preparation Completed</option>
              <option value="Delivered">Ready for Pickup</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              id="supplier-filter-payment"
              name="supplierFilterPayment"
              value={filters.paymentStatus}
              onChange={(e) => setFilters((prev) => ({ ...prev, paymentStatus: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
            >
              <option value="">All Payment States</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 text-sm font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600"
            >
              Apply Filters
            </button>
          </div>

          <div className="overflow-hidden bg-white border border-gray-100 rounded-xl">
            {loading ? (
              <div className="p-10 text-center text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs tracking-wider text-gray-500 uppercase border-b border-gray-100">
                      <th className="p-4 font-bold">Student</th>
                      <th className="p-4 font-bold">Meal Item</th>
                      <th className="p-4 font-bold">Date / Slot</th>
                      <th className="p-4 font-bold">Amount</th>
                      <th className="p-4 font-bold">Payment</th>
                      <th className="p-4 font-bold">Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {orders.map((order) => {
                      const canAcceptUnpaid =
                        order.deliveryStatus === 'AwaitingAcceptance' &&
                        order.paymentStatus !== 'Paid' &&
                        order.status !== 'Cancelled';
                      const canCancelUnpaid = canAcceptUnpaid;
                      const disableStatusUpdate =
                        order.status === 'Cancelled' || (order.paymentStatus !== 'Paid' && !canAcceptUnpaid);

                      return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-semibold text-gray-800">{order.studentName}</p>
                          <p className="text-xs text-gray-500">{order.studentEmail}</p>
                        </td>
                        <td className="p-4 text-gray-700">
                          {Array.isArray(order.externalItems) && order.externalItems.length > 0 ? (
                            <div className="space-y-1">
                              {order.externalItems.map((item, idx) => (
                                <p key={idx} className="text-sm font-medium">
                                  {item.itemName} <span className="text-gray-500 font-normal">x{item.quantity}</span>
                                </p>
                              ))}
                            </div>
                          ) : (
                            order.externalMenuItem
                          )}
                        </td>
                        <td className="p-4 text-gray-600">
                          <p>{order.bookingDate}</p>
                          <p className="text-xs">{order.slotLabel}</p>
                        </td>
                        <td className="p-4 font-semibold text-gray-800">Rs. {order.externalAmount || 0}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            id={`supplier-order-delivery-${order._id}`}
                            name={`supplierOrderDelivery-${order._id}`}
                            value={order.deliveryStatus || 'Pending'}
                            onChange={(e) => handleDeliveryStatusChange(order._id, e.target.value)}
                            disabled={disableStatusUpdate}
                            className={`px-2 py-1 text-xs font-semibold border border-gray-200 rounded-md ${disableStatusUpdate
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : ''
                              }`}
                          >
                            <option value="AwaitingAcceptance">Awaiting Acceptance</option>
                            <option value="Pending">Accept Order</option>
                            {canCancelUnpaid && <option value="Cancelled">Cancelled</option>}
                            {!canAcceptUnpaid && <option value="Preparing">Preparation Started</option>}
                            {!canAcceptUnpaid && <option value="Out for Delivery">Preparation Completed</option>}
                            {!canAcceptUnpaid && <option value="Delivered">Ready for Pickup</option>}
                          </select>
                        </td>
                      </tr>
                    );
                    })}
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

export default MealOrders;
