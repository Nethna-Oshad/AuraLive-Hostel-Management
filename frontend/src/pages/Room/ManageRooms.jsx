import React, { useState, useEffect } from 'react';
import AdminSidebar from '../Admin/AdminSidebar';
import AdminNavbar from '../Admin/AdminNavbar';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Form State
  const initialForm = {
    roomNumber: '', floorLevel: 'Ground', roomType: 'Single', designatedGender: 'Neutral',
    airConditioning: 'Non-AC', bathroomType: 'Common', furnishing: [], hasBalcony: false,
    monthlyRent: '', keyMoney: '', maxCapacity: '1', description: '', status: 'Available', display: true
  };
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);

  // Available Amenities
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
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
    setImageFile(null); // Reset image input when editing
  };

  const deleteRoom = async (id) => {
    if(!window.confirm("Are you sure you want to delete this room?")) return;
    await fetch(`http://localhost:5000/api/rooms/${id}`, { method: 'DELETE' });
    fetchRooms();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Because we have an image file, we MUST use FormData instead of standard JSON
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'furnishing') {
        submitData.append(key, JSON.stringify(formData[key])); // Array must be stringified for FormData
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
        fetchRooms();
        setFormData(initialForm);
        setImageFile(null);
        setIsEditing(false);
        setEditId(null);
        e.target.reset(); // Clear file input
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-8">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Hostel Room Management</h2>
            {isEditing && (
              <button onClick={() => { setIsEditing(false); setFormData(initialForm); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold transition-colors">
                Cancel Edit Mode
              </button>
            )}
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            
            {/* LEFT COLUMN: ROOM LIST */}
            <div className="w-full xl:w-2/3 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-[#CBDDE9]/50 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#2872A1] text-[#CBDDE9] text-sm tracking-wide">
                      <th className="p-4 font-semibold">Room</th>
                      <th className="p-4 font-semibold">Type & Gender</th>
                      <th className="p-4 font-semibold">Pricing</th>
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
                          <p className="font-bold text-gray-800">Rs. {room.monthlyRent}<span className="text-xs font-normal text-gray-500">/mo</span></p>
                          <p className="text-xs text-gray-500">Key: Rs. {room.keyMoney}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${room.status === 'Available' ? 'bg-green-100 text-green-700' : room.status === 'Full' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                            {room.status}
                          </span>
                          {!room.display && <span className="block mt-1 text-[10px] text-gray-400 font-bold uppercase">Hidden</span>}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => editRoom(room)} className="px-3 py-1.5 bg-[#CBDDE9]/40 text-[#2872A1] hover:bg-[#CBDDE9] rounded-lg font-semibold transition-colors">Edit</button>
                          <button onClick={() => deleteRoom(room._id)} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-colors">Delete</button>
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

            {/* RIGHT COLUMN: ADD/EDIT FORM */}
            <div className="w-full xl:w-1/3">
              <div className="bg-white rounded-2xl shadow-xl shadow-[#CBDDE9]/30 border border-[#CBDDE9]/50 p-6 sticky top-6">
                <h3 className="text-xl font-bold text-[#2872A1] mb-6 flex items-center gap-2">
                  {isEditing ? '✏️ Edit Room Details' : '✨ Add New Room'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                  
                  {/* Basic Info */}
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

                  {/* Pricing */}
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-[#CBDDE9]/50 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#2872A1] mb-1">Monthly Rent (Rs) *</label>
                        <input type="number" name="monthlyRent" value={formData.monthlyRent} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-200 rounded-lg outline-none text-sm" placeholder="e.g. 25000" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#2872A1] mb-1">Key Money (Rs) *</label>
                        <input type="number" name="keyMoney" value={formData.keyMoney} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-200 rounded-lg outline-none text-sm" placeholder="e.g. 50000" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2872A1] mb-1">Max Student Capacity *</label>
                      <input type="number" name="maxCapacity" value={formData.maxCapacity} onChange={handleInputChange} required min="1" className="w-full p-2.5 border border-gray-200 rounded-lg outline-none text-sm" />
                    </div>
                  </div>

                  {/* Amenities */}
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

                  {/* Visuals & Status */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Room Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm resize-none" placeholder="Quiet corner room, perfect for studying..."></textarea>
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
      {/* Small custom style for scrollbar inside the form */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBDDE9; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ManageRooms;