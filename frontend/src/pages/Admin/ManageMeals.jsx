import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import toast from 'react-hot-toast';

const ManageMeals = () => {
  const [users, setUsers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalOrdersToday: 0,
    pendingDeliveries: 0,
    deliveredCount: 0,
    unpaidExternalOrders: 0,
  });
  const [orderFilters, setOrderFilters] = useState({
    date: '',
    shop: '',
  });
  const [slotForm, setSlotForm] = useState({ label: '', timeRange: '', capacity: 4 });
  const [editingSlotId, setEditingSlotId] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchSlots();
    fetchOrders();
    fetchSummary();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:5000/api/auth/meals');
    setUsers(await res.json());
  };

  const fetchSlots = async () => {
    const res = await fetch('http://localhost:5000/api/meals/admin/slots');
    setSlots(await res.json());
  };

  const buildOrderQuery = () => {
    const params = new URLSearchParams();
    if (orderFilters.date) params.append('date', orderFilters.date);
    if (orderFilters.shop) params.append('shop', orderFilters.shop);
    return params.toString();
  };

  const fetchOrders = async () => {
    const query = buildOrderQuery();
    const res = await fetch(`http://localhost:5000/api/meals/admin/orders${query ? `?${query}` : ''}`);
    setOrders(await res.json());
  };

  const fetchSummary = async () => {
    const res = await fetch('http://localhost:5000/api/meals/admin/orders-summary');
    setSummary(await res.json());
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    await fetch('http://localhost:5000/api/auth/update-status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role: 'MealSupplier', status: newStatus }),
    });
    fetchUsers();
  };

  // Helper function to check if times overlap
  const checkTimeOverlap = (newTimeRange, excludeId = '') => {
    const parseTimeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.trim().split(':').map(Number);
      return hours * 60 + minutes;
    };

    try {
      const [newStartStr, newEndStr] = newTimeRange.split('-');
      const newStart = parseTimeToMinutes(newStartStr);
      const newEnd = parseTimeToMinutes(newEndStr);

      if (newStart >= newEnd) {
        return 'Start time must be strictly before end time.';
      }

      for (const slot of slots) {
        // Skip checking against itself if we are editing
        if (excludeId && slot._id === excludeId) continue;
        
        const [existingStartStr, existingEndStr] = slot.timeRange.split('-');
        const existingStart = parseTimeToMinutes(existingStartStr);
        const existingEnd = parseTimeToMinutes(existingEndStr);

        // Overlap logic: Start A < End B AND Start B < End A
        if (newStart < existingEnd && existingStart < newEnd) {
          return `Time overlaps with existing slot: ${slot.label} (${slot.timeRange})`;
        }
      }
      return null; // No overlap found
    } catch (err) {
      return 'Invalid time format.';
    }
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();

    // 1. Validate Slot Label (Only letters and spaces)
    const labelRegex = /^[a-zA-Z\s]+$/;
    if (!labelRegex.test(slotForm.label)) {
      toast.error('Slot label should only contain letters and spaces (no numbers).');
      return;
    }

    // 2. Validate Time Range format (e.g., 19:00 - 20:00)
    const timeRangeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]\s*-\s*([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRangeRegex.test(slotForm.timeRange)) {
      toast.error('Time range must be in HH:MM - HH:MM format (e.g., 19:00 - 20:00).');
      return;
    }

    // 3. Validate Overlaps and Logical Ordering
    const overlapError = checkTimeOverlap(slotForm.timeRange, editingSlotId);
    if (overlapError) {
      toast.error(overlapError);
      return;
    }

    try {
      const payload = {
        label: slotForm.label,
        timeRange: slotForm.timeRange,
        capacity: Number(slotForm.capacity),
      };
      
      if (editingSlotId) {
        await fetch(`http://localhost:5000/api/meals/admin/slots/${editingSlotId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success('Meal slot updated.');
      } else {
        await fetch('http://localhost:5000/api/meals/admin/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success('Meal slot created.');
      }
      setSlotForm({ label: '', timeRange: '', capacity: 4 });
      setEditingSlotId('');
      fetchSlots();
    } catch (error) {
      toast.error('Failed to save meal slot.');
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlotId(slot._id);
    setSlotForm({ label: slot.label, timeRange: slot.timeRange, capacity: slot.capacity });
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await fetch(`http://localhost:5000/api/meals/admin/slots/${slotId}`, { method: 'DELETE' });
      toast.success('Meal slot deleted.');
      fetchSlots();
    } catch (error) {
      toast.error('Failed to delete slot.');
    }
  };

  const toggleSlotActive = async (slot) => {
    try {
      await fetch(`http://localhost:5000/api/meals/admin/slots/${slot._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slot.isActive }),
      });
      toast.success(`Slot ${slot.isActive ? 'deactivated' : 'activated'}.`);
      fetchSlots();
    } catch (error) {
      toast.error('Failed to update slot status.');
    }
  };

  const handleDeliveryStatusChange = async (orderId, deliveryStatus) => {
    try {
      await fetch(`http://localhost:5000/api/meals/admin/orders/${orderId}/delivery-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus }),
      });
      toast.success('Delivery status updated.');
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error('Failed to update delivery status.');
    }
  };

  const handleExportOrders = async () => {
    try {
      const query = buildOrderQuery();
      const response = await fetch(`http://localhost:5000/api/meals/admin/orders-export${query ? `?${query}` : ''}`);
      const csvText = await response.text();
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `meal-orders-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Meal orders exported.');
    } catch (error) {
      toast.error('Failed to export orders.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Meal Suppliers (Pending Approval)</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                  <th className="p-4 font-medium">Supplier Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{user.name}</td>
                    <td className="p-4 text-gray-500">{user.email}</td>
                    <td className="p-4 text-gray-500">{user.phone}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => toggleStatus(user._id, user.status)} className={`px-4 py-2 rounded-lg text-white font-medium text-xs transition-colors ${user.status === 'Active' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {user.status === 'Active' ? 'Suspend' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="p-8 text-center text-gray-500">No meal suppliers registered yet.</div>}
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Kitchen Slot Capacity Management</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <form onSubmit={handleSaveSlot} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={slotForm.label}
                  onChange={(e) => setSlotForm((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="Slot label (e.g., Dinner Prep)"
                  required
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50"
                  pattern="[a-zA-Z\s]+"
                  title="Only letters and spaces are allowed"
                />
                <input
                  type="text"
                  value={slotForm.timeRange}
                  onChange={(e) => setSlotForm((prev) => ({ ...prev, timeRange: e.target.value }))}
                  placeholder="Time range (e.g., 19:00 - 20:00)"
                  required
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50"
                  title="Format: HH:MM - HH:MM (e.g., 19:00 - 20:00)"
                />
                <input
                  type="number"
                  min="1"
                  value={slotForm.capacity}
                  onChange={(e) => setSlotForm((prev) => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Capacity"
                  required
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50"
                />
                <button type="submit" className="rounded-xl bg-[#2872A1] text-white font-bold hover:bg-[#1f5a80]">
                  {editingSlotId ? 'Update Slot' : 'Create Slot'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                    <th className="p-4 font-medium">Label</th>
                    <th className="p-4 font-medium">Time Range</th>
                    <th className="p-4 font-medium">Capacity</th>
                    <th className="p-4 font-medium">Active</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {slots.map((slot) => (
                    <tr key={slot._id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-800">{slot.label}</td>
                      <td className="p-4 text-gray-500">{slot.timeRange}</td>
                      <td className="p-4 text-gray-700 font-bold">{slot.capacity}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${slot.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {slot.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleEditSlot(slot)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100">
                          Edit
                        </button>
                        <button onClick={() => toggleSlotActive(slot)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100">
                          {slot.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDeleteSlot(slot._id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {slots.length === 0 && <div className="p-8 text-center text-gray-500">No kitchen slots configured yet.</div>}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Student Meal Orders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Orders Today</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">{summary.totalOrdersToday}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Pending Deliveries</p>
                <p className="text-3xl font-extrabold text-orange-600 mt-2">{summary.pendingDeliveries}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Delivered Count</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-2">{summary.deliveredCount}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Unpaid External Orders</p>
                <p className="text-3xl font-extrabold text-red-600 mt-2">{summary.unpaidExternalOrders}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  id="filter-order-date"
                  name="filterOrderDate"
                  type="date"
                  value={orderFilters.date}
                  onChange={(e) => setOrderFilters((prev) => ({ ...prev, date: e.target.value }))}
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50"
                />
                <input
                  id="filter-order-shop"
                  name="filterOrderShop"
                  type="text"
                  value={orderFilters.shop}
                  onChange={(e) => setOrderFilters((prev) => ({ ...prev, shop: e.target.value }))}
                  placeholder="Filter by external shop name"
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50"
                />
                <button
                  onClick={fetchOrders}
                  className="rounded-xl bg-[#2872A1] text-white font-bold hover:bg-[#1f5a80]"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleExportOrders}
                  className="rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                      <th className="p-4 font-medium">Student</th>
                      <th className="p-4 font-medium">Date & Slot</th>
                      <th className="p-4 font-medium">Order</th>
                      <th className="p-4 font-medium">Payment</th>
                      <th className="p-4 font-medium">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{order.studentName}</p>
                          <p className="text-xs text-gray-500">{order.studentEmail}</p>
                        </td>
                        <td className="p-4 text-gray-600">
                          <p>{order.bookingDate}</p>
                          <p className="text-xs">{order.slotLabel}</p>
                        </td>
                        <td className="p-4 text-gray-700">
                          {order.type === 'External' ? (
                            <>
                              <p className="font-semibold">{order.externalShopName}</p>
                              <p className="text-xs text-gray-500">{order.externalMenuItem}</p>
                            </>
                          ) : (
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#CBDDE9]/30 text-[#2872A1]">Kitchen Booking</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {order.paymentStatus}
                          </span>
                          {order.type === 'External' && (
                            <p className="text-xs text-gray-500 mt-1">Rs. {order.externalAmount || 0}</p>
                          )}
                        </td>
                        <td className="p-4">
                          <select
                            id={`delivery-status-${order._id}`}
                            name={`deliveryStatus-${order._id}`}
                            value={order.deliveryStatus || 'Pending'}
                            onChange={(e) => handleDeliveryStatusChange(order._id, e.target.value)}
                            className="p-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold"
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
              {orders.length === 0 && (
                <div className="p-8 text-center text-gray-500">No meal orders match current filters.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default ManageMeals;