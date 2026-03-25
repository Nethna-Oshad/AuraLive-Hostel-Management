import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Store, CalendarDays, CheckCircle2, UtensilsCrossed, Lock, Package2, Truck } from 'lucide-react';
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
    // FILTER: Only keep External bookings
    const externalBookings = (response.data || []).filter(booking => booking.type === 'External');
    setStudentBookings(externalBookings);
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
      toast.success('Meal order cancelled.');
      await Promise.all([fetchSlots(), fetchMyMealBookings()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to cancel order.');
    }
  };

  const deliverySteps = [
    {
      status: 'Pending',
      label: 'Order Accepted',
      iconKey: 'lock',
    },
    {
      status: 'Preparing',
      label: 'Preparation Started',
      iconKey: 'package',
    },
    {
      status: 'Out for Delivery',
      label: 'Preparation Completed',
      iconKey: 'truck',
    },
    {
      status: 'Delivered',
      label: 'Ready for Pickup',
      iconKey: 'check',
    },
  ];

  const StepIcon = ({ iconKey }) => {
    const common = 'w-5 h-5';
    switch (iconKey) {
      case 'lock':
        return <Lock className={common} />;
      case 'package':
        return <Package2 className={common} />;
      case 'truck':
        return <Truck className={common} />;
      case 'check':
        return <CheckCircle2 className={common} />;
      default:
        return <CheckCircle2 className={common} />;
    }
  };

  const DELIVERY_STEP_MS = 10000;

  const DeliveryAnimatedTracker = ({ bookingId, shouldStart }) => {
    const [animatedIdx, setAnimatedIdx] = useState(-1);
    const storageKey = `mealDeliveryTrackStart:${bookingId}`;

    const computeIdxFromElapsed = (startTs) => {
      if (!startTs) return 0;
      const elapsedMs = Date.now() - startTs;
      const raw = Math.floor(elapsedMs / DELIVERY_STEP_MS);
      return Math.min(Math.max(raw, 0), deliverySteps.length - 1);
    };

    useEffect(() => {
      if (!shouldStart) {
        setAnimatedIdx(-1);
        return;
      }
      let startTs = Number(localStorage.getItem(storageKey));
      if (!startTs) {
        startTs = Date.now();
        localStorage.setItem(storageKey, String(startTs));
      }

      const tick = () => {
        setAnimatedIdx(computeIdxFromElapsed(startTs));
      };

      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }, [storageKey, shouldStart]);

    const progressPercent = animatedIdx < 0 ? 0 : ((animatedIdx + 1) / deliverySteps.length) * 100;

    return (
      <div>
        <div className="relative h-14 flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#2872A1] rounded-full z-0"
            style={{ width: `${progressPercent}%` }}
          />

          {deliverySteps.map((step, stepIdx) => {
            const isDoneOrCurrent = animatedIdx >= stepIdx;
            return (
              <div key={step.status} className="flex flex-col items-center w-1/4 relative z-10">
                <div
                  className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                    isDoneOrCurrent
                      ? 'bg-[#CFE9FF] border-[#9FD3FF] text-[#2872A1]'
                      : 'bg-white border-[#CFE9FF] text-gray-400'
                  }`}
                >
                  <StepIcon iconKey={step.iconKey} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-start justify-between mt-2">
          {deliverySteps.map((step, stepIdx) => {
            const isDoneOrCurrent = animatedIdx >= stepIdx;
            return (
              <p
                key={step.status}
                className={`w-1/4 text-[11px] font-semibold leading-tight text-center ${
                  isDoneOrCurrent ? 'text-[#1f5a80]' : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
            );
          })}
        </div>
      </div>
    );
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
            <CheckCircle2 className="w-6 h-6 text-emerald-600" /> My External Orders
          </h2>

          {studentBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-500">No external orders yet. Start by selecting a date above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-100 rounded-xl p-4 bg-gradient-to-r from-white to-slate-50 hover:shadow-sm transition-all"
                >
                  <div className="w-full md:w-auto flex-1">
                    <p className="font-bold text-gray-900">External Meal Order</p>
                    <p className="text-sm text-gray-600">
                      {booking.bookingDate} | {booking.slotLabel}
                    </p>
                    <p className="text-sm text-orange-600 mt-1">
                      {booking.externalShopName} - {booking.externalMenuItem} (Rs. {booking.externalAmount || 0})
                    </p>

                    {booking.paymentStatus !== 'Paid' && booking.status !== 'Cancelled' && (
                      <p className="text-sm text-[#1f5a80] mt-1">
                        Complete payment to confirm your order. Cancellation will be disabled after payment.
                      </p>
                    )}

                    {booking.status !== 'Cancelled' && (
                      <div className="mt-4 max-w-lg">
                        <DeliveryAnimatedTracker bookingId={booking._id} shouldStart={booking.paymentStatus === 'Paid'} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                        booking.status === 'Cancelled'
                          ? 'text-red-600 bg-red-50 border-red-100'
                          : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                      }`}
                    >
                      {booking.status}
                    </span>

                    {booking.paymentStatus !== 'Paid' && booking.status !== 'Cancelled' && (
                      <button
                        onClick={() => handlePayExternalOrder(booking._id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#2872A1] text-white hover:bg-[#1f5a80] transition-colors"
                      >
                        Pay Now
                      </button>
                    )}

                    {booking.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={booking.paymentStatus === 'Paid'}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                          booking.paymentStatus === 'Paid'
                            ? 'bg-red-50 text-red-300 border border-red-100 cursor-not-allowed'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
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
      </div>
    </div>
  );
};

export default ThirdPartyMealDashboard;