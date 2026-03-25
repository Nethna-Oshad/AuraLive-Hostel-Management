import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../Admin/AdminSidebar';
import AdminNavbar from '../Admin/AdminNavbar';
import toast from 'react-hot-toast';
import { Eye, X, Users, Phone, Mail, Home, ShieldCheck, AlertCircle, Calendar, CreditCard } from 'lucide-react';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // View Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewRoom, setViewRoom] = useState(null);
  const [roomStudents, setRoomStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const initialForm = {
    roomNumber: '', floorLevel: 'Ground', roomType: 'Single', designatedGender: 'Neutral',
    airConditioning: 'Non-AC', bathroomType: 'Common', furnishing: [], hasBalcony: false,
    monthlyRent: '', keyMoney: '', maxCapacity: '1', description: '', status: 'Available', display: true
  };
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);

  const amenitiesList = ['Bed', 'Study Desk', 'Chair', 'Wardrobe', 'Ceiling Fan', 'Mini Fridge'];

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/rooms');
      const data = await res.json();
      setRooms(data);
    } catch (err) { console.error(err); }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    // SMART FEATURE: Auto-adjust and lock max capacity based on Room Type
    let updatedFormData = { ...formData, [name]: newValue };
    
    if (name === 'roomType') {
      if (newValue === 'Single') updatedFormData.maxCapacity = '1';
      if (newValue === 'Double') updatedFormData.maxCapacity = '2';
      if (newValue === 'Triple') updatedFormData.maxCapacity = '3';
      if (newValue === 'Shared Dorm' && Number(formData.maxCapacity) < 4) {
        updatedFormData.maxCapacity = '4'; // Default to 4 if they switch to Shared Dorm
      }
    }

    setFormData(updatedFormData);
  };

  const handleFurnishingChange = (item) => {
    setFormData(prev => {
      const isSelected = prev.furnishing.includes(item);
      return {
        ...prev,
        furnishing: isSelected ? prev.furnishing.filter(f => f !== item) : [...prev.furnishing, item]
      };
    });
  };

  const editRoom = (room) => {
    setIsEditing(true);
    setEditId(room._id);
    setFormData({
      roomNumber: room.roomNumber, floorLevel: room.floorLevel, roomType: room.roomType, designatedGender: room.designatedGender,
      airConditioning: room.airConditioning, bathroomType: room.bathroomType, furnishing: room.furnishing || [],
      hasBalcony: room.hasBalcony, monthlyRent: room.monthlyRent, keyMoney: room.keyMoney, maxCapacity: room.maxCapacity,
      description: room.description, status: room.status, display: room.display
    });
    setImageFile(null); 
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ==========================================
    // STRICT FORM VALIDATIONS BEFORE SUBMITTING
    // ==========================================
    const { roomNumber, monthlyRent, keyMoney, maxCapacity, roomType } = formData;
    
    if (!roomNumber.trim()) return toast.error("Room Number cannot be empty.");
    if (Number(monthlyRent) <= 0) return toast.error("Monthly Rent must be greater than Rs. 0");
    if (Number(keyMoney) < 0) return toast.error("Key Money cannot be negative.");
    
    const capacity = Number(maxCapacity);
    if (roomType === 'Single' && capacity !== 1) return toast.error("Single rooms must have exactly 1 capacity.");
    if (roomType === 'Double' && capacity !== 2) return toast.error("Double rooms must have exactly 2 capacity.");
    if (roomType === 'Triple' && capacity !== 3) return toast.error("Triple rooms must have exactly 3 capacity.");
    if (roomType === 'Shared Dorm' && capacity < 4) return toast.error("Shared Dorms must have a capacity of 4 or more.");
    // ==========================================

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'furnishing') {
        submitData.append(key, JSON.stringify(formData[key])); 
      } else {
        submitData.append(key, formData[key]);
      }
    });
    if (imageFile) submitData.append('image', imageFile);

    const url = isEditing ? `http://localhost:5000/api/rooms/${editId}` : 'http://localhost:5000/api/rooms';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: submitData });
      if (res.ok) {
        toast.success(isEditing ? 'Room updated successfully!' : 'New room created perfectly!');
        fetchRooms();
        setFormData(initialForm);
        setImageFile(null);
        setIsEditing(false);
        setEditId(null);
        e.target.reset(); 
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to save room.");
      }
    } catch (err) { 
      toast.error("Server error. Please try again.");
      console.error(err); 
    }
  };

  // ==========================================
  // VIEW ROOM MODAL LOGIC
  // ==========================================
  const openViewModal = async (room) => {
    setViewRoom(room);
    setIsViewModalOpen(true);
    setIsLoadingStudents(true);
    setRoomStudents([]);

    try {
      // 1. Get all students
      const res = await axios.get('http://localhost:5000/api/auth/students');
      const studentsData = res.data;

      // 2. Fetch their bookings to see who is in THIS room
      const enrichedStudents = await Promise.all(studentsData.map(async (student) => {
        try {
          const bookingRes = await axios.get(`http://localhost:5000/api/bookings/${student.email}`);
          return { ...student, booking: bookingRes.data };
        } catch (err) {
          return { ...student, booking: null };
        }
      }));

      // 3. Filter only students booked in this exact room number
      const bookedInThisRoom = enrichedStudents.filter(s => s.booking && s.booking.roomNumber === room.roomNumber);
      setRoomStudents(bookedInThisRoom);
    } catch (error) {
      toast.error("Failed to load students for this room.");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewRoom(null);
  };

  const isCapacityLocked = ['Single', 'Double', 'Triple'].includes(formData.roomType);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-8 relative">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Hostel Room Management</h2>
            {isEditing && (
              <button onClick={() => { setIsEditing(false); setFormData(initialForm); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold transition-colors">
                Cancel Edit Mode
              </button>
            )}
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
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
                          <button onClick={() => openViewModal(room)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-semibold transition-colors inline-flex items-center gap-1">
                            <Eye className="w-4 h-4" /> View
                          </button>
                          <button onClick={() => editRoom(room)} className="px-3 py-1.5 bg-[#CBDDE9]/40 text-[#2872A1] hover:bg-[#CBDDE9] rounded-lg font-semibold transition-colors">
                            Edit
                          </button>
                          <button onClick={() => deleteRoom(room._id)} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-colors">
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

            {/* FORM COLUMN */}
            <div className="w-full xl:w-1/3">
              <div className="bg-white rounded-2xl shadow-xl shadow-[#CBDDE9]/30 border border-[#CBDDE9]/50 p-6 sticky top-6">
                <h3 className="text-xl font-bold text-[#2872A1] mb-6 flex items-center gap-2">
                  {isEditing ? '✏️ Edit Room Details' : '✨ Add New Room'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Room Number *</label>
                      <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleInputChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2872A1] outline-none text-sm" placeholder="e.g. A-101" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Floor Level</label>
                      <select name="floorLevel" value={formData.floorLevel} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2872A1] outline-none text-sm">
                        <option value="Ground">Ground Floor</option>
                        <option value="1st Floor">1st Floor</option>
                        <option value="2nd Floor">2nd Floor</option>
                        <option value="3rd Floor">3rd Floor</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Room Type</label>
                      <select name="roomType" value={formData.roomType} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2872A1] outline-none text-sm">
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Triple">Triple</option>
                        <option value="Shared Dorm">Shared Dorm</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Allowed Gender</label>
                      <select name="designatedGender" value={formData.designatedGender} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2872A1] outline-none text-sm">
                        <option value="Boys Only">Boys Only</option>
                        <option value="Girls Only">Girls Only</option>
                        <option value="Neutral">Neutral / Mixed</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/50 rounded-xl border border-[#CBDDE9]/50 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#2872A1] mb-1">Monthly Rent (Rs) *</label>
                        <input type="number" name="monthlyRent" value={formData.monthlyRent} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-200 rounded-lg outline-none text-sm bg-white focus:ring-2 focus:ring-[#2872A1]" placeholder="e.g. 25000" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#2872A1] mb-1">Key Money (Rs) *</label>
                        <input type="number" name="keyMoney" value={formData.keyMoney} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-200 rounded-lg outline-none text-sm bg-white focus:ring-2 focus:ring-[#2872A1]" placeholder="e.g. 50000" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2872A1] mb-1">Max Student Capacity *</label>
                      <input 
                        type="number" 
                        name="maxCapacity" 
                        value={formData.maxCapacity} 
                        onChange={handleInputChange} 
                        required 
                        min={isCapacityLocked ? formData.maxCapacity : "4"} 
                        readOnly={isCapacityLocked}
                        className={`w-full p-2.5 border border-gray-200 rounded-lg outline-none text-sm transition-colors ${
                          isCapacityLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-[#2872A1]'
                        }`} 
                      />
                      {isCapacityLocked && (
                        <p className="text-[10px] text-gray-500 mt-1 font-bold">Locked based on selected Room Type.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">A/C Status</label>
                      <select name="airConditioning" value={formData.airConditioning} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                        <option value="AC">AC Room</option>
                        <option value="Non-AC">Non-AC Room</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Bathroom</label>
                      <select name="bathroomType" value={formData.bathroomType} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                        <option value="Attached">Attached (Private)</option>
                        <option value="Common">Common (Shared)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2">Furnishing Included</label>
                    <div className="grid grid-cols-2 gap-2">
                      {amenitiesList.map(item => (
                        <label key={item} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input type="checkbox" checked={formData.furnishing.includes(item)} onChange={() => handleFurnishingChange(item)} className="w-4 h-4 text-[#2872A1] rounded" />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" name="hasBalcony" id="hasBalcony" checked={formData.hasBalcony} onChange={handleInputChange} className="w-4 h-4 text-[#2872A1] rounded" />
                    <label htmlFor="hasBalcony" className="text-sm font-bold text-gray-700 cursor-pointer">Room has a Balcony / Great View</label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Room Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm resize-none"></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Upload Photo</label>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#CBDDE9]/30 file:text-[#2872A1] hover:file:bg-[#CBDDE9]/50 transition-colors" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Current Status</label>
                      <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold">
                        <option value="Available">🟢 Available</option>
                        <option value="Full">🔴 Full</option>
                        <option value="Under Maintenance">🟠 Maintenance</option>
                      </select>
                    </div>
                    <div className="flex flex-col justify-center">
                      <label className="flex items-center gap-2 cursor-pointer mt-4">
                        <input type="checkbox" name="display" checked={formData.display} onChange={handleInputChange} className="w-5 h-5 text-[#2872A1] rounded" />
                        <span className="text-sm font-bold text-gray-700">Show to Students</span>
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3.5 mt-4 font-bold text-white transition-all bg-[#2872A1] rounded-xl shadow-lg hover:bg-[#1f5a80] hover:-translate-y-0.5">
                    {isEditing ? 'Save Changes' : 'Create Room'}
                  </button>

                </form>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ========================================== */}
      {/* VIEW ROOM & STUDENTS MODAL (LANDSCAPE)     */}
      {/* ========================================== */}
      {isViewModalOpen && viewRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-[#2872A1] text-white">
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <Home className="w-6 h-6" /> Room {viewRoom.roomNumber} Dashboard
              </h2>
              <button onClick={closeViewModal} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Landscape 3-Column Split) */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLUMN 1: Room Details */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-fit">
                  <div className="w-full h-40 bg-gray-200 rounded-xl mb-6 overflow-hidden border border-gray-300">
                    {viewRoom.image ? (
                      <img src={viewRoom.image} alt="Room" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🛏️</div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <span className="text-sm font-bold text-gray-500">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${viewRoom.status === 'Available' ? 'bg-green-100 text-green-700' : viewRoom.status === 'Full' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {viewRoom.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <span className="text-sm font-bold text-gray-500">Occupancy</span>
                      <span className="font-extrabold text-[#2872A1]">{viewRoom.currentOccupancy || 0} / {viewRoom.maxCapacity}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <span className="text-sm font-bold text-gray-500">Monthly Rent</span>
                      <span className="font-bold text-gray-800">Rs. {viewRoom.monthlyRent}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <span className="text-sm font-bold text-gray-500">Key Money</span>
                      <span className="font-bold text-gray-800">Rs. {viewRoom.keyMoney}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-sm font-bold text-gray-500">Type</span>
                      <span className="font-bold text-gray-800">{viewRoom.roomType} ({viewRoom.designatedGender})</span>
                    </div>
                  </div>
                </div>

                {/* COLUMNS 2 & 3: Students Currently Booked */}
                <div className="lg:col-span-2 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                    <Users className="w-6 h-6 text-[#2872A1]" /> 
                    Students Booked in Room {viewRoom.roomNumber}
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
                            {/* Decorative Top Banner */}
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
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBDDE9; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ManageRooms;