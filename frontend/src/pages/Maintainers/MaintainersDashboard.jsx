import React, { useState, useEffect } from 'react';
import MaintainersSidebar from './MaintainersSidebar';
import MaintainersNavbar from './MaintainersNavbar';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  User,
  MapPin
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const MaintainersDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // LocalStorage එකෙන් දැනට log වෙලා ඉන්න Maintainer ගේ info ගන්නවා
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      // මෙතන API එක ඔයාගේ backend එකේ හැටියට වෙනස් කරගන්න (उदा: /api/maintenance/partner/:id)
      const response = await fetch(`http://localhost:5000/api/maintenance/partner/${userInfo._id}`);
      const data = await response.json();
      
      if (response.ok) {
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load maintenance tasks");
    } finally {
      setLoading(false);
    }
  };

  // Metrics Calculation
  const newAssignments = requests.filter(r => r.status === 'Pending').length;
  const inProgress = requests.filter(r => r.status === 'In Progress').length;
  const resolvedToday = requests.filter(r => r.status === 'Resolved').length;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <Toaster position="top-center" />
      <MaintainersSidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <MaintainersNavbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
              <Wrench className="text-[#2872A1]" /> Maintainer Dashboard
            </h2>
            <p className="text-gray-500 font-medium mt-1">Manage and update student maintenance requests.</p>
          </div>

          {/* Metrics Section */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-[2rem] transition-all hover:shadow-md border-l-4 border-l-emerald-500">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <AlertCircle />
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">New</span>
              </div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">New Assignments</h3>
              <p className="mt-2 text-4xl font-black text-gray-800">{loading ? '..' : newAssignments}</p>
            </div>

            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-[2rem] transition-all hover:shadow-md border-l-4 border-l-amber-500">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Clock />
                </div>
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest bg-amber-50 px-2 py-1 rounded-lg">Active</span>
              </div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tasks In Progress</h3>
              <p className="mt-2 text-4xl font-black text-gray-800">{loading ? '..' : inProgress}</p>
            </div>

            <div className="p-6 bg-[#2872A1] shadow-lg shadow-blue-100 rounded-[2rem] transition-all hover:scale-[1.02] text-white border-none">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <CheckCircle2 />
                </div>
              </div>
              <h3 className="text-xs font-bold text-blue-100 uppercase tracking-widest">Completed</h3>
              <p className="mt-2 text-4xl font-black">{loading ? '..' : resolvedToday}</p>
            </div>
          </div>

          {/* Recent Tasks List */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-800 uppercase tracking-tighter">Current Tasks</h3>
              <button onClick={fetchMaintenanceRequests} className="text-xs font-bold text-[#2872A1] hover:underline">Refresh List</button>
            </div>
            
            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="p-20 text-center text-gray-400 font-bold animate-pulse uppercase tracking-widest">Loading tasks...</div>
              ) : requests.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                  <Wrench className="w-12 h-12 text-gray-200 mb-4" />
                  <p className="text-gray-400 font-bold">No tasks assigned to you yet.</p>
                </div>
              ) : (
                requests.map((task) => (
                  <div key={task._id} className="p-6 hover:bg-gray-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        task.status === 'Pending' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-800 text-lg leading-tight">{task.issueType}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <span className="text-xs font-bold text-gray-400 flex items-center gap-1 uppercase tracking-tighter">
                            <User className="w-3 h-3" /> {task.studentId?.name || 'Student'}
                          </span>
                          <span className="text-xs font-bold text-[#2872A1] flex items-center gap-1 uppercase tracking-tighter">
                            <MapPin className="w-3 h-3" /> Room: {task.roomNumber || 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 italic font-medium">"{task.description}"</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 self-end md:self-center">
                       <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                         task.status === 'Pending' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                       }`}>
                         {task.status}
                       </span>
                       <button className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-[#2872A1] hover:border-[#2872A1] transition-all">
                         <ArrowRight className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MaintainersDashboard;