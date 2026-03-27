import React, { useState, useEffect, useRef } from 'react';
import { Package, Clock, CheckCircle2, Truck, Calendar, Info, Star, Send } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const MyLaundryOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  
  // Previous status track කරන්න (Notification system එකට)
  const prevStatuses = useRef({});

  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  useEffect(() => {
    if (userInfo?._id) {
      fetchMyOrders();
      // Real-time වගේ දැනෙන්න තත්පර 10කට සැරයක් auto refresh වෙනවා
      const interval = setInterval(fetchMyOrders, 10000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMyOrders = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/laundry/student/${userInfo._id}`);
      const data = await response.json();
      
      if (response.ok) {
        const newOrders = Array.isArray(data) ? data : [];
        
        // 👇 --- NOTIFICATION LOGIC --- 👇
        newOrders.forEach(order => {
          const oldStatus = prevStatuses.current[order._id];
          if (oldStatus && oldStatus !== order.status) {
            if (order.status === 'Accepted') toast.success(`Order Accepted! Partner is coming to pick up.`);
            if (order.status === 'Washing') toast('Your clothes are being washed! 🧼', { icon: '👕' });
            if (order.status === 'Completed') toast.success('Laundry Delivered! Please rate us.');
          }
          prevStatuses.current[order._id] = order.status;
        });

        setOrders(newOrders);
      }
    } catch (error) {
      console.error("Orders load error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 👇 --- RATING SUBMIT LOGIC --- 👇
  const handleRatingSubmit = async (orderId) => {
    if (rating === 0) return toast.error("Please select a star rating!");
    
    try {
      const response = await fetch(`http://localhost:5000/api/laundry/rate-order/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      });

      if (response.ok) {
        toast.success("Thanks for your review! ⭐");
        setRating(0);
        setComment("");
        fetchMyOrders(); // UI එක update කරන්න
      }
    } catch (error) {
      toast.error("Rating update failed.");
    }
  };

  const getStatusStep = (status) => {
    const steps = ['Pending', 'Accepted', 'Washing', 'Completed'];
    return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">My Laundry Orders</h2>
          <p className="text-gray-500 mt-2 font-medium italic">Track your clothes from suds to delivery.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 font-bold text-gray-400 animate-pulse">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-16 rounded-[2rem] border-2 border-dashed border-gray-200 text-center">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold text-lg">Huree! No pending laundry.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all">
                <div className="p-8">
                  {/* Order Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-[#2872A1]/10 rounded-2xl flex items-center justify-center text-[#2872A1]">
                        <Package className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-black text-xl text-gray-800">{order.weightInKg} Kg Package</h4>
                        <span className="bg-[#CBDDE9]/40 text-[#2872A1] px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tighter">
                          {order.serviceType || 'Standard Wash'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#2872A1]">Rs. {order.finalPrice}</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Amount Paid</p>
                    </div>
                  </div>

                  {/* STEPPER TRACKER */}
                  <div className="relative pt-4 px-2 mb-10">
                    <div className="flex items-center justify-between w-full relative">
                      {['Pending', 'Accepted', 'Washing', 'Completed'].map((stepName, index) => {
                        const currentStep = getStatusStep(order.status);
                        const isActive = index <= currentStep;
                        const isCompleted = index < currentStep;

                        return (
                          <div key={stepName} className="flex flex-col items-center relative z-10 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                              isCompleted ? 'bg-emerald-500 border-emerald-100 text-white' : 
                              isActive ? 'bg-[#2872A1] border-blue-100 text-white scale-110 shadow-lg shadow-[#2872A1]/30' : 
                              'bg-white border-gray-100 text-gray-300'
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                               index === 2 ? <Clock className="w-5 h-5" /> : 
                               <Truck className="w-5 h-5" />}
                            </div>
                            <p className={`mt-3 text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-gray-800' : 'text-gray-300'}`}>
                              {stepName === 'Completed' ? 'Delivered' : stepName}
                            </p>
                            {index < 3 && (
                              <div className={`absolute left-[60%] top-5 w-[80%] h-1 -z-10 rounded-full ${index < currentStep ? 'bg-emerald-500' : 'bg-gray-100'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 👇 --- REVIEW SECTION (Only show if Completed and not rated) --- 👇 */}
                  {order.status === 'Completed' && !order.isRated && (
                    <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Rate your experience
                      </h5>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHover(star)}
                              onMouseLeave={() => setHover(0)}
                              className="focus:outline-none transition-transform hover:scale-125"
                            >
                              <Star className={`w-8 h-8 ${star <= (hover || rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                            </button>
                          ))}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Add a comment (Optional)" 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:border-blue-300 text-sm font-medium"
                          />
                          <button 
                            onClick={() => handleRatingSubmit(order._id)}
                            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Details Footer */}
                  <div className="mt-6 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                     <span className="flex items-center gap-2"><Info className="w-3 h-3"/> Partner: {order.assignedPartner?.name}</span>
                     <span>Updated: {new Date(order.updatedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLaundryOrders;