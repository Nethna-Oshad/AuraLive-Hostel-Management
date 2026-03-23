import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Store, CalendarDays, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ThirdPartyMealDashboard = () => {
  const navigate = useNavigate();
  const todayDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo'));
    } catch {
      return null;
    }
  }, []);

  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [shops, setShops] = useState([]);
  const [allFull, setAllFull] = useState(false);
  const [studentBookings, setStudentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleTargetId, setRescheduleTargetId] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(new Date().toISOString().slice(0, 10));
  const [rescheduleSlotId, setRescheduleSlotId] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [now, setNow] = useState(new Date());

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

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isSlotTimePassed = (timeRange, date) => {
    if (!timeRange || !date || date !== todayDate) return false;
    const startPart = timeRange.split('-')[0]?.trim();
    const match = startPart?.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return false;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const slotStart = new Date(now);
    slotStart.setHours(hours, minutes, 0, 0);
    return now >= slotStart;
  };

  const fetchSlots = async () => {
    if (!selectedDate) {
      setSlots([]);
      setShops([]);
      setAllFull(false);
      return;
    }
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
        if (selectedDate) {
          await Promise.all([fetchSlots(), fetchMyMealBookings()]);
        } else {
          setSlots([]);
          setShops([]);
          setAllFull(false);
          await fetchMyMealBookings();
        }
      } catch {
        toast.error('Failed to load 3rd party meal data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate, userInfo]);

  const handleExternalOrder = async (e) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error('Please select a date first.');
      return;
    }
    if (externalForm.slotId) {
      const selectedSlot = slots.find((slot) => slot.id === externalForm.slotId);
      if (selectedSlot && isSlotTimePassed(selectedSlot.timeRange, selectedDate)) {
        toast.error('Selected slot time has passed. Please choose an upcoming slot.');
        return;
      }
    }
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
    const selectedRescheduleSlot = rescheduleSlots.find((slot) => slot.id === rescheduleSlotId);
    if (selectedRescheduleSlot && isSlotTimePassed(selectedRescheduleSlot.timeRange, rescheduleDate)) {
      toast.error('Selected slot time has passed. Please choose an upcoming slot.');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-[#2872A1] to-[#1f5a80] rounded-3xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold flex items-center gap-3">
                <UtensilsCrossed className="w-8 h-8 text-white" />
                3rd Party Meals
              </h1>
              <p className="text-blue-100 mt-2">
                Place external meal orders from partner shops when available.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-white/95 border border-white/70 rounded-xl px-4 py-3 shadow-sm">
                <CalendarDays className="w-5 h-5 text-[#2872A1]" />
                <input
                  id="meal-date"
                  name="mealDate"
                  type="date"
                  value={selectedDate}
                  min={todayDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent outline-none text-sm font-semibold text-gray-700"
                />
              </div>

              <button
                onClick={() => navigate('/student/meals')}
                className="hidden sm:inline-flex py-3 px-5 rounded-xl font-bold bg-white text-[#2872A1] hover:bg-blue-50 transition-colors"
              >
                Back to Kitchen
              </button>
            </div>
          </div>
        </div>

        {!selectedDate ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a date to continue</h2>
            <p className="text-gray-500">
              Choose a date first to view available partner shops and place an external order.
            </p>
          </div>
        ) : (allFull || shops.length > 0) ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Store className="w-6 h-6 text-[#2872A1]" /> 3rd Party Meal Shops
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {shops.map((shop) => (
                <div key={shop.name} className="border border-blue-100 bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 hover:shadow-md transition-all">
                  <h3 className="font-bold text-gray-800">{shop.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{shop.cuisine}</p>
                  <p className="text-xs font-semibold text-[#2872A1] mt-2">ETA: {shop.eta}</p>
                  <p className="text-xs font-bold text-gray-700 mt-1">From Rs. {shop.basePrice}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleExternalOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-2xl border border-gray-100 p-5">
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
                disabled={!selectedDate}
              >
                <option value="">Optional preferred slot window</option>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id} disabled={isSlotTimePassed(slot.timeRange, selectedDate)}>
                    {slot.label} ({slot.timeRange}){isSlotTimePassed(slot.timeRange, selectedDate) ? ' - Time passed' : ''}
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
                disabled={!selectedDate}
                className={`md:col-span-2 py-3 rounded-xl font-bold transition-all ${
                  !selectedDate
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-[#2872A1] text-white hover:bg-[#1f5a80] hover:shadow-lg'
                }`}
              >
                {!selectedDate ? 'Select Date First' : 'Place External Meal Order'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No external meal shops available</h2>
            <p className="text-gray-500">
              External orders unlock when kitchen slots are full or partner shops are available for the selected date.
            </p>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" /> My Meal Bookings
          </h2>

          {studentBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-500">No meal bookings yet. Start by selecting a kitchen slot above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-100 rounded-xl p-4 bg-gradient-to-r from-white to-slate-50 hover:shadow-sm transition-all"
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
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                        booking.status === 'Cancelled'
                          ? 'text-red-600 bg-red-50 border-red-100'
                          : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                      }`}
                    >
                      {booking.status}
                    </span>

                    {booking.type === 'External' && booking.paymentStatus !== 'Paid' && booking.status !== 'Cancelled' && (
                      <button
                        onClick={() => handlePayExternalOrder(booking._id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#2872A1] text-white hover:bg-[#1f5a80] transition-colors"
                      >
                        Pay Now
                      </button>
                    )}

                    {booking.type === 'Kitchen' && booking.status !== 'Cancelled' && (
                      <button
                        onClick={() => openReschedule(booking._id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                      >
                        Reschedule
                      </button>
                    )}

                    {booking.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
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
                min={todayDate}
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
                  <option key={slot.id} value={slot.id} disabled={slot.isFull || isSlotTimePassed(slot.timeRange, rescheduleDate)}>
                    {slot.label} ({slot.timeRange}) - {slot.isFull ? 'Full' : isSlotTimePassed(slot.timeRange, rescheduleDate) ? 'Time passed' : `${slot.available} available`}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={submitReschedule}
                  className="flex-1 py-3 rounded-xl font-bold bg-[#2872A1] text-white hover:bg-[#1f5a80] transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setRescheduleTargetId('')}
                  className="flex-1 py-3 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
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

export default ThirdPartyMealDashboard;

