import React, { useState, useEffect } from 'react';
import LaundrySidebar from './LaundrySidebar';
import LaundryNavbar from './LaundryNavbar';
import { 
  Package, Weight, TrendingUp, Star, MessageSquare, 
  User, PieChart, BarChart3, AlertCircle, Zap
} from 'lucide-react';
import { motion } from 'framer-motion'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

const LaundryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

 
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        if (!userInfo._id) return;
        const response = await fetch(`http://localhost:5000/api/laundry/partner/${userInfo._id}`);
        const data = await response.json();
        
        if (response.ok && isMounted) {
          console.log("Dashboard Data Received:", data);
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        if (isMounted) toast.error("Failed to load analytics");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOrders();
    return () => { isMounted = false; };
  }, [userInfo._id]);

  const safeOrders = Array.isArray(orders) ? orders : [];
  
  
  const premiumOrders = safeOrders.filter(o => 
    (o.isPremiumOrder === true || String(o.isPremiumOrder) === 'true') && 
    (o.status === 'Pending' || o.status === 'Accepted')
  );

  const ratedOrders = safeOrders.filter(o => o.rating && Number(o.rating) > 0);
  const completedOrders = safeOrders.filter(o => o.status === 'Completed');

  const avgRating = ratedOrders.length > 0 
    ? (ratedOrders.reduce((acc, curr) => acc + Number(curr.rating), 0) / ratedOrders.length).toFixed(1)
    : "0.0";

  const pendingCount = safeOrders.filter(o => o.status === 'Pending').length;
  const activeWeight = safeOrders
    .filter(o => ['Pending', 'Accepted', 'Washing'].includes(o.status))
    .reduce((acc, curr) => acc + (Number(curr.weightInKg) || 0), 0);

  const currentMonth = new Date().getMonth();
  const monthlyEarnings = completedOrders
    .filter(o => new Date(o.updatedAt).getMonth() === currentMonth)
    .reduce((acc, curr) => acc + (Number(curr.finalPrice) || 0), 0);

  const serviceStats = completedOrders.reduce((acc, curr) => {
    const type = curr.serviceType || 'Wash & Fold';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayEarnings = completedOrders
      .filter(o => o.updatedAt && o.updatedAt.startsWith(dateStr))
      .reduce((acc, curr) => acc + Number(curr.finalPrice), 0);
    return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), amount: dayEarnings };
  }).reverse();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-gray-900">
      <Toaster position="top-center" />
      <LaundrySidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <LaundryNavbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-black text-gray-800 tracking-tight">Partner Insights</h2>
              <p className="text-gray-500 font-medium italic">Monitor your business performance and student feedback.</p>
            </div>
            <div className="flex gap-3">
                <div className="bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Updates</span>
                </div>
            </div>
          </div>

          
          {premiumOrders.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-5 bg-gradient-to-r from-orange-500 to-red-600 border-none rounded-3xl flex items-center justify-between shadow-xl shadow-orange-200 text-white"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <Zap className="w-7 h-7 fill-current text-white animate-bounce" />
                </div>
                <div>
                  <h4 className="font-black uppercase text-lg tracking-tighter leading-tight">Urgent Premium Requests!</h4>
                  <p className="text-sm font-bold opacity-90 tracking-tight">You have {premiumOrders.length} high-priority orders waiting. Process them immediately.</p>
                </div>
              </div>
              <button 
                onClick={() => window.location.href='/laundry/orders'}
                className="bg-white text-orange-600 px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-lg hover:scale-105 transition-all active:scale-95"
              >
                Go to Orders
              </button>
            </motion.div>
          )}

          {/* Metrics Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-8">
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><Package /></div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending</h3>
              <p className="text-2xl font-black">{loading ? '..' : pendingCount}</p>
            </div>

            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><Weight /></div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Kg</h3>
              <p className="text-2xl font-black">{loading ? '..' : activeWeight}</p>
            </div>

            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl border-b-4 border-amber-400 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
                <Star className={Number(avgRating) > 0 ? "fill-amber-500 text-amber-500" : "text-amber-500"} />
              </div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Rating</h3>
              <p className="text-2xl font-black">{avgRating} <span className="text-xs text-gray-400">/ 5.0</span></p>
            </div>

            <div className="p-6 bg-[#2872A1] text-white shadow-lg shadow-blue-100 rounded-3xl transition-all hover:scale-[1.02]">
              <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-4"><TrendingUp /></div>
              <h3 className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Monthly Revenue</h3>
              <p className="text-2xl font-black">Rs. {loading ? '..' : monthlyEarnings}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 mb-8">
                <BarChart3 className="text-[#2872A1]" /> Revenue Trend
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7Days}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 600}} dy={10} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}} />
                    <Bar dataKey="amount" radius={[8, 8, 8, 8]} barSize={35}>
                      {last7Days.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 6 ? '#2872A1' : '#CBDDE9'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[450px]">
              <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                <MessageSquare className="text-blue-500" /> Student Feedback
              </h3>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {ratedOrders.length > 0 ? ratedOrders.map((order) => (
                  <div key={order._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center border border-gray-200 text-[#2872A1]">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-gray-700">
                          {order.studentId?.name || "Student"}
                        </span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < order.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium italic leading-relaxed bg-white/50 p-2 rounded-lg border border-gray-50">
                      "{order.reviewComment || "No written review."}"
                    </p>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-40 py-10 text-center">
                    <MessageSquare className="w-12 h-12 mb-2 text-gray-300" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No ratings yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2"><PieChart className="text-[#2872A1]" /> Service Split</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(serviceStats).length > 0 ? Object.entries(serviceStats).map(([name, count]) => (
                  <div key={name} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center group hover:bg-[#2872A1] transition-all duration-300">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1 group-hover:text-blue-100">{name}</p>
                    <div className="flex items-baseline gap-1">
                       <span className="text-xl font-black text-gray-800 group-hover:text-white">{count}</span>
                       <span className="text-[10px] font-bold text-blue-600 group-hover:text-blue-200">Orders</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-400 text-xs italic text-center col-span-full py-4 font-bold uppercase tracking-widest">No stats available</p>
                )}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LaundryDashboard;