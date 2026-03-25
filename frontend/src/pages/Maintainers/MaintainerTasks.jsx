import React, { useState, useEffect, useCallback } from 'react';
import MaintainersSidebar from './MaintainersSidebar';
import MaintainersNavbar from './MaintainersNavbar';
import { CheckCircle2, MapPin, User, Wrench, PlayCircle, RefreshCcw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const MaintainerTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      // ✅ ඔයාගේ controller එකේ හැටියට partner/Id endpoint එක පාවිච්චි කරනවා
      const response = await fetch(`http://localhost:5000/api/maintenance/partner/${userInfo._id}`);
      const data = await response.json();
      
      if (response.ok) {
        // ✅ මෙතන filter එක status එකට විතරක් සීමා කරමු වැඩේ පැහැදිලි වෙන්න
        const activeTasks = Array.isArray(data) 
          ? data.filter(t => t.status !== 'Resolved' && t.status !== 'Closed') 
          : [];
        setTasks(activeTasks);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [userInfo._id]);

  useEffect(() => { 
    if (userInfo._id) fetchTasks(); 
  }, [fetchTasks, userInfo._id]);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      // ✅ වැදගත්: Controller එකේ route එක "/update/:id" ද කියලා බලන්න
      const response = await fetch(`http://localhost:5000/api/maintenance/update/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Task status updated to ${newStatus}!`);
        // ලැයිස්තුව අලුත් කරනවා
        fetchTasks();
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Status update failed");
      }
    } catch (error) {
      console.error("Status Update Error:", error);
      toast.error("Server connection failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Toaster position="top-center" />
      <MaintainersSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MaintainersNavbar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-gray-800 tracking-tight">Active Assignments</h2>
              <p className="text-gray-500 font-medium mt-1">Update the progress of your assigned maintenance tasks.</p>
            </div>
            <button 
              onClick={fetchTasks} 
              className="p-3 bg-white border border-gray-100 rounded-2xl text-[#2872A1] hover:bg-blue-50 transition-all shadow-sm"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <div className="p-20 text-center font-black text-gray-400 animate-pulse uppercase tracking-widest">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="p-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-200 mb-4" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No active tasks assigned.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task._id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 transition-all hover:shadow-md border-l-8 border-l-[#2872A1]">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                        task.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {task.status}
                      </span>
                      {task.priority === 'High' && (
                        <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1.5 rounded-2xl border border-red-100 uppercase tracking-widest animate-pulse">
                          High Priority
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-2xl font-black text-gray-800 mb-2 leading-tight">{task.issueType}</h4>
                    <p className="text-gray-500 font-medium italic mb-6">"{task.description}"</p>
                    
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <MapPin className="w-4 h-4 text-[#2872A1]" /> Room: {task.roomNumber || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <User className="w-4 h-4 text-[#2872A1]" /> {task.studentId?.name || 'Student'}
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS: මෙතන තමයි Buttons පේන්න ඕනේ */}
                  <div className="flex items-center gap-4 shrink-0">
                    {/* Status එක හරියටම පරීක්ෂා කරනවා - Case sensitive වෙන්න පුළුවන් නිසා check කරගන්න */}
                    {(task.status === 'Pending') && (
                      <button 
                        onClick={() => handleUpdateStatus(task._id, 'In Progress')} 
                        className="bg-[#2872A1] text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl shadow-blue-100 hover:bg-[#1e567a] flex items-center gap-2 transition-all active:scale-95"
                      >
                        <PlayCircle className="w-5 h-5" /> Start Task
                      </button>
                    )}
                    
                    {(task.status === 'In Progress') && (
                      <button 
                        onClick={() => handleUpdateStatus(task._id, 'Resolved')} 
                        className="bg-emerald-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl shadow-emerald-100 hover:bg-emerald-700 flex items-center gap-2 transition-all active:scale-95 tracking-widest"
                      >
                        <Wrench className="w-5 h-5" /> Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MaintainerTasks;