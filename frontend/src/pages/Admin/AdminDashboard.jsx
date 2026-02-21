import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center mb-8 shadow-sm">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-blue-100 text-sm font-medium mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                AI Summary
              </div>
              <h2 className="text-2xl font-semibold mb-2">Here's what Matters Today</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Hi Miracle 👋 You have 12 active tasks this week. 4 are overdue, 2 need your approval. Want me to suggest a priority list?
              </p>
            </div>
            <button className="mt-4 md:mt-0 bg-white text-blue-600 px-5 py-2.5 rounded-full font-medium text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm">
              View Priorities 
              <span className="text-lg leading-none">&rsaquo;</span>
            </button>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Metrics</h3>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1 */}
            <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-36">
              <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <h4 className="text-gray-500 text-sm mb-1">Completed</h4>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-gray-800">54</span>
                  <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full">+15 ↑ Last week</span>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-36">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <h4 className="text-gray-500 text-sm mb-1">In Progress</h4>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-gray-800">14</span>
                  <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full">-3 ↓ Yesterday</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-36">
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div>
                <h4 className="text-gray-500 text-sm mb-1">Overdue</h4>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-gray-800">4</span>
                  <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full">+1 ↑ Last week</span>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-36">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              </div>
              <div>
                <h4 className="text-gray-500 text-sm mb-1">Upcoming</h4>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-gray-800">6</span>
                  <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full">+2 ↑ Tomorrow</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section: Chart & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Bar Chart (Placeholder UI) */}
            <div className="lg:col-span-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Task Performance</h3>
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
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Instant Insights</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800">Deadline Risks</h5>
                    <p className="text-xs text-gray-500 mt-1">3 tasks risk delay this week. Reassign to stay on track</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800">Workload Balance</h5>
                    <p className="text-xs text-gray-500 mt-1">John Doe is overloaded (5 active tasks). Consider reassigning</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800">Efficiency Tip</h5>
                    <p className="text-xs text-gray-500 mt-1">Breaking tasks into subtasks boosts completion by 30%.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800">Improvement Tip</h5>
                    <p className="text-xs text-gray-500 mt-1">Daily check-ins cut task delays by 20%. Keep it consistent?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Active Projects & Task Flow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Active Projects */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Active Projects</h3>
              <div className="space-y-6">
                {/* Project 1 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-800">Marketing Website</span>
                      <div className="flex -space-x-2">
                        <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" alt="avatar" />
                        <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2" alt="avatar" />
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-red-400 text-[10px] text-white flex items-center justify-center">+3</div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">65%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div className="bg-teal-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-xs text-gray-400">Due in 3 days • 22/34 Tasks</p>
                </div>
                
                <hr className="border-gray-100" />

                {/* Project 2 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-800">Mobile App Redesign</span>
                      <div className="flex -space-x-2">
                        <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3" alt="avatar" />
                        <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=4" alt="avatar" />
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-yellow-400 text-[10px] text-white flex items-center justify-center">+1</div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">40%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <p className="text-xs text-gray-400">Due in 5 days • 14/36 Tasks</p>
                </div>
              </div>
            </div>

            {/* Task Flow */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Flow</h3>
              <div className="flex gap-2 mb-6 border-b border-gray-100 pb-2">
                <button className="px-4 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-full">To Do</button>
                <button className="px-4 py-1.5 text-gray-500 hover:bg-gray-50 text-sm font-medium rounded-full transition-colors border border-gray-200">In Progress</button>
                <button className="px-4 py-1.5 text-gray-500 hover:bg-gray-50 text-sm font-medium rounded-full transition-colors border border-gray-200">Completed</button>
              </div>

              {/* Task Item */}
              <div className="border border-gray-100 rounded-xl p-4 shadow-sm relative">
                <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                </button>
                <span className="inline-block px-2 py-1 bg-red-50 text-red-500 text-[10px] font-bold uppercase rounded mb-3">High</span>
                <h4 className="text-sm font-semibold text-gray-800 mb-4">Design New Landing Page</h4>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <img className="w-6 h-6 rounded-full" src="https://i.pravatar.cc/100?img=5" alt="avatar" />
                    <span className="text-xs text-gray-500 font-medium">Sep 23, 2025</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                     12
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