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
  PlayCircle,
  Image as ImageIcon,
  Maximize2,
  X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const MaintainersDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); 
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  void motion;

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

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/maintenance/update/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Task successfully updated to ${newStatus}!`);
        fetchMaintenanceRequests();
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Status update failed");
      }
    } catch (error) {
      console.error("Update Status Error:", error); 
      toast.error("Server connection failed");
    }
  };

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
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans">
      <Toaster position="top-center" />
      <MaintainersSidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <MaintainersNavbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-[#2872A1] rounded-xl text-white shadow-lg shadow-blue-200">
                <Wrench size={28} />
              </div>
              Maintainer Dashboard
            </h2>
            <p className="text-slate-500 font-medium mt-2 ml-1">Live maintenance stream & room status control.</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
            {[
              { label: 'New Jobs', val: newAssignments, icon: AlertCircle, color: 'emerald', bg: 'bg-emerald-500' },
              { label: 'In Progress', val: inProgress, icon: Clock, color: 'amber', bg: 'bg-amber-500' },
              { label: 'Completed', val: resolvedToday, icon: CheckCircle2, color: 'blue', bg: 'bg-[#2872A1]' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5"
              >
                <div className={`w-14 h-14 ${stat.bg} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
                  <stat.icon size={28} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-800">{loading ? '..' : stat.val}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tasks List */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-7 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Active Field Requests</h3>
              <button onClick={fetchMaintenanceRequests} className="text-xs font-black text-[#2872A1] bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-all">REFRESH STREAM</button>
            </div>
            
            <div className="divide-y divide-slate-50">
              {loading ? (
                <div className="p-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest">Synchronizing Field Data...</div>
              ) : requests.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Wrench className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No pending maintenance orders</p>
                </div>
              ) : (
                requests
                  .filter(t => {
                    const s = (t.status || '').toLowerCase();
                    return s !== 'resolved' && s !== 'closed';
                  })
                  .map((task) => {
                    const currentStatus = (task.status || 'Pending').toLowerCase();
                    const isPendingOrAssigned = currentStatus === 'pending' || currentStatus === 'assigned';
                    const isInProgress = currentStatus === 'in progress';

                    return (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={task._id} 
                        className="p-6 md:p-8 hover:bg-slate-50/80 transition-all flex flex-col lg:flex-row gap-6 items-start lg:items-center"
                      >
                        {/* STUDENT UPLOADED IMAGE */}
                        <div className="relative group shrink-0">
                          {task.photo ? (
                            <div 
                              className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden shadow-md border-4 border-white cursor-pointer relative"
                              onClick={() => setSelectedImage(`http://localhost:5000${task.photo}`)}
                            >
                              <img 
                                src={`http://localhost:5000${task.photo}`} 
                                alt="Issue" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Maximize2 className="text-white w-6 h-6" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-slate-100 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-400">
                              <ImageIcon size={32} strokeWidth={1} />
                              <span className="text-[10px] font-bold mt-2 uppercase tracking-tighter">No Photo</span>
                            </div>
                          )}
                        </div>

                        {/* INFO SECTION */}
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              isPendingOrAssigned ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {task.status || 'Pending'}
                            </span>
                            {task.priority === 'High' && (
                              <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse">Emergency</span>
                            )}
                          </div>

                          <h4 className="font-black text-slate-800 text-2xl leading-tight">{task.issueType}</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-100/50 p-2 rounded-xl border border-slate-100">
                              <User className="w-4 h-4 text-[#2872A1]" /> {task.studentId?.name || 'Unknown Student'}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-100/50 p-2 rounded-xl border border-slate-100">
                              <MapPin className="w-4 h-4 text-[#2872A1]" /> Room: {task.roomNumber || 'N/A'}
                            </div>
                          </div>

                          <p className="text-slate-500 text-sm font-medium italic border-l-4 border-slate-200 pl-4 py-1">
                            "{task.description}"
                          </p>
                        </div>
                        
                        {/* ACTIONS */}
                        <div className="flex flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-auto">
                          {isPendingOrAssigned && (
                            <button 
                              onClick={() => handleUpdateStatus(task._id, 'In Progress')} 
                              className="flex-1 lg:w-40 bg-[#2872A1] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-100 hover:bg-[#1e567a] flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                              <PlayCircle size={18} /> Start Task
                            </button>
                          )}

                          {isInProgress && (
                            <button 
                              onClick={() => handleUpdateStatus(task._id, 'Resolved')} 
                              className="flex-1 lg:w-40 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-emerald-100 hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all active:scale-95 tracking-widest"
                            >
                              <CheckCircle2 size={18} /> Complete
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
              )}
            </div>
          </div>
        </main>
      </div>

      {/* IMAGE MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-5"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-10 right-10 text-white p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
              <X size={32} />
            </button>
            <motion.img 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              src={selectedImage} 
              className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl border-4 border-white/10"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaintainersDashboard;