import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Search, AlertCircle, CheckCircle, Clock, UserPlus, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// 👇 ALUTH: Sidebar ekayi Navbar ekayi import kala
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const ManageMaintenance = () => {
  const [tickets, setTickets] = useState([]);
  const [maintainers, setMaintainers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedMaintainer, setSelectedMaintainer] = useState('');

  // Fetch Tickets & Maintainers
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const ticketRes = await fetch('http://localhost:5000/api/maintenance/all');
      const ticketData = await ticketRes.json();
      setTickets(ticketData);

      const maintainerRes = await fetch('http://localhost:5000/api/auth/maintainers');
      const maintainerData = await maintainerRes.json();
      setMaintainers(maintainerData.filter(m => m.status === 'Active' || !m.status));
    } catch (error) {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedMaintainer(ticket.assignedTo?._id || '');
    setIsModalOpen(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedMaintainer) {
      toast.error("Please select a maintainer!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/maintenance/update/${selectedTicket._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assignedTo: selectedMaintainer,
          status: 'Assigned' 
        }),
      });

      if (response.ok) {
        toast.success("Maintainer assigned successfully!");
        setIsModalOpen(false);
        fetchData(); 
      } else {
        toast.error("Failed to assign maintainer.");
      }
    } catch (error) {
      toast.error("Server error. Try again.");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> Pending</span>;
      case 'Assigned': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><UserPlus className="w-3 h-3"/> Assigned</span>;
      case 'In Progress': return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Wrench className="w-3 h-3"/> In Progress</span>;
      case 'Resolved': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3"/> Resolved</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold w-max">{status}</span>;
    }
  };

  return (
    // 👇 ALUTH: Main Layout wrapper eka add kala (Sidebar + Navbar ekka)
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <Toaster position="top-center" />
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <Wrench className="w-8 h-8 text-[#2872A1]" /> Maintenance Requests
              </h1>
              <p className="text-gray-500 mt-2 font-medium">Manage and assign student maintenance issues.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search rooms..." className="outline-none text-sm w-48" />
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-500 font-bold animate-pulse">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">All caught up!</h3>
                <p className="text-gray-500 mt-2">No pending maintenance requests at the moment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-5 font-bold">Room</th>
                      <th className="p-5 font-bold">Issue / Priority</th>
                      <th className="p-5 font-bold">Student</th>
                      <th className="p-5 font-bold">Status</th>
                      <th className="p-5 font-bold">Assigned To</th>
                      <th className="p-5 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tickets.map((ticket) => (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={ticket._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-5 font-extrabold text-[#2872A1]">{ticket.roomNumber}</td>
                        <td className="p-5">
                          <p className="font-bold text-gray-800">{ticket.issueType}</p>
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{ticket.description}</p>
                          {ticket.priority === 'Critical' && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded mt-1 inline-block">CRITICAL</span>}
                        </td>
                        <td className="p-5 text-sm font-medium text-gray-700">{ticket.studentId?.name || 'Unknown'}</td>
                        <td className="p-5">{getStatusBadge(ticket.status)}</td>
                        <td className="p-5 text-sm font-bold text-gray-600">
                          {ticket.assignedTo ? ticket.assignedTo.name : <span className="text-gray-400 italic">Unassigned</span>}
                        </td>
                        <td className="p-5 text-center">
                          <button 
                            onClick={() => openAssignModal(ticket)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
                              ticket.status === 'Pending' 
                                ? 'bg-[#2872A1] text-white hover:bg-[#1f5a80]' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {ticket.status === 'Pending' ? 'Assign Now' : 'Edit Assign'}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ASSIGNMENT MODAL (Popup) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-[#2872A1] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold">Assign Maintainer</h3>
                <p className="text-blue-100 text-sm mt-1">Room {selectedTicket?.roomNumber} - {selectedTicket?.issueType}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAssign} className="p-6">
              {selectedTicket?.photo && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Issue Image</p>
                  <img src={`http://localhost:5000${selectedTicket.photo}`} alt="Issue" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Available Maintainer *</label>
                <select 
                  value={selectedMaintainer}
                  onChange={(e) => setSelectedMaintainer(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] outline-none cursor-pointer bg-gray-50"
                  required
                >
                  <option value="" disabled>-- Choose a Technician --</option>
                  {maintainers.map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.specialization || 'General'})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-[#2872A1] text-white rounded-xl font-bold hover:bg-[#1f5a80] transition-colors shadow-md">
                  Confirm Assign
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default ManageMaintenance;