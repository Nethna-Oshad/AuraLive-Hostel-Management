import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, CheckSquare, User, Calendar, Phone, ShieldCheck, ArrowLeft, Home as HomeIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingProcess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Auto-fetch user details (Email and Name)
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const [room, setRoom] = useState(null);
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    nicNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    expectedMoveInDate: '',
    specialRequests: ''
  });

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'Student') {
      navigate('/login');
      return;
    }

    const fetchRoom = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/rooms');
        const currentRoom = response.data.find(r => r._id === id);
        if (!currentRoom) navigate('/home');
        setRoom(currentRoom);
        setLoading(false);
      } catch (err) {
        toast.error("Error loading booking details.");
        navigate('/home');
      }
    };
    fetchRoom();
  }, [id, navigate, userInfo]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    
    // Combine all data: Auto-fetched info + Room details + Form data + Agreement
    const bookingPayload = {
      ...formData,
      studentEmail: userInfo.email, // Primary Key identifier
      studentName: userInfo.name,
      roomId: room._id,
      roomNumber: room.roomNumber,  // Saves Room Number directly to DB
      agreedToTerms: agreed
    };

    try {
      // Send to Backend
      const response = await axios.post('http://localhost:5000/api/bookings', bookingPayload);
      
      if (response.status === 201) {
        toast.success('Room successfully reserved!');
        setStep(3); // Move to success screen
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit booking.');
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2872A1]"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header & Progress Bar */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[#2872A1] font-semibold transition-colors mb-6">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#2872A1] rounded-full z-0 transition-all duration-500`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
            
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 ${step >= 1 ? 'bg-[#2872A1] border-[#CBDDE9] text-white' : 'bg-white border-gray-200 text-gray-400'}`}>1</div>
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-colors duration-500 ${step >= 2 ? 'bg-[#2872A1] border-[#CBDDE9] text-white' : 'bg-white border-gray-200 text-gray-400'}`}>2</div>
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-colors duration-500 ${step >= 3 ? 'bg-emerald-500 border-emerald-100 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>3</div>
          </div>
          <div className="flex justify-between text-xs font-bold text-gray-500 mt-2 tracking-wider uppercase">
            <span>Agreement</span>
            <span>Details</span>
            <span>Complete</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* STEP 1: AGREEMENT */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-[#2872A1]" />
                <h2 className="text-3xl font-extrabold text-gray-900">Hostel Agreement</h2>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl h-64 overflow-y-auto border border-gray-200 text-gray-600 text-sm space-y-4 custom-scrollbar mb-8">
                <p><strong>1. Rent & Payments:</strong> Monthly rent of Rs. {room.monthlyRent} is due on the 1st of every month. Key money of Rs. {room.keyMoney} must be paid prior to moving in.</p>
                <p><strong>2. Minimum Stay:</strong> The student agrees to a minimum stay period of 6 months. Breaking this agreement may result in the forfeiture of key money.</p>
                <p><strong>3. Code of Conduct:</strong> No loud music after 10 PM. Visitors are not allowed inside the rooms after 8 PM.</p>
                <p><strong>4. Maintenance:</strong> Students are responsible for keeping their rooms clean. Any damages to the {room.airConditioning} unit or furnishings will be billed to the student.</p>
              </div>

              <div className="flex items-center gap-3 mb-8 p-4 bg-blue-50/50 rounded-xl border border-[#CBDDE9]">
                <input 
                  type="checkbox" 
                  id="agree" 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-6 h-6 text-[#2872A1] rounded border-gray-300 focus:ring-[#2872A1] cursor-pointer"
                />
                <label htmlFor="agree" className="font-semibold text-gray-800 cursor-pointer">
                  I have read and agree to the AuraLive Hostel Terms and Conditions.
                </label>
              </div>

              <button 
                onClick={() => setStep(2)} 
                disabled={!agreed}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all ${agreed ? 'bg-[#2872A1] hover:bg-[#1f5a80] shadow-lg shadow-[#CBDDE9]' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Proceed to Booking Details
              </button>
            </motion.div>
          )}

          {/* STEP 2: FILLING FORM */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 md:p-12 flex flex-col md:flex-row gap-10">
              
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Student Information</h2>
                
                {/* Auto-Fetched Info display (Read Only) */}
                <div className="bg-[#CBDDE9]/20 p-4 rounded-xl border border-[#CBDDE9]/50 mb-6 flex gap-4 text-sm">
                  <div>
                    <span className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Logged in as</span>
                    <strong className="text-[#2872A1]">{userInfo.name}</strong>
                  </div>
                  <div className="pl-4 border-l border-[#CBDDE9]">
                    <span className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Email ID</span>
                    <strong className="text-gray-800">{userInfo.email}</strong>
                  </div>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">NIC Number / Passport *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input type="text" name="nicNumber" required value={formData.nicNumber} onChange={handleInputChange} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] outline-none" placeholder="e.g. 200112345678" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Emergency Contact Name *</label>
                      <input type="text" name="emergencyContactName" required value={formData.emergencyContactName} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] outline-none" placeholder="Guardian Name" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Emergency Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input type="text" name="emergencyContactPhone" required value={formData.emergencyContactPhone} onChange={handleInputChange} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] outline-none" placeholder="07X XXX XXXX" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Expected Move-in Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input type="date" name="expectedMoveInDate" required value={formData.expectedMoveInDate} onChange={handleInputChange} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Special Requests (Optional)</label>
                    <textarea name="specialRequests" value={formData.specialRequests} onChange={handleInputChange} rows="3" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2872A1] outline-none resize-none" placeholder="Any medical conditions or specific requirements?"></textarea>
                  </div>

                  <button type="submit" className="w-full py-4 mt-4 rounded-xl font-bold text-white text-lg transition-all bg-[#2872A1] hover:bg-[#1f5a80] shadow-lg shadow-[#CBDDE9] hover:-translate-y-0.5">
                    Confirm & Submit Booking
                  </button>
                </form>
              </div>

              {/* Order Summary Side */}
              <div className="md:w-1/3 bg-gray-50 p-6 rounded-2xl border border-gray-200 h-max">
                <h3 className="font-bold text-gray-900 mb-4">Booking Summary</h3>
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                    {room.image && <img src={room.image} alt="Room" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Room {room.roomNumber}</p>
                    <p className="text-xs text-gray-500">{room.roomType} • {room.designatedGender}</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Monthly Rent</span><span className="font-bold text-gray-800">Rs. {room.monthlyRent}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Key Money (Deposit)</span><span className="font-bold text-gray-800">Rs. {room.keyMoney}</span></div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                  <ShieldCheck className="w-4 h-4" /> No payment required right now.
                </div>
              </div>

            </motion.div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-12 text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckSquare className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Booking Submitted!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your request for <strong className="text-gray-900">Room {room.roomNumber}</strong> has been sent to the admin. You can track your booking status in your student dashboard.
              </p>
              <button onClick={() => navigate('/home')} className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto">
                <HomeIcon className="w-5 h-5" /> Return to Home
              </button>
            </motion.div>
          )}

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

export default BookingProcess;