import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Users, Shirt, Utensils, Wrench, ArrowRight, PlusCircle, UserCheck, BarChart3 } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminInfo = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Admin' };

  // State to hold all our dynamic counts
  const [metrics, setMetrics] = useState({
    students: { total: 0, active: 0, pending: 0 },
    laundry: { total: 0, active: 0, pending: 0 },
    meals: { total: 0, active: 0, pending: 0 },
    maintainers: { total: 0, active: 0, pending: 0 },
    totalPending: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data at the same time for speed (Your original working logic!)
        const [studentsRes, laundryRes, mealsRes, maintainersRes] = await Promise.all([
          fetch('http://localhost:5000/api/auth/students'),
          fetch('http://localhost:5000/api/auth/laundry'),
          fetch('http://localhost:5000/api/auth/meals'),
          fetch('http://localhost:5000/api/auth/maintainers')
        ]);

        const students = await studentsRes.json();
        const laundry = await laundryRes.json();
        const meals = await mealsRes.json();
        const maintainers = await maintainersRes.json();

        // Calculate active vs inactive (pending) for each category
        const calcStats = (arr) => ({
          total: arr.length,
          active: arr.filter(item => item.status === 'Active').length,
          pending: arr.filter(item => item.status === 'Inactive').length
        });

        const studentStats = calcStats(students);
        const laundryStats = calcStats(laundry);
        const mealStats = calcStats(meals);
        const maintainerStats = calcStats(maintainers);

        setMetrics({
          students: studentStats,
          laundry: laundryStats,
          meals: mealStats,
          maintainers: maintainerStats,
          totalPending: studentStats.pending + laundryStats.pending + mealStats.pending + maintainerStats.pending
        });
      } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* Dynamic Hero Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-[#1f5a80] to-[#2872A1] rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center mb-8 shadow-lg shadow-[#CBDDE9]/50 border border-[#2872A1]/20"
          >
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[#CBDDE9] text-sm font-bold tracking-wider uppercase mb-3 bg-white/10 w-max px-3 py-1 rounded-full backdrop-blur-sm">
                <Activity className="w-4 h-4" />
                System Status
              </div>
              <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Here's what matters today</h2>
              <p className="text-[#CBDDE9] text-sm md:text-base leading-relaxed">
                Hi {adminInfo.name.split(' ')[0]} 👋 You have <strong className="text-white bg-white/20 px-2 py-0.5 rounded-md">{metrics.totalPending} accounts</strong> pending approval across the system. Approving partners quickly helps them start offering services to students.
              </p>
            </div>
            <button 
              onClick={() => navigate('/admin/students')}
              className="mt-6 md:mt-0 bg-white text-[#2872A1] px-6 py-3 rounded-full font-bold text-sm hover:bg-[#CBDDE9] transition-all flex items-center gap-2 shadow-xl hover:-translate-y-0.5 group"
            >
              Review Approvals 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <h3 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#2872A1]" />
            User Registration Metrics
          </h3>

          {/* Dynamic Key Metrics Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse"></div>)}
            </div>
          ) : (
            <motion.div 
              variants={containerVariants} initial="hidden" animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {/* Student Card */}
              <motion.div variants={itemVariants} className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-[#CBDDE9] hover:shadow-md transition-all flex flex-col justify-between h-36 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-gray-500 text-sm font-semibold mb-1">Total Students</h4>
                  <div className="flex justify-between items-end">
                    <span className="text-3xl font-extrabold text-gray-900">{metrics.students.total}</span>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md block border border-emerald-100 uppercase tracking-wider">{metrics.students.active} Active</span>
                      {metrics.students.pending > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md block border border-red-100 uppercase tracking-wider">{metrics.students.pending} Pending</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Laundry Card */}
              <motion.div variants={itemVariants} className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-[#CBDDE9] hover:shadow-md transition-all flex flex-col justify-between h-36 group">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-gray-500 text-sm font-semibold mb-1">Laundry Partners</h4>
                  <div className="flex justify-between items-end">
                    <span className="text-3xl font-extrabold text-gray-900">{metrics.laundry.total}</span>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md block border border-emerald-100 uppercase tracking-wider">{metrics.laundry.active} Active</span>
                      {metrics.laundry.pending > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md block border border-red-100 uppercase tracking-wider">{metrics.laundry.pending} Pending</span>}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Meal Suppliers Card */}
              <motion.div variants={itemVariants} className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-[#CBDDE9] hover:shadow-md transition-all flex flex-col justify-between h-36 group">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-gray-500 text-sm font-semibold mb-1">Meal Suppliers</h4>
                  <div className="flex justify-between items-end">
                    <span className="text-3xl font-extrabold text-gray-900">{metrics.meals.total}</span>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md block border border-emerald-100 uppercase tracking-wider">{metrics.meals.active} Active</span>
                      {metrics.meals.pending > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md block border border-red-100 uppercase tracking-wider">{metrics.meals.pending} Pending</span>}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Maintainers Card */}
              <motion.div variants={itemVariants} className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-[#CBDDE9] hover:shadow-md transition-all flex flex-col justify-between h-36 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-gray-500 text-sm font-semibold mb-1">Maintainers</h4>
                  <div className="flex justify-between items-end">
                    <span className="text-3xl font-extrabold text-gray-900">{metrics.maintainers.total}</span>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md block border border-emerald-100 uppercase tracking-wider">{metrics.maintainers.active} Active</span>
                      {metrics.maintainers.pending > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md block border border-red-100 uppercase tracking-wider">{metrics.maintainers.pending} Pending</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Middle Section: Chart & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Bar Chart (Placeholder UI tailored with brand colors) */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2 p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-gray-800">System Activity</h3>
                <select className="bg-gray-50 border border-gray-200 text-sm font-semibold rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#2872A1] cursor-pointer text-gray-600">
                  <option>Daily</option>
                  <option>Weekly</option>
                </select>
              </div>
              <div className="h-56 flex items-end justify-between gap-3 md:gap-6 px-2">
                {[
                  { day: 'MON', height: '60%' }, { day: 'TUE', height: '100%' }, { day: 'WED', height: '65%' },
                  { day: 'THU', height: '40%' }, { day: 'FRI', height: '75%' }, { day: 'SAT', height: '20%' }, { day: 'SUN', height: '90%' }
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center w-full group relative cursor-pointer">
                    <div className="w-full bg-[#CBDDE9]/30 rounded-t-xl h-full flex items-end relative overflow-hidden">
                       <div className="w-full bg-[#2872A1] rounded-t-xl transition-all duration-500 relative group-hover:bg-[#1f5a80]" style={{ height: bar.height }}>
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/40 rounded-full"></div>
                       </div>
                    </div>
                    <span className="text-xs text-gray-400 mt-3 font-bold">{bar.day}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                
                <div className="flex gap-4 cursor-pointer hover:bg-gray-50 p-4 rounded-xl transition-colors border border-transparent hover:border-gray-100 group" onClick={() => navigate('/admin/rooms')}>
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 text-[#2872A1] flex items-center justify-center group-hover:bg-[#2872A1] group-hover:text-white transition-colors">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h5 className="text-sm font-bold text-gray-800">Add New Room</h5>
                    <p className="text-xs text-gray-500 mt-1">Create a new hostel room listing.</p>
                  </div>
                </div>
                
                <div className="flex gap-4 cursor-pointer hover:bg-gray-50 p-4 rounded-xl transition-colors border border-transparent hover:border-gray-100 group" onClick={() => navigate('/admin/students')}>
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h5 className="text-sm font-bold text-gray-800">Pending Approvals</h5>
                    <p className="text-xs text-gray-500 mt-1">You have {metrics.totalPending} users waiting for access.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
          
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;