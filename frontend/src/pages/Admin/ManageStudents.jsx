import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import { Eye, X, User, Phone, Mail, Home, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageStudents = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentInvoices, setStudentInvoices] = useState([]);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 1. Fetch all students
      const res = await axios.get('http://localhost:5000/api/auth/students');
      const studentsData = res.data;

      // 2. Fetch bookings for each student to get their Room Number & Profile Picture
      const enrichedStudents = await Promise.all(studentsData.map(async (student) => {
        try {
          const bookingRes = await axios.get(`http://localhost:5000/api/bookings/${student.email}`);
          return { ...student, booking: bookingRes.data };
        } catch (err) {
          return { ...student, booking: null }; // No booking found for this student
        }
      }));

      setUsers(enrichedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await axios.put('http://localhost:5000/api/auth/update-status', { 
        id, role: 'Student', status: newStatus 
      });
      toast.success(`Student marked as ${newStatus}`);
      fetchUsers(); // Refresh table
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const openViewModal = async (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
    setStudentInvoices([]); // Clear previous invoices

    // Fetch this specific student's payment history
    try {
      const res = await axios.get(`http://localhost:5000/api/invoices/student/${student.email}`);
      setStudentInvoices(res.data);
    } catch (error) {
      console.error("No invoices found or error fetching invoices.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Manage Students</h2>
              <p className="text-gray-500 text-sm mt-1">View student details, room assignments, and statuses.</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-5 font-bold">Student Details</th>
                  <th className="p-5 font-bold">Contact</th>
                  <th className="p-5 font-bold">Room Booked</th>
                  <th className="p-5 font-bold">Account Status</th>
                  <th className="p-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2872A1] mx-auto"></div>
                    </td>
                  </tr>
                ) : users.map((user) => (
                  <tr key={user._id} className="hover:bg-blue-50/30 transition-colors">
                    
                    {/* Student Info & Profile Pic */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2872A1] text-white flex items-center justify-center font-bold text-lg shadow-inner overflow-hidden border-2 border-white ring-2 ring-gray-100">
                          {user.booking?.profileImage ? (
                            <img src={user.booking.profileImage} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.gender}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="p-5">
                      <p className="text-gray-800 font-medium">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </td>

                    {/* Room Booked */}
                    <td className="p-5">
                      {user.booking ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#2872A1] rounded-lg font-bold border border-blue-100">
                          <Home className="w-3.5 h-3.5" /> {user.booking.roomNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs font-medium">No Room Assigned</span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border ${
                        user.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-5 text-right space-x-2">
                      <button 
                        onClick={() => openViewModal(user)} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-bold transition-colors text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button 
                        onClick={() => toggleStatus(user._id, user.status)} 
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-white font-bold text-xs transition-colors shadow-sm ${
                          user.status === 'Active' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                      >
                        {user.status === 'Active' ? 'Suspend' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-500 font-medium">No students registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* ========================================== */}
      {/* LANDSCAPE MODAL POPUP FOR STUDENT DETAILS */}
      {/* ========================================== */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-[#2872A1]" /> Student Information Portal
              </h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Landscape 3-Column Grid) */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Column 1: Personal Profile */}
                <div className="space-y-6">
                  <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-24 h-24 rounded-full bg-[#2872A1] text-white flex items-center justify-center font-bold text-3xl shadow-inner overflow-hidden border-4 border-white ring-2 ring-gray-200 mb-4">
                      {selectedStudent.booking?.profileImage ? (
                        <img src={selectedStudent.booking.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        selectedStudent.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 text-center">{selectedStudent.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{selectedStudent.gender}</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedStudent.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      Account: {selectedStudent.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Info</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-700 bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                      <Mail className="w-4 h-4 text-[#2872A1]" /> {selectedStudent.email}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                      <Phone className="w-4 h-4 text-[#2872A1]" /> {selectedStudent.phone}
                    </div>
                  </div>
                </div>

                {/* Column 2: Booking & Emergency Info */}
                <div className="space-y-6">
                  {selectedStudent.booking ? (
                    <>
                      <div className="bg-[#2872A1]/5 border border-[#2872A1]/20 p-6 rounded-2xl">
                        <h4 className="flex items-center gap-2 font-bold text-[#2872A1] mb-4">
                          <Home className="w-5 h-5" /> Hostel Accommodation
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Room Number</p>
                            <p className="text-xl font-extrabold text-gray-900">{selectedStudent.booking.roomNumber}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 font-bold uppercase">Move-in Date</p>
                              <p className="font-semibold text-gray-800">{new Date(selectedStudent.booking.expectedMoveInDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-bold uppercase">NIC Number</p>
                              <p className="font-semibold text-gray-800">{selectedStudent.booking.nicNumber}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Booking Status</p>
                            <p className="font-bold text-emerald-600 flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> {selectedStudent.booking.status}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-100 p-5 rounded-2xl">
                        <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> Emergency Contact
                        </h4>
                        <p className="font-bold text-gray-900">{selectedStudent.booking.emergencyContactName}</p>
                        <p className="font-bold text-red-600">{selectedStudent.booking.emergencyContactPhone}</p>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Home className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="font-bold text-gray-500">No Room Booked</p>
                      <p className="text-xs text-gray-400 mt-1">This student has not reserved a room yet.</p>
                    </div>
                  )}
                </div>

                {/* Column 3: Payment History */}
                <div className="space-y-4 flex flex-col h-full">
                  <h4 className="flex items-center gap-2 font-bold text-gray-800 border-b border-gray-100 pb-3">
                    <CreditCard className="w-5 h-5 text-[#2872A1]" /> Financial History
                  </h4>
                  
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {studentInvoices.length > 0 ? studentInvoices.map((invoice) => (
                      <div key={invoice._id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:border-[#CBDDE9] transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-gray-900 text-sm">{invoice.description}</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                            {invoice.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <p className="text-xs text-gray-400">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                          <p className="font-extrabold text-[#2872A1]">Rs. {invoice.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <CreditCard className="w-10 h-10 text-gray-200 mb-2" />
                        <p className="text-sm font-medium text-gray-400">No payment history found.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scrollbar styling for the modal */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBDDE9; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ManageStudents;