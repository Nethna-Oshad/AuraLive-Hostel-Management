import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  CheckCircle2, 
  MapPin, 
  User, 
  Calendar,
  Clock,
  Hammer,
  PlusCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const MyMaintenanceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Student ගේ details LocalStorage එකෙන් ගන්නවා
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

  // 👇 useCallback පාවිච්චි කරලා අර dependency warning එක හැදුවා
  const fetchMyRequests = useCallback(async () => {
    try {
      setLoading(true);
      if (!userInfo._id) return;
      
      const response = await fetch(`http://localhost:5000/api/maintenance/student/${userInfo._id}`);
      const data = await response.json();

      if (response.ok) {
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      // 👇 error එක console.error එකට දාලා 'error is defined but never used' warning එක හැදුවා
      console.error("Fetch Error:", error); 
      toast.error("Failed to load your requests");
    } finally {
      setLoading(false);
    }
  }, [userInfo._id]);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  // Status එකට අදාළ Step එක හොයාගන්න Function එක
  const getProgressStep = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'resolved' || s === 'closed') return 4;
    if (s === 'in progress') return 3;
    if (s === 'assigned') return 2;
    return 1; // pending හෝ වෙන මොනවා හරි නම් Step 1
  };

  // Progress Bar එක අඳින Component එක (Amazon Tracking වගේ)
  const TrackingStepper = ({ currentStep }) => {
    const steps = [
      { id: 1, name: 'Submitted', icon: <Clock className="w-4 h-4" /> },
      { id: 2, name: 'Assigned', icon: <User className="w-4 h-4" /> },
      { id: 3, name: 'In Progress', icon: <Hammer className="w-4 h-4" /> },
      { id: 4, name: 'Resolved', icon: <CheckCircle2 className="w-4 h-4" /> }
    ];

    return (
      <div className="mt-8 relative">
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full"></div>
        
        {/* Active Line (පිරෙන කෑල්ල) */}
        <div 
          className="absolute top-5 left-0 h-1 bg-[#2872A1] rounded-full transition-all duration-700 ease-in-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isActive = currentStep >= step.id;
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 shadow-sm z-10 transition-all duration-500 ${
                  isActive ? 'bg-[#2872A1] border-blue-100 text-white scale-110' : 'bg-white border-gray-100 text-gray-300'
                }`}>
                  {step.icon}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest mt-3 ${
                  isActive ? 'text-[#2872A1]' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 font-sans min-h-screen">
      <Toaster position="top-center" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            <Wrench className="text-[#2872A1]" /> Track Maintenance
          </h1>
          <p className="text-gray-500 font-medium mt-1">Monitor the live progress of your repair requests.</p>
        </div>
        
        {/* අලුත් Request එකක් දාන්න යන Button එක */}
        <button 
          onClick={() => navigate('/student/maintenance')} 
          className="bg-[#2872A1] text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-100 hover:bg-[#1e567a] flex items-center justify-center gap-2 transition-all active:scale-95 tracking-widest shrink-0"
        >
          <PlusCircle className="w-5 h-5" /> New Request
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-20 text-center font-black text-gray-400 animate-pulse uppercase tracking-widest bg-white rounded-[2.5rem] border border-gray-100">
            Fetching your requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center">
            <CheckCircle2 className="w-20 h-20 text-emerald-200 mb-4" />
            <h3 className="text-xl font-black text-gray-800 mb-2">No active issues!</h3>
            <p className="text-gray-400 font-bold text-sm">You haven't submitted any maintenance requests yet.</p>
          </div>
        ) : (
          requests.map((req) => {
            const currentStep = getProgressStep(req.status);
            
            return (
              <div key={req._id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all">
                
                {/* Request Details */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-50 pb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                        currentStep === 4 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {req.status || 'Pending'}
                      </span>
                      {req.priority === 'High' && (
                        <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1.5 rounded-2xl border border-red-100 uppercase tracking-widest">
                          High Priority
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 leading-tight">{req.issueType}</h3>
                    <p className="text-gray-500 font-medium italic mt-2 text-sm">"{req.description}"</p>
                  </div>
                  
                  <div className="flex flex-col gap-2 text-right">
                    <span className="text-xs font-black text-gray-400 flex items-center justify-end gap-1.5 uppercase tracking-widest">
                      <Calendar className="w-4 h-4 text-[#2872A1]" /> 
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-black text-gray-400 flex items-center justify-end gap-1.5 uppercase tracking-widest">
                      <MapPin className="w-4 h-4 text-[#2872A1]" /> Room: {req.roomNumber || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Assigned Maintainer Info */}
                {req.assignedTo && currentStep < 4 && (
                  <div className="bg-blue-50/50 p-4 rounded-2xl flex items-center gap-3 mb-6 border border-blue-50/50">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#2872A1] shadow-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Assigned Technician</p>
                      <p className="text-sm font-bold text-gray-700">{req.assignedTo?.name || 'Partner'}</p>
                    </div>
                  </div>
                )}

                {/* 🚀 LIVE TRACKING STEPPER */}
                <TrackingStepper currentStep={currentStep} />
                
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyMaintenanceRequests;