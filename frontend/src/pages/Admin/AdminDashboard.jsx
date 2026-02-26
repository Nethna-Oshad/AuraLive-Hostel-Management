import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data at the same time for speed
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
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* Dynamic Hero Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center mb-8 shadow-sm">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-blue-100 text-sm font-medium mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                System Status
              </div>
              <h2 className="text-2xl font-semibold mb-2">Here's what matters today</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Hi {adminInfo.name.split(' ')[0]} 👋 You have <strong className="text-white">{metrics.totalPending} accounts</strong> pending approval across the system. Approving partners quickly helps them start offering services to students.
              </p>
            </div>
            <button 
              onClick={() => navigate('/admin/students')}
              className="mt-4 md:mt-0 bg-white text-blue-600 px-5 py-2.5 rounded-full font-medium text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              Review Approvals 
              <span className="text-lg leading-none">&rsaquo;</span>
            </button>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4">User Registration Metrics</h3>

          {/* Dynamic Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Student Card */}
            <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-36">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <div>
                <h4 className="text-gray-500 text-sm mb-1">Total Students</h4>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-gray-800">{metrics.students.total}</span>
                  <div className="text-right">
                    <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full block mb-1">{metrics.students.active} Active</span>
                    {metrics.students.pending > 0 && <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full block">{metrics.students.pending} Pending</span>}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Laundry Card */}
            <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-36">
              <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center mb-2 text-lg">
                👕
              </div>
              <div>
                <h4 className="text-gray-500 text-sm mb-1">Laundry Partners</h4>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-gray-800">{metrics.laundry.total}</span>
                  <div className="text-right">
                    <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full block mb-1">{metrics.laundry.active} Active</span>
                    {metrics.laundry.pending > 0 && <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full block">{metrics.laundry.pending} Pending</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Meal Suppliers Card */}
            <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-36">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-2 text-lg">
                🍲
              </div>
              <div>
                <h4 className="text-gray-500 text-sm mb-1">Meal Suppliers</h4>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-gray-800">{metrics.meals.total}</span>
                  <div className="text-right">
                    <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full block mb-1">{metrics.meals.active} Active</span>
                    {metrics.meals.pending > 0 && <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full block">{metrics.meals.pending} Pending</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Maintainers Card */}
            <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-36">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2 text-lg">
                🔧
              </div>
              <div>
                <h4 className="text-gray-500 text-sm mb-1">Maintainers</h4>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-gray-800">{metrics.maintainers.total}</span>
                  <div className="text-right">
                    <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full block mb-1">{metrics.maintainers.active} Active</span>
                    {metrics.maintainers.pending > 0 && <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full block">{metrics.maintainers.pending} Pending</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ... The rest of your charts and task flow UI remains untouched ... */}
          {/* Middle Section: Chart & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Bar Chart (Placeholder UI) */}
            <div className="lg:col-span-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">System Activity</h3>
                <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none">
                  <option>Daily</option>
                  <option>Weekly</option>
                </select>
              </div>
              <div className="h-48 flex items-end justify-between gap-2 md:gap-4 px-2">
                {/* Mock Chart Bars */}
                {[
                  { day: 'MON', height: '60%', val: '30' },
                  { day: 'TUE', height: '100%', val: '50' },
                  { day: 'WED', height: '65%', val: '32' },
                  { day: 'THU', height: '40%', val: '20' },
                  { day: 'FRI', height: '75%', val: '38' },
                  { day: 'SAT', height: '20%', val: '10' },
                  { day: 'SUN', height: '90%', val: '45' }
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center w-full group relative">
                    <div className="w-full bg-blue-50 rounded-t-xl h-full flex items-end relative overflow-hidden">
                       <div className="w-full bg-blue-500 rounded-t-xl transition-all duration-300 relative" style={{ height: bar.height }}>
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/40 rounded-full"></div>
                       </div>
                    </div>
                    <span className="text-xs text-gray-400 mt-3 font-medium">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instant Insights */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h3>
              <div className="space-y-6">
                <div className="flex gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => navigate('/admin/rooms')}>
                  <div className="w-8 h-8 shrink-0 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800">Add New Room</h5>
                    <p className="text-xs text-gray-500 mt-1">Create a new hostel room listing.</p>
                  </div>
                </div>
                
                <div className="flex gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => navigate('/admin/students')}>
                  <div className="w-8 h-8 shrink-0 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800">Pending Approvals</h5>
                    <p className="text-xs text-gray-500 mt-1">You have {metrics.totalPending} users waiting for access.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;