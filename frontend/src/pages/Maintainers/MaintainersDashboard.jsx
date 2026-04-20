import React, { useState, useEffect, useCallback } from 'react';
import MaintainersSidebar from './MaintainersSidebar';
import MaintainersNavbar from './MaintainersNavbar';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User,
  MapPin,
  PlayCircle // Start button icon
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const MaintainersDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

  // useCallback පාවිච්චි කළා dependency warning එක නැති කරන්න
  const fetchMaintenanceRequests = useCallback(async () => {
    try {
      setLoading(true);
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
  }, [userInfo._id]);

  useEffect(() => {
    fetchMaintenanceRequests();
  }, [fetchMaintenanceRequests]);

  // Dashboard එකේ ඉඳන්ම Status මාරු කරන Function එක
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/maintenance/update/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Task successfully updated to ${newStatus}!`);
        fetchMaintenanceRequests(); // List එක Refresh කරනවා
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Status update failed");
      }
    } catch (error) {
      // මෙතන අර 'error is defined but never used' කියන එක හැදුවා
      console.error("Update Status Error:", error); 
      toast.error("Server connection failed");
    }
  };

  // Status Counts
  const newAssignments = requests.filter(r => {
    const s = (r.status || '').toLowerCase();
    return s === 'pending' || s === 'assigned';
  }).length;
  
  const inProgress = requests.filter(r => (r.status || '').toLowerCase() === 'in progress').length;
  const resolvedToday = requests.filter(r => {
    const s = (r.status || '').toLowerCase();
    return s === 'resolved' || s === 'closed';
  }).length;

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
            <p className="text-gray-500 font-medium mt-1">Manage and update student maintenance requests directly.</p>
          </div>

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
                requests
                  .filter(t => {
                    const s = (t.status || '').toLowerCase();
                    return s !== 'resolved' && s !== 'closed'; // Resolved ඒව අයින් කරනවා
                  })
                  .map((task) => {
                    // කැපිටල් සිම්පල් මොක තිබ්බත් අඳුරගන්න logic එක හැදුවා
                    const currentStatus = (task.status || 'Pending').toLowerCase();
                    const isPendingOrAssigned = currentStatus === 'pending' || currentStatus === 'assigned';
                    const isInProgress = currentStatus === 'in progress';

                    return (
                      <div key={task._id} className="p-6 hover:bg-gray-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            isPendingOrAssigned ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
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
                          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            isPendingOrAssigned ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {task.status || 'Pending'}
                          </span>
                          
                          {/* 👇 මෙන්න අලුත් Buttons ටික */}
                          
                          {isPendingOrAssigned && (
                            <button 
                              onClick={() => handleUpdateStatus(task._id, 'In Progress')} 
                              className="bg-[#2872A1] text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-[#1e567a] flex items-center gap-1.5 transition-all active:scale-95"
                            >
                              <PlayCircle className="w-4 h-4" /> Start
                            </button>
                          )}

                          {isInProgress && (
                            <button 
                              onClick={() => handleUpdateStatus(task._id, 'Resolved')} 
                              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-emerald-700 flex items-center gap-1.5 transition-all active:scale-95 tracking-widest"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Complete
                            </button>
                          )}

                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MaintainersDashboard;