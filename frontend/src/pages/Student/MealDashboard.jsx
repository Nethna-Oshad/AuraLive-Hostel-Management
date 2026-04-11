import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Clock3, ChefHat, UtensilsCrossed, CalendarDays, CheckCircle2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MealDashboard = () => {
  const navigate = useNavigate();
  
  // Calculate today and the max selectable date (today + 6 days = 7 day window)
  const todayDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const maxDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 6);
    return date.toISOString().slice(0, 10);
  }, []);

  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo'));
    } catch {
      return null;
    }
  }, []);

  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [slots, setSlots] = useState([]);
  const [hasThirdPartyShops, setHasThirdPartyShops] = useState(false);
  const [allFull, setAllFull] = useState(false);
  const [studentBookings, setStudentBookings] = useState([]);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rescheduleTargetId, setRescheduleTargetId] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(new Date().toISOString().slice(0, 10));
  const [rescheduleSlotId, setRescheduleSlotId] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [now, setNow] = useState(new Date());

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
      setHasThirdPartyShops(false);
      setAllFull(false);
      return;
    }
    const response = await axios.get(`http://localhost:5000/api/meals/slots?date=${selectedDate}`);
    setSlots(response.data.slots || []);
    setHasThirdPartyShops((response.data.thirdPartyShops || []).length > 0);
    setAllFull(response.data.isAllSlotsFull || false);
  };

  const fetchMyMealBookings = async () => {
    const response = await axios.get(`http://localhost:5000/api/meals/student/${userInfo.email}`);
    // FILTER: Only keep Kitchen bookings
    const kitchenBookings = (response.data || []).filter(booking => booking.type === 'Kitchen');
    setStudentBookings(kitchenBookings);
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
          setHasThirdPartyShops(false);
          setAllFull(false);
          await fetchMyMealBookings();
        }
      } catch {
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
    const selectedSlot = slots.find((slot) => slot.id === slotId);
    if (selectedSlot && isSlotTimePassed(selectedSlot.timeRange, selectedDate)) {
      toast.error('This slot has already started. Please book an upcoming slot.');
      return;
    }
    if (!selectedDate) {
      toast.error('Please select a date first.');
      return;
    }
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

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.patch(`http://localhost:5000/api/meals/${bookingId}/cancel`);
      toast.success('Kitchen booking cancelled.');
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

  const displayedBookings = showAllBookings ? studentBookings : studentBookings.slice(0, 3);

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
                Student Meal & Kitchen Dashboard
              </h1>
              <p className="text-blue-100 mt-2 max-w-3xl">
                Book kitchen time slots. If kitchen is full or partner shops are available, you can place an external order on the 3rd Party Meals page.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/95 border border-white/60 rounded-xl px-4 py-3 shadow-sm">
              <CalendarDays className="w-5 h-5 text-[#2872A1]" />
              <input
                id="meal-date"
                name="mealDate"
                type="date"
                value={selectedDate}
                min={todayDate}
                max={maxDate} // Sets the 7-day rolling window limit
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent outline-none text-sm font-semibold text-gray-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-gray-500">Total Kitchen Capacity</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalCapacity}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-gray-500">Booked Slots (All Sessions)</p>
            <p className="text-3xl font-extrabold text-[#2872A1] mt-1">{totalBooked}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-gray-500">Fallback Availability</p>
            <p className={`text-2xl font-extrabold mt-1 ${allFull ? 'text-orange-500' : 'text-emerald-600'}`}>
              {allFull ? 'External Orders Open' : 'Kitchen Slots Open'}
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#2872A1] mt-0.5" />
            <div>
              <p className="font-bold text-[#1f5a80]">Quick guide</p>
              <p className="text-sm text-[#2b6287] mt-1">
                Pick a date, choose a slot, and book instantly. If all kitchen slots are full, use the 3rd Party Meals page to place an external order.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-[#2872A1]" /> Kitchen Booking Slots
              </h2>
              <p className="text-sm text-gray-500 mt-1">Choose a preferred time slot based on current availability.</p>
            </div>
            {(allFull || hasThirdPartyShops) && (
              <button
                onClick={() => navigate('/student/meals/third-party')}
                className="w-full lg:w-auto py-3 px-5 rounded-xl font-bold bg-orange-500 text-white hover:bg-orange-600 transition-all hover:shadow-lg"
              >
                Go to 3rd Party Meals
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {!selectedDate ? (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-8 text-center">
                <p className="font-semibold text-[#1f5a80]">Select a date first to view available kitchen slots.</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <p className="font-semibold text-gray-700">No kitchen slots are configured for this date.</p>
                <p className="text-sm text-gray-500 mt-1">Try another date, or use external ordering if available.</p>
              </div>
            ) : (
              slots.map((slot) => (
                <div key={slot.id} className="border border-gray-100 rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50 hover:shadow-md transition-all">
                  {isSlotTimePassed(slot.timeRange, selectedDate) && (
                    <span className="inline-flex mb-3 text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                      Time Passed
                    </span>
                  )}
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
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className={`h-2.5 rounded-full ${slot.isFull ? 'bg-orange-400' : 'bg-[#2872A1]'}`}
                      style={{ width: `${Math.min((slot.booked / Math.max(slot.capacity, 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <button
                    onClick={() => handleKitchenBooking(slot.id)}
                    disabled={slot.isFull || !selectedDate || isSlotTimePassed(slot.timeRange, selectedDate)}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                      slot.isFull || !selectedDate || isSlotTimePassed(slot.timeRange, selectedDate)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-[#2872A1] hover:bg-[#1f5a80] text-white hover:shadow-lg'
                    }`}
                  >
                    {!selectedDate
                      ? 'Select Date First'
                      : isSlotTimePassed(slot.timeRange, selectedDate)
                      ? 'Time Passed'
                      : slot.isFull
                      ? 'Slot Full'
                      : 'Book Kitchen Slot'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" /> My Kitchen Bookings
            </h2>
            {studentBookings.length > 3 && (
              <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Total: {studentBookings.length}
              </span>
            )}
          </div>

          {studentBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-500">No kitchen bookings yet. Start by selecting a kitchen slot above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-100 rounded-xl p-4 bg-gradient-to-r from-white to-slate-50 hover:shadow-sm transition-all"
                >
                  <div>
                    <p className="font-bold text-gray-900">Kitchen Slot Booking</p>
                    <p className="text-sm text-gray-600">
                      {booking.bookingDate} | {booking.slotLabel}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                      booking.status === 'Cancelled'
                        ? 'text-red-600 bg-red-50 border-red-100'
                        : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                    }`}>
                      {booking.status}
                    </span>
                    {booking.status !== 'Cancelled' && (
                      <button
                        onClick={() => openReschedule(booking._id)}
                        disabled={booking.bookingDate < todayDate}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                          booking.bookingDate < todayDate
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                        title={booking.bookingDate < todayDate ? 'Cannot reschedule past bookings' : ''}
                      >
                        Reschedule
                      </button>
                    )}
                    {booking.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={booking.bookingDate < todayDate}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                          booking.bookingDate < todayDate
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        title={booking.bookingDate < todayDate ? 'Cannot cancel past bookings' : ''}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* View All / Show Less Toggle Button */}
              {studentBookings.length > 3 && (
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={() => setShowAllBookings(!showAllBookings)}
                    className="flex items-center gap-1.5 text-sm font-bold text-[#2872A1] hover:text-[#1f5a80] transition-colors py-2 px-4 rounded-full hover:bg-blue-50"
                  >
                    {showAllBookings ? (
                      <>
                        Show Less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        View All {studentBookings.length} Bookings <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
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
                max={maxDate} // Sets the 7-day rolling window limit for rescheduling
                onChange={async (e) => {
                  const newDate = e.target.value;
                  setRescheduleDate(newDate);
                  await fetchRescheduleSlots(newDate);
                }}
                className="p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer"
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

export default MealDashboard;