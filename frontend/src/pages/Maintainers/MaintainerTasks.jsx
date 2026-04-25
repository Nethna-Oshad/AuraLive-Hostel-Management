import React, { useState, useEffect, useCallback } from 'react';
import MaintainersSidebar from './MaintainersSidebar';
import MaintainersNavbar from './MaintainersNavbar';
import { 
  CheckCircle2, 
  MapPin, 
  User, 
  Wrench, 
  PlayCircle, 
  RefreshCcw, 
  AlertCircle,
  Image as ImageIcon,
  Maximize2,
  X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const MaintainerTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); 
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  void motion;

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/maintenance/partner/${userInfo._id}`);
      const data = await response.json();
      
      if (response.ok) {
        const activeTasks = Array.isArray(data) 
          ? data.filter(t => {
              const s = (t.status || '').toLowerCase();
              return s !== 'resolved' && s !== 'closed';
            }) 
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
      const response = await fetch(`http://localhost:5000/api/maintenance/update/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Task status updated to ${newStatus}!`);
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
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans">
      <Toaster position="top-center" />
      <MaintainersSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MaintainersNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-10">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">Assigned Jobs</h2>
              <p className="text-slate-500 font-medium mt-1">Manage and execute your active field operations.</p>
            </div>
            <button 
              onClick={fetchTasks} 
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <RefreshCcw size={18} className={`${loading ? 'animate-spin' : ''}`} />
              Refresh Feed
            </button>
          </motion.div>

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <div className="p-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest bg-white rounded-[3rem] border border-slate-100">
                Fetching Assignment Details...
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={40} className="text-emerald-200" />
                </div>
                <h3 className="text-xl font-black text-slate-800">Queue is Empty</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">All tasks have been resolved</p>
              </div>
            ) : (
              tasks.map((task) => {
                const currentStatus = (task.status || 'Pending').toLowerCase();
                const isInProgress = currentStatus === 'in progress';
                
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={task._id} 
                    className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row items-start lg:items-center gap-8 transition-all hover:shadow-xl border-l-[12px] border-l-[#2872A1]"
                  >
                    {/* STUDENT IMAGE PREVIEW */}
                    <div className="relative group shrink-0 self-center lg:self-auto">
                      {task.photo ? (
                        <div 
                          className="w-40 h-40 md:w-48 md:h-48 rounded-[2rem] overflow-hidden shadow-lg border-4 border-white cursor-pointer relative"
                          onClick={() => setSelectedImage(`http://localhost:5000${task.photo}`)}
                        >
                          <img 
                            src={`http://localhost:5000${task.photo}`} 
                            alt="Evidence" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-[#2872A1]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="text-white w-8 h-8 drop-shadow-md" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-40 h-40 md:w-48 md:h-48 rounded-[2rem] bg-slate-50 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-300">
                          <ImageIcon size={48} strokeWidth={1} />
                          <span className="text-[10px] font-black mt-3 uppercase tracking-widest">No Visual Data</span>
                        </div>
                      )}
                    </div>

                    {/* TASK INFO */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${
                          isInProgress ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                          {task.status || 'Pending'}
                        </span>
                        {task.priority === 'High' && (
                          <span className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest animate-pulse shadow-md shadow-red-100">
                            Critical Alert
                          </span>
                        )}
                      </div>
                      
                      <h4 className="text-3xl font-black text-slate-800 mb-3 tracking-tighter leading-tight">{task.issueType}</h4>
                      <p className="text-slate-500 font-medium italic text-lg mb-6 border-l-4 border-slate-100 pl-5">"{task.description}"</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#2872A1] shadow-sm">
                            <MapPin size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                            <p className="font-bold text-slate-700">Room {task.roomNumber || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#2872A1] shadow-sm">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported By</p>
                            <p className="font-bold text-slate-700">{task.studentId?.name || 'Student'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-auto pt-6 lg:pt-0">
                      {!isInProgress && (
                        <button 
                          onClick={() => handleUpdateStatus(task._id, 'In Progress')} 
                          className="flex-1 lg:w-48 bg-[#2872A1] text-white px-8 py-5 rounded-[1.5rem] font-black text-xs uppercase shadow-xl shadow-blue-100 hover:bg-[#1e567a] hover:-translate-y-1 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <PlayCircle size={20} /> Deploy Now
                        </button>
                      )}
                      
                      {isInProgress && (
                        <button 
                          onClick={() => handleUpdateStatus(task._id, 'Resolved')} 
                          className="flex-1 lg:w-48 bg-emerald-600 text-white px-8 py-5 rounded-[1.5rem] font-black text-xs uppercase shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-1 flex items-center justify-center gap-2 transition-all active:scale-95 tracking-widest"
                        >
                          <Wrench size={20} /> Finish Job
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </main>
      </div>

      {/* IMAGE ZOOM MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-5 md:p-20"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-10 right-10 text-white p-4 bg-white/10 rounded-full hover:bg-white/20 transition-all">
              <X size={32} />
            </button>
            <motion.img 
              initial={{ scale: 0.8, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              src={selectedImage} 
              className="max-w-full max-h-full rounded-[2.5rem] shadow-2xl border-8 border-white/10 object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaintainerTasks;