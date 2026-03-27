import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const initialForm = {
  roomNumber: '', floorLevel: 'Ground', roomType: 'Single', designatedGender: 'Neutral',
  airConditioning: 'Non-AC', bathroomType: 'Common', furnishing: [], hasBalcony: false,
  monthlyRent: '', keyMoney: '', maxCapacity: '1', description: '', status: 'Available', display: true
};

const amenitiesList = ['Bed', 'Study Desk', 'Chair', 'Wardrobe', 'Ceiling Fan', 'Mini Fridge'];

const RoomForm = ({ roomToEdit, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  
  const isEditing = !!roomToEdit;

  useEffect(() => {
    if (roomToEdit) {
      setFormData({
        roomNumber: roomToEdit.roomNumber, floorLevel: roomToEdit.floorLevel, roomType: roomToEdit.roomType, designatedGender: roomToEdit.designatedGender,
        airConditioning: roomToEdit.airConditioning, bathroomType: roomToEdit.bathroomType, furnishing: roomToEdit.furnishing || [],
        hasBalcony: roomToEdit.hasBalcony, monthlyRent: roomToEdit.monthlyRent, keyMoney: roomToEdit.keyMoney, maxCapacity: roomToEdit.maxCapacity,
        description: roomToEdit.description, status: roomToEdit.status, display: roomToEdit.display
      });
      setImageFile(null);
    } else {
      setFormData(initialForm);
    }
  }, [roomToEdit]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    let updatedFormData = { ...formData, [name]: newValue };
    
    if (name === 'roomType') {
      if (newValue === 'Single') updatedFormData.maxCapacity = '1';
      if (newValue === 'Double') updatedFormData.maxCapacity = '2';
      if (newValue === 'Triple') updatedFormData.maxCapacity = '3';
      if (newValue === 'Shared Dorm' && Number(formData.maxCapacity) < 4) {
        updatedFormData.maxCapacity = '4'; 
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { roomNumber, monthlyRent, keyMoney, maxCapacity, roomType } = formData;
    if (!roomNumber.trim()) return toast.error("Room Number cannot be empty.");
    // Validation: Room Number must be digits only
    if (!/^\d+$/.test(roomNumber)) return toast.error("Room Number must contain numbers only.");

    // Validation: Monthly Rent and Key Money must be at least 1
    if (Number(monthlyRent) < 1) return toast.error("Monthly Rent must be at least Rs. 1.");
    if (Number(keyMoney) < 1) return toast.error("Key Money must be at least Rs. 1.");

    if (formData.description.length > 500) return toast.error("Description is too long (max 500 chars).");
    
    // Suggested Validation: Image file size check (max 2MB)
    if (imageFile && imageFile.size > 2 * 1024 * 1024) {
      return toast.error("Image size must be less than 2MB.");
    }

    const capacity = Number(maxCapacity);
    if (roomType === 'Single' && capacity !== 1) return toast.error("Single rooms must have exactly 1 capacity.");
    if (roomType === 'Double' && capacity !== 2) return toast.error("Double rooms must have exactly 2 capacity.");
    if (roomType === 'Triple' && capacity !== 3) return toast.error("Triple rooms must have exactly 3 capacity.");
    if (roomType === 'Shared Dorm' && capacity < 4) return toast.error("Shared Dorms must have a capacity of 4 or more.");

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'furnishing') submitData.append(key, JSON.stringify(formData[key])); 
      else submitData.append(key, formData[key]);
    });
    if (imageFile) submitData.append('image', imageFile);

    const url = isEditing ? `http://localhost:5000/api/rooms/${roomToEdit._id}` : 'http://localhost:5000/api/rooms';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: submitData });
      if (res.ok) {
        toast.success(isEditing ? 'Room updated successfully!' : 'New room created perfectly!');
        setFormData(initialForm);
        setImageFile(null);
        e.target.reset(); 
        onSuccess(); // Tells ManageRooms to refresh the table
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to save room.");
      }
    } catch (err) { 
      toast.error("Server error. Please try again.");
    }
  };

  const isCapacityLocked = ['Single', 'Double', 'Triple'].includes(formData.roomType);

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-[#CBDDE9]/30 border border-[#CBDDE9]/50 p-6 sticky top-6">
      <h3 className="text-xl font-bold text-[#2872A1] mb-6 flex items-center gap-2">
        {isEditing ? '✏️ Edit Room Details' : '✨ Add New Room'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Room Number *</label>
            <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleInputChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2872A1] outline-none text-sm" placeholder="e.g. 101" />
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
              <input type="number" min="1" name="monthlyRent" value={formData.monthlyRent} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-200 rounded-lg outline-none text-sm bg-white focus:ring-2 focus:ring-[#2872A1]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2872A1] mb-1">Key Money (Rs) *</label>
              <input type="number" min="1" name="keyMoney" value={formData.keyMoney} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-200 rounded-lg outline-none text-sm bg-white focus:ring-2 focus:ring-[#2872A1]" />
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
  );
};

export default RoomForm;