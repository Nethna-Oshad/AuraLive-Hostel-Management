import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shirt, Upload, Calendar, X, CheckCircle, ChevronRight, 
  ArrowLeft, Star, Zap, Scale, Info, ShoppingBag 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const StudentLaundry = () => {
  // Get logged-in student info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || { _id: 'dummy_id' };

  // --- STEP 1 STATE (Details & Items) ---
  const [weight, setWeight] = useState(3); // Default to 3kg
  const [expectedDate, setExpectedDate] = useState('');
  const [serviceType, setServiceType] = useState('Wash & Fold');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loadingEstimates, setLoadingEstimates] = useState(false);

  // --- STEP 2 STATE (Partner Selection) ---
  const [step, setStep] = useState(1);
  const [orderSummary, setOrderSummary] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Constants
  const today = new Date().toISOString().split('T')[0];
  const weightPresets = [1, 3, 5, 8, 10, 15];

  // Handle Photo Preview
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // STEP 1: Request Prices from Backend
  const handleGetEstimates = async (e) => {
    e.preventDefault();
    if (!weight || !expectedDate) {
      toast.error("Please provide weight and return date.");
      return;
    }

    setLoadingEstimates(true);
    try {
      const response = await fetch('http://localhost:5000/api/laundry/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weightInKg: weight, expectedDate, serviceType }),
      });

      const data = await response.json();
      if (response.ok) {
        setOrderSummary(data);
        if (data.availablePartners.length === 0) {
          toast.error("No partners available for this date.");
        } else {
          setStep(2);
        }
      } else {
        toast.error(data.message || "Error fetching prices.");
      }
    } catch (error) {
      toast.error("Server connection failed.");
    } finally {
      setLoadingEstimates(false);
    }
  };

  // STEP 2: Submit Final Order
  const handleSubmitOrder = async () => {
    if (!selectedPartner) {
      toast.error("Please select a laundry partner.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('studentId', userInfo._id);
    formData.append('weightInKg', weight);
    formData.append('expectedDate', expectedDate);
    formData.append('serviceType', serviceType);
    formData.append('assignedPartner', selectedPartner.partnerId);
    formData.append('finalPrice', selectedPartner.estimatedTotal);
    
    // ✅ FIX: Mark order as premium if the selected partner is premium
    // Meka database ekata giyama thamai Dashboard eke notification eka highlight wenne
    formData.append('isPremiumOrder', selectedPartner.isPremium === true); 
    
    if (photo) formData.append('photo', photo);

    try {
      const response = await fetch('http://localhost:5000/api/laundry/create', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success("Order Placed Successfully! 🧺");
        setTimeout(() => window.location.reload(), 2000); // Reload to reset
      } else {
        toast.error("Failed to place order.");
      }
    } catch (error) {
      toast.error("Server error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans">
      <Toaster position="top-center" />
      
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="flex items-center justify-center mb-10 space-x-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-[#2872A1] text-white' : 'bg-gray-200'}`}>1</div>
          <div className={`h-1 w-20 rounded ${step === 2 ? 'bg-[#2872A1]' : 'bg-gray-200'}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-[#2872A1] text-white' : 'bg-gray-200'}`}>2</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area (Left 2 Columns) */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
                >
                  <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                    <ShoppingBag className="text-[#2872A1]" /> Laundry Details
                  </h2>

                  {/* Selectable Weight Presets */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <Scale className="w-4 h-4" /> Estimated Weight (KG)
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {weightPresets.map((val) => (
                        <button
                          key={val} type="button" onClick={() => setWeight(val)}
                          className={`py-3 rounded-2xl font-bold transition-all border-2 ${weight === val ? 'bg-[#2872A1] border-[#2872A1] text-white shadow-lg shadow-[#2872A1]/30' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-[#2872A1]/50'}`}
                        >
                          {val}kg
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Return Date */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Collection Date
                      </label>
                      <input
                        type="date" min={today} value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#2872A1] outline-none font-bold"
                        required
                      />
                    </div>

                    {/* Service Type */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Shirt className="w-4 h-4" /> Service Type
                      </label>
                      <select 
                        value={serviceType} onChange={(e) => setServiceType(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#2872A1] outline-none font-bold cursor-pointer"
                      >
                        <option>Wash & Fold</option>
                        <option>Wash & Iron</option>
                        <option>Dry Clean Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Photo Upload Section */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Bag Preview (Optional)</label>
                    {!preview ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all group">
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#2872A1] mb-2" />
                        <span className="text-sm font-bold text-gray-400">Click to Snap a Photo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                      </label>
                    ) : (
                      <div className="relative rounded-3xl overflow-hidden h-40 border-2 border-[#2872A1]/20">
                        <img src={preview} alt="Bag" className="w-full h-full object-cover" />
                        <button onClick={() => {setPhoto(null); setPreview(null)}} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleGetEstimates} disabled={loadingEstimates}
                    className="w-full bg-[#2872A1] text-white font-black text-lg py-4 rounded-2xl hover:bg-[#1b4d6d] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#2872A1]/20"
                  >
                    {loadingEstimates ? "Checking availability..." : <>Get Instant Quotes <ChevronRight /></>}
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="partners" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setStep(1)} className="flex items-center gap-2 font-bold text-gray-500 hover:text-[#2872A1] transition-colors">
                      <ArrowLeft className="w-5 h-5" /> Change Details
                    </button>
                    <span className="bg-blue-100 text-[#2872A1] px-4 py-1 rounded-full font-bold text-xs uppercase">Available Options</span>
                  </div>

                  {orderSummary.availablePartners.map((partner) => (
                    <div 
                      key={partner.partnerId} onClick={() => setSelectedPartner(partner)}
                      className={`p-6 rounded-3xl border-2 transition-all cursor-pointer bg-white flex justify-between items-center ${selectedPartner?.partnerId === partner.partnerId ? 'border-[#2872A1] shadow-2xl ring-4 ring-[#2872A1]/5' : 'border-gray-100 hover:border-blue-200 shadow-sm'}`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${partner.isPremium ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
                          {partner.isPremium ? <Star className="fill-current" /> : <CheckCircle />}
                        </div>
                        <div>
                          <h4 className="font-black text-xl text-gray-800">{partner.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {partner.isPremium && <span className="text-[10px] font-black uppercase tracking-tighter bg-yellow-400 text-white px-2 py-0.5 rounded">Premium</span>}
                            <span className="text-sm text-gray-400 font-bold">Base: Rs. {partner.basePricePerKg}/kg</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-[#2872A1]">Rs. {partner.estimatedTotal}</p>
                        <p className="text-xs text-emerald-500 font-bold">Includes Service</p>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleSubmitOrder} disabled={submitting || !selectedPartner}
                    className="w-full mt-6 bg-[#2872A1] text-white font-black text-lg py-5 rounded-3xl shadow-2xl shadow-[#2872A1]/40 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {submitting ? "Booking..." : "Confirm & Send Request 🧺"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SIDEBAR: Order Summary Card (Visible on all steps) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-8">
              <h3 className="font-black text-lg text-gray-800 border-b pb-4 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#2872A1]" /> Order Summary
              </h3>
              
              <div className="space-y-4 text-sm font-bold text-gray-500">
                <div className="flex justify-between"><span>Weight:</span> <span className="text-gray-900">{weight} KG</span></div>
                <div className="flex justify-between"><span>Return by:</span> <span className="text-gray-900">{expectedDate || 'Not set'}</span></div>
                <div className="flex justify-between"><span>Service:</span> <span className="text-gray-900">{serviceType}</span></div>
                
                {orderSummary?.isUrgent && (
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-xl flex gap-2 items-center">
                    <Zap className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] leading-tight">Express Delivery Fee Applied.</span>
                  </div>
                )}
              </div>

              {selectedPartner && (
                <div className="mt-6 pt-6 border-t border-dashed">
                  <p className="text-xs text-gray-400 mb-1">Total Payable</p>
                  <p className="text-4xl font-black text-[#2872A1]">Rs. {selectedPartner.estimatedTotal}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentLaundry;