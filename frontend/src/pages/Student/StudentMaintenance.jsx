import React, { useState, useEffect } from 'react';
import { Upload, Wrench, AlertCircle, CheckCircle, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const StudentMaintenance = () => {
  const navigate = useNavigate();

  // Get student info from LocalStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || { _id: '', email: '' };

  const [formData, setFormData] = useState({
    roomNumber: '',
    issueType: 'Plumbing',
    description: '',
    priority: 'Medium'
  });
  
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingRoom, setFetchingRoom] = useState(true);

  // ==========================================
  // NEW: AUTO-FETCH ROOM NUMBER
  // ==========================================
  useEffect(() => {
    const fetchRoomNumber = async () => {
      if (!userInfo.email) {
        setFetchingRoom(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/${userInfo.email}`);
        if (response.ok) {
          const data = await response.json();
          // Extract the room number (handles both old response style and new {booking, roommates} style)
          const bookingInfo = data.booking || data; 
          
          if (bookingInfo && bookingInfo.roomNumber) {
            setFormData(prev => ({ ...prev, roomNumber: bookingInfo.roomNumber }));
          }
        }
      } catch (error) {
        console.error("Could not fetch room number:", error);
      } finally {
        setFetchingRoom(false);
      }
    };

    fetchRoomNumber();
  }, [userInfo.email]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.roomNumber) {
      toast.error("Room number is required!");
      return;
    }

    // ==========================================
    // NEW: 10-WORD MINIMUM VALIDATION
    // ==========================================
    // Remove extra spaces and split by space to count words accurately
    const wordCount = formData.description.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    if (wordCount < 10) {
      toast.error(`Please provide more details. You need at least 10 words (Currently: ${wordCount}).`);
      return;
    }

    setLoading(true);

    const submitData = new FormData();
    submitData.append('studentId', userInfo._id); 
    submitData.append('roomNumber', formData.roomNumber);
    submitData.append('issueType', formData.issueType);
    submitData.append('description', formData.description);
    submitData.append('priority', formData.priority);
    if (photo) {
      submitData.append('photo', photo);
    }

    try {
      const response = await fetch('http://localhost:5000/api/maintenance/create', {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        toast.success("Maintenance request submitted successfully!");
        setFormData(prev => ({ ...prev, issueType: 'Plumbing', description: '', priority: 'Medium' }));
        removePhoto();

        // Redirect student to home page after successful submission.
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit request.");
      }
    } catch {
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to count words for the live UI counter
  const currentWordCount = formData.description.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#CBDDE9] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Wrench className="w-8 h-8 text-[#2872A1]" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Report a Maintenance Issue</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Fast & reliable fixes for your room. Submit your request below.
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Number (Auto-fetched & Locked) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Room Number *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    placeholder={fetchingRoom ? "Fetching room..." : "e.g. A-102"}
                    readOnly={!!formData.roomNumber} // Locks the input if we found their room!
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 outline-none transition-all ${
                      formData.roomNumber 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed font-bold' // Styling for locked state
                        : 'bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2872A1]'
                    }`}
                    required
                  />
                  {formData.roomNumber && !fetchingRoom && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                  )}
                </div>
                {formData.roomNumber && (
                  <p className="text-[10px] font-bold text-[#2872A1] mt-1 uppercase tracking-wider">
                    Auto-detected from your booking
                  </p>
                )}
              </div>

              {/* Issue Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Issue Category *</label>
                <select
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2872A1] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white cursor-pointer"
                >
                  <option value="Plumbing">Plumbing (Leaks, Taps, Pipes)</option>
                  <option value="Electrical">Electrical (Lights, Fans, Plugs)</option>
                  <option value="Furniture">Furniture (Beds, Chairs, Tables)</option>
                  <option value="Cleaning">Cleaning & Janitorial</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Priority Level */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Priority Level</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                  <label 
                    key={level} 
                    className={`flex items-center justify-center px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      formData.priority === level 
                        ? 'border-[#2872A1] bg-[#2872A1]/10 text-[#2872A1] font-bold shadow-sm' 
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={level}
                      checked={formData.priority === level}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {level === 'Critical' && <AlertCircle className="w-4 h-4 mr-1.5 text-red-500" />}
                    {level}
                  </label>
                ))}
              </div>
            </div>

            {/* Description with Word Counter */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-bold text-gray-700">Describe the Issue *</label>
                <span className={`text-xs font-bold ${currentWordCount >= 10 ? 'text-emerald-500' : 'text-orange-500'}`}>
                  {currentWordCount} / 10 words min
                </span>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Please describe exactly what is broken, where it is located, and how long it has been an issue..."
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none ${
                  formData.description.length > 0 && currentWordCount < 10
                    ? 'border-orange-300 bg-orange-50 focus:ring-2 focus:ring-orange-400' 
                    : 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2872A1]'
                }`}
                required
              ></textarea>
              {formData.description.length > 0 && currentWordCount < 10 && (
                <p className="text-xs text-orange-600 font-medium mt-1">
                  Please add {10 - currentWordCount} more words to help our technicians understand the problem.
                </p>
              )}
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Upload a Photo (Optional)</label>
              
              {!preview ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#2872A1] transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#2872A1] mb-2 transition-colors" />
                    <p className="text-sm text-gray-500 font-medium"><span className="text-[#2872A1] font-bold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG or JPEG (MAX. 5MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </label>
              ) : (
                <div className="relative w-full md:w-1/2 h-48 rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={removePhoto}
                      className="bg-white text-red-500 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" /> Remove Photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2872A1] text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-[#2872A1]/30 hover:bg-[#1f5a80] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" /> Submit Request
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentMaintenance;