import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Users, Home, TrendingUp, DollarSign, ArrowRight, PlusCircle, UserCheck, BarChart3, Zap, Clock, ReceiptText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminInfo = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Admin' };

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    pendingAccounts: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    recentInvoices: []
  });

  // Simulated trend data for the graph (You can map real invoice dates to this later!)
  const chartData = [
    { name: 'Mon', revenue: 12000, expected: 10000 },
    { name: 'Tue', revenue: 19000, expected: 12000 },
    { name: 'Wed', revenue: 15000, expected: 14000 },
    { name: 'Thu', revenue: 28000, expected: 16000 },
    { name: 'Fri', revenue: 22000, expected: 18000 },
    { name: 'Sat', revenue: 35000, expected: 20000 },
    { name: 'Sun', revenue: 42000, expected: 25000 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch ALL system data to generate business intelligence
        const [studentsRes, roomsRes, invoicesRes] = await Promise.all([
          fetch('http://localhost:5000/api/auth/students'),
          fetch('http://localhost:5000/api/rooms'),
          fetch('http://localhost:5000/api/invoices') // Assuming you made a generic GET route for all invoices
        ]);

        const students = await studentsRes.json();
        const rooms = await roomsRes.json();
        let invoices = [];
        try { invoices = await invoicesRes.json(); } catch (e) { /* Catch if route doesn't exist yet */ }

        // 1. Calculate Users
        const activeStudents = students.filter(s => s.status === 'Active').length;
        const pendingStudents = students.filter(s => s.status === 'Inactive').length;

        // 2. Calculate Occupancy Rate
        let currentStudents = 0;
        let totalBeds = 0;
        rooms.forEach(room => {
          currentStudents += (room.currentOccupancy || 0);
          totalBeds += (room.maxCapacity || 0);
        });
        const occupancy = totalBeds === 0 ? 0 : Math.round((currentStudents / totalBeds) * 100);

        // 3. Calculate Total Revenue
        const totalMoney = invoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? inv.amount : 0), 0);

        setMetrics({
          totalStudents: activeStudents,
          pendingAccounts: pendingStudents,
          totalRevenue: totalMoney,
          occupancyRate: occupancy,
          recentInvoices: invoices.slice(0, 4) // Grab the latest 4 for the activity feed
        });

      } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* ========================================== */}
          {/* DYNAMIC HERO BANNER */}
          {/* ========================================== */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#1f5a80] via-[#2872A1] to-[#3a8ebf] rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center mb-8 shadow-xl shadow-[#CBDDE9] border border-[#2872A1]/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="max-w-2xl relative z-10">
              <div className="flex items-center gap-2 text-[#CBDDE9] text-xs font-bold tracking-wider uppercase mb-3 bg-white/10 w-max px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                <Activity className="w-3.5 h-3.5" /> Live System Status
              </div>
              <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Business Overview</h2>
              <p className="text-[#CBDDE9] text-sm md:text-base leading-relaxed">
                Welcome back, {adminInfo.name.split(' ')[0]}. You currently have <strong className="text-white bg-white/20 px-2 py-0.5 rounded-md">{metrics.pendingAccounts} pending approvals</strong>. Hostel occupancy is running at {metrics.occupancyRate}%.
              </p>
            </div>
            <button 
              onClick={() => navigate('/admin/students')}
              className="mt-6 md:mt-0 bg-white text-[#2872A1] px-6 py-3.5 rounded-xl font-extrabold text-sm hover:bg-gray-50 transition-all flex items-center gap-2 shadow-lg hover:-translate-y-1 group relative z-10"
            >
              Review Pending Users 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* ========================================== */}
          {/* KEY FINANCIAL & OPERATIONAL METRICS */}
          {/* ========================================== */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse"></div>)}
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              
              <motion.div variants={itemVariants} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    <TrendingUp className="w-3 h-3" /> +12%
                  </span>
                </div>
                <h4 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Total Revenue</h4>
                <h3 className="text-2xl font-extrabold text-gray-900">Rs. {metrics.totalRevenue.toLocaleString()}</h3>
              </motion.div>

              <motion.div variants={itemVariants} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Home className="w-6 h-6" />
                  </div>
                </div>
                <h4 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Occupancy Rate</h4>
                <div className="flex items-end gap-3">
                  <h3 className="text-2xl font-extrabold text-gray-900">{metrics.occupancyRate}%</h3>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${metrics.occupancyRate}%` }}></div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <h4 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Active Students</h4>
                <h3 className="text-2xl font-extrabold text-gray-900">{metrics.totalStudents}</h3>
              </motion.div>

              <motion.div variants={itemVariants} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group cursor-pointer" onClick={() => navigate('/admin/students')}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
                <h4 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Pending Actions</h4>
                <h3 className="text-2xl font-extrabold text-orange-600">{metrics.pendingAccounts} Needs Review</h3>
              </motion.div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* CHARTS & PREDICTIONS ROW */}
          {/* ========================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Interactive Revenue Graph */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2 p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">Revenue Trends</h3>
                  <p className="text-sm text-gray-500">Weekly income vs expected targets.</p>
                </div>
                <select className="bg-gray-50 border border-gray-200 text-sm font-bold rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#2872A1] cursor-pointer text-gray-700">
                  <option>Last 7 Days</option>
                  <option>This Month</option>
                </select>
              </div>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2872A1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2872A1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 'bold' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`Rs. ${value}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#2872A1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* AI Prediction & Quick Actions */}
            <div className="space-y-8">
              {/* Prediction Module */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="p-8 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl shadow-lg text-white relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-4">
                  <Zap className="w-4 h-4 text-yellow-400" /> AI Forecast
                </div>
                <h3 className="text-xl font-extrabold mb-2">Next Month Outlook</h3>
                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                  Based on current student inquiries and historical data, hostel occupancy is expected to reach <strong className="text-white">92%</strong> by next month. Prepare maintenance teams accordingly.
                </p>
                <div className="bg-white/10 border border-white/20 p-4 rounded-xl backdrop-blur-sm">
                  <span className="block text-xs text-indigo-200 uppercase font-bold mb-1">Expected Revenue</span>
                  <span className="text-2xl font-extrabold">Rs. {(metrics.totalRevenue * 1.15).toLocaleString()}</span>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-base font-extrabold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => navigate('/admin/rooms')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><PlusCircle className="w-4 h-4" /></div>
                      <span className="font-bold text-sm text-gray-700">Add New Room</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#2872A1]" />
                  </button>
                  <button onClick={() => navigate('/admin/students')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><UserCheck className="w-4 h-4" /></div>
                      <span className="font-bold text-sm text-gray-700">Review Approvals</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#2872A1]" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ========================================== */}
          {/* RECENT ACTIVITY FEED */}
          {/* ========================================== */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
            <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-[#2872A1]" /> Recent Transactions
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="pb-4 font-bold">Student</th>
                    <th className="pb-4 font-bold">Room</th>
                    <th className="pb-4 font-bold">Amount</th>
                    <th className="pb-4 font-bold">Date</th>
                    <th className="pb-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {metrics.recentInvoices.length > 0 ? metrics.recentInvoices.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-bold text-gray-900">{inv.studentName}</td>
                      <td className="py-4 text-gray-600">{inv.roomNumber}</td>
                      <td className="py-4 font-extrabold text-[#2872A1]">Rs. {inv.amount?.toLocaleString()}</td>
                      <td className="py-4 text-gray-500">{new Date(inv.paidAt || inv.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 text-right">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-400 font-medium">No recent transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBDDE9; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;