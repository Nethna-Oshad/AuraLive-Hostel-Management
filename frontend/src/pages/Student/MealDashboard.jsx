import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Clock3, ChefHat, Store, UtensilsCrossed, CalendarDays, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MealDashboard = () => {
  const navigate = useNavigate();
  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo'));
    } catch (error) {
      return null;
    }
  }, []);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [shops, setShops] = useState([]);
  const [allFull, setAllFull] = useState(false);
  const [studentBookings, setStudentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleTargetId, setRescheduleTargetId] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(new Date().toISOString().slice(0, 10));
  const [rescheduleSlotId, setRescheduleSlotId] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [externalForm, setExternalForm] = useState({
    shopName: '',
    menuItem: '',
    slotId: '',
    notes: '',
  });

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'Student') {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  const fetchSlots = async () => {
    const response = await axios.get(`http://localhost:5000/api/meals/slots?date=${selectedDate}`);
    setSlots(response.data.slots || []);
    setShops(response.data.thirdPartyShops || []);
    setAllFull(response.data.isAllSlotsFull || false);
  };

  const fetchMyMealBookings = async () => {
    const response = await axios.get(`http://localhost:5000/api/meals/student/${userInfo.email}`);
    setStudentBookings(response.data || []);
  };

  const fetchRescheduleSlots = async (date) => {
    const response = await axios.get(`http://localhost:5000/api/meals/slots?date=${date}`);
    setRescheduleSlots(response.data.slots || []);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!userInfo || userInfo.role !== 'Student') return;
      try {
        setLoading(true);
        await Promise.all([fetchSlots(), fetchMyMealBookings()]);
      } catch (error) {
        toast.error('Failed to load meal dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedDate, userInfo]);

  const totalCapacity = useMemo(
    () => slots.reduce((sum, slot) => sum + slot.capacity, 0),
    [slots]
  );
  const totalBooked = useMemo(
    () => slots.reduce((sum, slot) => sum + slot.booked, 0),
    [slots]
  );

  const handleKitchenBooking = async (slotId) => {
    try {
      await axios.post('http://localhost:5000/api/meals/book-kitchen', {
        studentEmail: userInfo.email,
        studentName: userInfo.name,
        slotId,
        bookingDate: selectedDate,
      });
      toast.success('Kitchen slot booked successfully!');
      await Promise.all([fetchSlots(), fetchMyMealBookings()]);
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to book slot.';
      toast.error(message);
      if (error?.response?.status === 409) {
        setAllFull(true);
      }
    }
  };

  const handleExternalOrder = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/meals/order-external', {
        studentEmail: userInfo.email,
        studentName: userInfo.name,
        bookingDate: selectedDate,
        shopName: externalForm.shopName,
        menuItem: externalForm.menuItem,
        slotId: externalForm.slotId || undefined,
        notes: externalForm.notes,
      });
      toast.success('External meal order request created.');
      setExternalForm({ shopName: '', menuItem: '', slotId: '', notes: '' });
      await fetchMyMealBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create order.');
    }
  };

  const handlePayExternalOrder = async (mealBookingId) => {
    try {
      const response = await axios.post('http://localhost:5000/api/payment/create-meal-checkout-session', { mealBookingId });
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to start payment.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.patch(`http://localhost:5000/api/meals/${bookingId}/cancel`);
      toast.success('Meal booking cancelled.');
      await Promise.all([fetchSlots(), fetchMyMealBookings()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const openReschedule = async (bookingId) => {
    setRescheduleTargetId(bookingId);
    setRescheduleDate(selectedDate);
    setRescheduleSlotId('');
    await fetchRescheduleSlots(selectedDate);
  };

  const submitReschedule = async () => {
    if (!rescheduleTargetId || !rescheduleDate || !rescheduleSlotId) {
      toast.error('Please choose date and slot for reschedule.');
      return;
    }
    try {
      await axios.patch(`http://localhost:5000/api/meals/${rescheduleTargetId}/reschedule`, {
        bookingDate: rescheduleDate,
        slotId: rescheduleSlotId,
      });
      toast.success('Kitchen booking rescheduled.');
      setRescheduleTargetId('');
      await Promise.all([fetchSlots(), fetchMyMealBookings()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Reschedule failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-[#2872A1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <UtensilsCrossed className="w-8 h-8 text-[#2872A1]" />
                Student Meal & Kitchen Dashboard
              </h1>
              <p className="text-gray-500 mt-2">
                Book kitchen time slots. If slots are full, place an external meal order from partner shops.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <CalendarDays className="w-5 h-5 text-[#2872A1]" />
              <input
                id="meal-date"
                name="mealDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent outline-none text-sm font-medium text-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Kitchen Capacity</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalCapacity}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Booked Slots (All Sessions)</p>
            <p className="text-3xl font-extrabold text-[#2872A1] mt-1">{totalBooked}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Fallback Availability</p>
            <p className={`text-2xl font-extrabold mt-1 ${allFull ? 'text-orange-500' : 'text-emerald-600'}`}>
              {allFull ? 'External Orders Open' : 'Kitchen Slots Open'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-[#2872A1]" /> Kitchen Booking Slots
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {slots.map((slot) => (
              <div key={slot.id} className="border border-gray-100 rounded-2xl p-5 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{slot.label}</h3>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                    {slot.timeRange}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                  <Clock3 className="w-4 h-4" />
                  {slot.available} available of {slot.capacity}
                </p>
                <button
                  onClick={() => handleKitchenBooking(slot.id)}
                  disabled={slot.isFull}
                  className={`w-full py-3 rounded-xl font-bold transition-colors ${
                    slot.isFull
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-[#2872A1] hover:bg-[#1f5a80] text-white'
                  }`}
                >
                  {slot.isFull ? 'Slot Full' : 'Book Kitchen Slot'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {(allFull || shops.length > 0) && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Store className="w-6 h-6 text-orange-500" /> 3rd Party Meal Shops
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {shops.map((shop) => (
                <div key={shop.name} className="border border-orange-100 bg-orange-50/50 rounded-2xl p-4">
                  <h3 className="font-bold text-gray-800">{shop.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{shop.cuisine}</p>
                  <p className="text-xs font-semibold text-orange-600 mt-2">ETA: {shop.eta}</p>
                  <p className="text-xs font-bold text-gray-700 mt-1">From Rs. {shop.basePrice}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleExternalOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                id="external-shop"
                name="shopName"
                value={externalForm.shopName}
                onChange={(e) => setExternalForm((prev) => ({ ...prev, shopName: e.target.value }))}
                className="p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#2872A1]"
                required
              >
                <option value="">Select Meal Shop</option>
                {shops.map((shop) => (
                  <option key={shop.name} value={shop.name}>
                    {shop.name} (Rs. {shop.basePrice})
                  </option>
                ))}
              </select>

              <input
                id="external-menu-item"
                name="menuItem"
                type="text"
                placeholder="Meal item (e.g., Chicken Kottu)"
                value={externalForm.menuItem}
                onChange={(e) => setExternalForm((prev) => ({ ...prev, menuItem: e.target.value }))}
                className="p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#2872A1]"
                required
              />

              <select
                id="external-slot"
                name="slotId"
                value={externalForm.slotId}
                onChange={(e) => setExternalForm((prev) => ({ ...prev, slotId: e.target.value }))}
                className="p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#2872A1]"
              >
                <option value="">Optional preferred slot window</option>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label} ({slot.timeRange})
                  </option>
                ))}
              </select>

              <input
                id="external-notes"
                name="notes"
                type="text"
                placeholder="Notes (optional)"
                value={externalForm.notes}
                onChange={(e) => setExternalForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#2872A1]"
              />

              <button
                type="submit"
                className="md:col-span-2 py-3 rounded-xl font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                Place External Meal Order
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" /> My Meal Bookings
          </h2>
          {studentBookings.length === 0 ? (
            <p className="text-gray-500">No meal bookings yet. Start by selecting a kitchen slot above.</p>
          ) : (
            <div className="space-y-3">
              {studentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-100 rounded-xl p-4 bg-gray-50"
                >
                  <div>
                    <p className="font-bold text-gray-900">
                      {booking.type === 'Kitchen' ? 'Kitchen Slot Booking' : 'External Meal Order'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.bookingDate} | {booking.slotLabel}
                    </p>
                    {booking.type === 'External' && (
                      <p className="text-sm text-orange-600 mt-1">
                        {booking.externalShopName} - {booking.externalMenuItem} (Rs. {booking.externalAmount || 0})
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                      booking.status === 'Cancelled'
                        ? 'text-red-600 bg-red-50 border-red-100'
                        : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                    }`}>
                      {booking.status}
                    </span>
                    {booking.type === 'External' && booking.paymentStatus !== 'Paid' && booking.status !== 'Cancelled' && (
                      <button
                        onClick={() => handlePayExternalOrder(booking._id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#2872A1] text-white hover:bg-[#1f5a80]"
                      >
                        Pay Now
                      </button>
                    )}
                    {booking.type === 'Kitchen' && booking.status !== 'Cancelled' && (
                      <button
                        onClick={() => openReschedule(booking._id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200"
                      >
                        Reschedule
                      </button>
                    )}
                    {booking.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {rescheduleTargetId && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reschedule Kitchen Booking</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                id="reschedule-date"
                name="rescheduleDate"
                type="date"
                value={rescheduleDate}
                onChange={async (e) => {
                  const newDate = e.target.value;
                  setRescheduleDate(newDate);
                  await fetchRescheduleSlots(newDate);
                }}
                className="p-3 rounded-xl border border-gray-200 bg-gray-50"
              />
              <select
                id="reschedule-slot"
                name="rescheduleSlotId"
                value={rescheduleSlotId}
                onChange={(e) => setRescheduleSlotId(e.target.value)}
                className="p-3 rounded-xl border border-gray-200 bg-gray-50"
              >
                <option value="">Select new slot</option>
                {rescheduleSlots.map((slot) => (
                  <option key={slot.id} value={slot.id} disabled={slot.isFull}>
                    {slot.label} ({slot.timeRange}) - {slot.isFull ? 'Full' : `${slot.available} available`}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={submitReschedule}
                  className="flex-1 py-3 rounded-xl font-bold bg-[#2872A1] text-white hover:bg-[#1f5a80]"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setRescheduleTargetId('')}
                  className="flex-1 py-3 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealDashboard;
