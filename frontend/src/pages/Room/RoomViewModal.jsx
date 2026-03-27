import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, X, Users, Mail, Phone, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const RoomViewModal = ({ isOpen, onClose, room }) => {
  const [roomStudents, setRoomStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    if (isOpen && room) {
      fetchRoomStudents();
    }
  }, [isOpen, room]);

  const fetchRoomStudents = async () => {
    setIsLoadingStudents(true);
    setRoomStudents([]);
    try {
      const res = await axios.get('http://localhost:5000/api/auth/students');
      const studentsData = res.data;

      const enrichedStudents = await Promise.all(studentsData.map(async (student) => {
        try {
          const bookingRes = await axios.get(`http://localhost:5000/api/bookings/${student.email}`);
          return { ...student, booking: bookingRes.data };
        } catch (err) {
          return { ...student, booking: null };
        }
      }));

      const bookedInThisRoom = enrichedStudents.filter(s => s.booking && s.booking.roomNumber === room.roomNumber);
      setRoomStudents(bookedInThisRoom);
    } catch (error) {
      toast.error("Failed to load students for this room.");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-[#2872A1] text-white">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Home className="w-6 h-6" /> Room {room.roomNumber} Dashboard
          </h2>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUMN 1: Room Details */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-fit">
              <div className="w-full h-40 bg-gray-200 rounded-xl mb-6 overflow-hidden border border-gray-300">
                {room.image ? (
                  <img src={room.image} alt="Room" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🛏️</div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-sm font-bold text-gray-500">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${room.status === 'Available' ? 'bg-green-100 text-green-700' : room.status === 'Full' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {room.status}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-sm font-bold text-gray-500">Occupancy</span>
                  <span className="font-extrabold text-[#2872A1]">{room.currentOccupancy || 0} / {room.maxCapacity}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-sm font-bold text-gray-500">Monthly Rent</span>
                  <span className="font-bold text-gray-800">Rs. {room.monthlyRent}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-sm font-bold text-gray-500">Key Money</span>
                  <span className="font-bold text-gray-800">Rs. {room.keyMoney}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-sm font-bold text-gray-500">Type</span>
                  <span className="font-bold text-gray-800">{room.roomType} ({room.designatedGender})</span>
                </div>
              </div>
            </div>

            {/* COLUMNS 2 & 3: Students Currently Booked */}
            <div className="lg:col-span-2 flex flex-col">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <Users className="w-6 h-6 text-[#2872A1]" /> 
                Students Booked in Room {room.roomNumber}
              </h3>

              <div className="flex-1 space-y-4">
                {isLoadingStudents ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2872A1]"></div>
                  </div>
                ) : roomStudents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roomStudents.map((student, index) => (
                      <div key={index} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${student.booking.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-orange-400'}`}></div>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-full bg-[#CBDDE9]/40 text-[#2872A1] flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm overflow-hidden">
                            {student.booking?.profileImage ? (
                              <img src={student.booking.profileImage} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              student.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{student.name}</h4>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${student.booking.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                              {student.booking.paymentStatus === 'Paid' ? 'Rent Paid' : 'Payment Pending'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4 text-[#2872A1]" /> {student.email}</p>
                          <p className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4 text-[#2872A1]" /> {student.phone}</p>
                          <p className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4 text-[#2872A1]" /> Move-in: {new Date(student.booking.expectedMoveInDate).toLocaleDateString()}</p>
                        </div>

                        <div className="mt-3 bg-red-50 p-3 rounded-xl border border-red-100">
                          <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                            <AlertCircle className="w-3 h-3" /> Emergency Contact
                          </p>
                          <p className="text-xs font-bold text-gray-800">{student.booking.emergencyContactName} • <span className="text-red-600">{student.booking.emergencyContactPhone}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <Users className="w-8 h-8 text-gray-300" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-700">No Students Yet</h4>
                    <p className="text-gray-500 text-sm mt-1">This room is currently empty. Wait for students to book this space.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBDDE9; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default RoomViewModal;