import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Store, CalendarDays, CheckCircle2, UtensilsCrossed, Lock, Package2, Truck, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ThirdPartyMealDashboard = () => {
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
  const [shops, setShops] = useState([]);
  const [allFull, setAllFull] = useState(false);
  const [studentBookings, setStudentBookings] = useState([]);
  const [showAllBookings, setShowAllBookings] = useState(false); // State for toggling visible bookings
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopMenuItems, setShopMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'Student') {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  const fetchShops = async () => {
    if (!selectedDate) {
      setShops([]);
      setAllFull(false);
      return;
    }
    const response = await axios.get(`http://localhost:5000/api/meals/slots?date=${selectedDate}`);
    setShops(response.data.thirdPartyShops || []);
    setAllFull(response.data.isAllSlotsFull || false);
  };

  const shopLogoSrc = (shop) =>
    shop?.logoUrl?.trim()
      ? shop.logoUrl
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(shop?.name || 'Shop')}&background=E0F2FE&color=1E3A8A&size=128&bold=true`;

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
          await Promise.all([fetchShops(), fetchMyMealBookings()]);
        } else {
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

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'Student') return;
    const interval = setInterval(() => {
      fetchMyMealBookings();
    }, 10000);
    return () => clearInterval(interval);
  }, [userInfo]);

  const openShopMenu = async (shop) => {
    setSelectedShop(shop);
    setShopMenuItems([]);
    setMenuLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/meals/public/menu?supplierName=${encodeURIComponent(shop.name)}`
      );
      setShopMenuItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load menu items.');
    } finally {
      setMenuLoading(false);
    }
  };

  const closeShopMenu = () => {
    setSelectedShop(null);
    setShopMenuItems([]);
  };

  const handleMenuOrder = async (shopName, menuItem) => {
    if (!selectedDate) {
      toast.error('Please select a date first.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/meals/order-external', {
        studentEmail: userInfo.email,
        studentName: userInfo.name,
        bookingDate: selectedDate,
        shopName,
        menuItem,
      });
      toast.success('External meal order request created.');
      closeShopMenu();
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
      await Promise.all([fetchShops(), fetchMyMealBookings()]);
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

  const DeliveryStatusTracker = ({ currentStatus, shouldShow }) => {
    const getCurrentIndex = () => {
      const idx = deliverySteps.findIndex((step) => step.status === currentStatus);
      return idx >= 0 ? idx : 0;
    };
    const activeIndex = getCurrentIndex();
    const progressPercent = shouldShow ? ((activeIndex + 1) / deliverySteps.length) * 100 : 0;

    return (
      <div>
        <div className="relative h-14 flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#2872A1] rounded-full z-0"
            style={{ width: `${progressPercent}%` }}
          />

          {deliverySteps.map((step, stepIdx) => {
            const isDoneOrCurrent = shouldShow && activeIndex >= stepIdx;
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
            const isDoneOrCurrent = shouldShow && activeIndex >= stepIdx;
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

  const isCompletedOrder = (booking) =>
    booking.status === 'Cancelled' ||
    booking.status === 'Completed' ||
    booking.deliveryStatus === 'Delivered';

  const ongoingBookings = studentBookings.filter((booking) => !isCompletedOrder(booking));
  const completedBookings = studentBookings.filter((booking) => isCompletedOrder(booking));

  const displayedOngoingBookings = showAllBookings ? ongoingBookings : ongoingBookings.slice(0, 3);
  const displayedCompletedBookings = showAllBookings ? completedBookings : completedBookings.slice(0, 3);

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
                  max={maxDate} // Sets the 7-day rolling window limit
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent outline-none text-sm font-semibold text-gray-700 cursor-pointer"
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
                <button
                  key={shop.name}
                  type="button"
                  onClick={() => openShopMenu(shop)}
                  className="text-center border border-blue-100 bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={shopLogoSrc(shop)}
                      alt={`${shop.name} logo`}
                      className="w-24 h-24 rounded-full border-2 border-blue-200 object-cover shadow-sm"
                    />
                    <h3 className="text-2xl font-extrabold text-gray-800 leading-tight">{shop.name}</h3>
                  </div>
                  <p className="text-sm font-semibold text-[#2872A1] mt-4">ETA: {shop.eta}</p>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500">Tap a shop card to view available menu items and place your order.</p>
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" /> My External Orders
            </h2>
            {studentBookings.length > 3 && (
              <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Total: {studentBookings.length}
              </span>
            )}
          </div>

          {studentBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-500">No external orders yet. Start by selecting a date above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#1f5a80]">Ongoing Orders</h3>
                <div className="mt-3 space-y-3">
                  {displayedOngoingBookings.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-blue-200 bg-white p-4 text-sm text-gray-500">
                      No ongoing external orders.
                    </div>
                  ) : (
                    displayedOngoingBookings.map((booking) => (
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
                              <DeliveryStatusTracker
                                currentStatus={booking.deliveryStatus || 'Pending'}
                                shouldShow={booking.paymentStatus === 'Paid'}
                              />
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
                          <span
                            className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                              booking.paymentStatus === 'Paid'
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                                : 'text-amber-700 bg-amber-50 border-amber-100'
                            }`}
                          >
                            Payment: {booking.paymentStatus}
                          </span>
                          {booking.paymentStatus === 'Paid' && booking.status !== 'Cancelled' && (
                            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border text-blue-700 bg-blue-50 border-blue-100">
                              Supplier Status: {booking.deliveryStatus || 'Pending'}
                            </span>
                          )}

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
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-700">Completed Orders</h3>
                <div className="mt-3 space-y-3">
                  {displayedCompletedBookings.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-emerald-200 bg-white p-4 text-sm text-gray-500">
                      No completed external orders.
                    </div>
                  ) : (
                    displayedCompletedBookings.map((booking) => (
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

                          {booking.status !== 'Cancelled' && (
                            <div className="mt-4 max-w-lg">
                              <DeliveryStatusTracker
                                currentStatus={booking.deliveryStatus || 'Pending'}
                                shouldShow={booking.paymentStatus === 'Paid'}
                              />
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
                          <span
                            className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                              booking.paymentStatus === 'Paid'
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                                : 'text-amber-700 bg-amber-50 border-amber-100'
                            }`}
                          >
                            Payment: {booking.paymentStatus}
                          </span>
                          {booking.paymentStatus === 'Paid' && booking.status !== 'Cancelled' && (
                            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border text-blue-700 bg-blue-50 border-blue-100">
                              Supplier Status: {booking.deliveryStatus || 'Pending'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

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
                        View All {studentBookings.length} Orders <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={shopLogoSrc(selectedShop)}
                  alt={`${selectedShop.name} logo`}
                  className="w-10 h-10 rounded-full border border-blue-200 object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedShop.name}</h3>
                  <p className="text-xs text-gray-500">Available menu items</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeShopMenu}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Close menu popup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {menuLoading ? (
                <p className="text-gray-500">Loading menu...</p>
              ) : shopMenuItems.length === 0 ? (
                <p className="text-gray-500">No available menu items for this shop right now.</p>
              ) : (
                <div className="space-y-3">
                  {shopMenuItems.map((item) => (
                    <div key={`${item.itemName}-${item._id || item.category}`} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-gray-900">{item.itemName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.category || 'Main'} • {item.prepTimeMinutes || 30} min</p>
                          {item.description && <p className="text-sm text-gray-600 mt-2">{item.description}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#2872A1]">Rs. {item.price || selectedShop.basePrice}</p>
                          <button
                            type="button"
                            onClick={() => handleMenuOrder(selectedShop.name, item.itemName)}
                            className="mt-2 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#2872A1] text-white hover:bg-[#1f5a80]"
                          >
                            Order Item
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThirdPartyMealDashboard;