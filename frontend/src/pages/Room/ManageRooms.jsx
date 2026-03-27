import React, { useState, useEffect } from 'react';
import AdminSidebar from '../Admin/AdminSidebar';
import AdminNavbar from '../Admin/AdminNavbar';
import toast from 'react-hot-toast';
import { Eye } from 'lucide-react';

// Import our new extracted components!
import RoomForm from './RoomForm';
import RoomViewModal from './RoomViewModal';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  
  // State to manage which room we are Editing or Viewing
  const [editRoom, setEditRoom] = useState(null);
  const [viewRoom, setViewRoom] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/rooms');
      const data = await res.json();
      setRooms(data);
    } catch (err) { console.error(err); }
  };

  const deleteRoom = async (id) => {
    if(!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await fetch(`http://localhost:5000/api/rooms/${id}`, { method: 'DELETE' });
      toast.success("Room deleted successfully!");
      fetchRooms();
    } catch (error) {
      toast.error("Failed to delete room.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-8 relative">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Hostel Room Management</h2>
            {editRoom && (
              <button 
                onClick={() => setEditRoom(null)} 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold transition-colors"
              >
                Cancel Edit Mode
              </button>
            )}
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            
            {/* LEFT COLUMN: THE TABLE */}
            <div className="w-full xl:w-2/3 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-[#CBDDE9]/50 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#2872A1] text-[#CBDDE9] text-sm tracking-wide">
                      <th className="p-4 font-semibold">Room</th>
                      <th className="p-4 font-semibold">Type & Gender</th>
                      <th className="p-4 font-semibold">Occupancy</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {rooms.map((room) => (
                      <tr key={room._id} className={`hover:bg-blue-50/50 transition-colors ${!room.display ? 'opacity-50 bg-gray-50' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {room.image ? (
                              <img src={room.image} alt="Room" className="w-12 h-12 rounded-lg object-cover border border-[#CBDDE9]" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-[#CBDDE9]/30 flex items-center justify-center text-[#2872A1] text-xl">🛏️</div>
                            )}
                            <div>
                              <p className="font-bold text-gray-800 text-base">{room.roomNumber}</p>
                              <p className="text-xs text-gray-500">{room.floorLevel}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-[#2872A1]">{room.roomType}</p>
                          <p className="text-xs text-gray-500">{room.designatedGender}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                             <p className="font-bold text-gray-800">{room.currentOccupancy || 0} / {room.maxCapacity} Booked</p>
                             <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                               <div className="h-1.5 bg-[#2872A1] rounded-full" style={{ width: `${((room.currentOccupancy || 0) / room.maxCapacity) * 100}%` }}></div>
                             </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${room.status === 'Available' ? 'bg-green-100 text-green-700' : room.status === 'Full' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                            {room.status}
                          </span>
                          {!room.display && <span className="block mt-1 text-[10px] text-gray-400 font-bold uppercase">Hidden</span>}
                        </td>
                        
                        <td className="p-4 text-right space-x-2">
                          <button 
                            onClick={() => { setViewRoom(room); setIsViewModalOpen(true); }} 
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-semibold transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                          <button 
                            onClick={() => setEditRoom(room)} 
                            className="px-3 py-1.5 bg-[#CBDDE9]/40 text-[#2872A1] hover:bg-[#CBDDE9] rounded-lg font-semibold transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteRoom(room._id)} 
                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rooms.length === 0 && (
                      <tr><td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No rooms added yet. Use the form to create one!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT COLUMN: THE FORM */}
            <div className="w-full xl:w-1/3">
              <RoomForm 
                roomToEdit={editRoom} 
                onSuccess={() => { fetchRooms(); setEditRoom(null); }} 
                onCancel={() => setEditRoom(null)} 
              />
            </div>

          </div>
        </main>
      </div>

      {/* POPUP MODAL */}
      <RoomViewModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        room={viewRoom} 
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBDDE9; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ManageRooms;