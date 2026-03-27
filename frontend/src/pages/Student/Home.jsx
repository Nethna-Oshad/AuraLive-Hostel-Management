import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, BedDouble, Search, Shirt, Utensils, Wrench, 
  ShieldCheck, Wifi, CreditCard, Clock, ArrowRight, Wind, Bath
} from 'lucide-react';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const navigate = useNavigate();
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const roomPhotos = {
    single: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=60",
    double: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=60",
    shared: "https://images.unsplash.com/photo-1555854817-5b2738a91574?auto=format&fit=crop&w=500&q=60",
    default: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=500&q=60"
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/rooms');
        const visibleRooms = response.data.filter(room => room.display === true);
        setRooms(visibleRooms);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Dynamic Search Filter
  const filteredRooms = rooms.filter(room => {
    const searchLower = searchQuery.toLowerCase();
    return (
      room.roomNumber.toLowerCase().includes(searchLower) ||
      room.roomType.toLowerCase().includes(searchLower) ||
      room.designatedGender.toLowerCase().includes(searchLower) ||
      (room.description && room.description.toLowerCase().includes(searchLower))
    );
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Rooms
        const roomRes = await axios.get('http://localhost:5000/api/rooms');
        const visibleRooms = roomRes.data.filter(room => room.display === true);
        setRooms(visibleRooms);

        // Fetch Latest Laundry Order if student is logged in
        if (userInfo?._id && userInfo?.role === 'Student') {
          setOrderLoading(true);
          const orderRes = await axios.get(`http://localhost:5000/api/laundry/student/${userInfo._id}`);
          if (orderRes.data && orderRes.data.length > 0) {
            // Get the most recent order that isn't 'Completed' or 'Cancelled' yet
            const current = orderRes.data.find(o => o.status !== 'Completed' && o.status !== 'Cancelled');
            if (current) setActiveOrder(current);
          }
          setOrderLoading(false);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Status Color Helper
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'Accepted': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Washing': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans overflow-x-hidden">
      
      {/* ========================================== */}
      {/* HERO SECTION */}
      {/* ========================================== */}
      <header className="relative h-[600px] bg-center bg-cover overflow-hidden" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80")' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f]/95 via-[#1f5a80]/80 to-[#2872A1]/70 flex flex-col items-center justify-center text-center px-4">
          
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto">
            {userInfo?.role === 'Student' && (
              <span className="px-5 py-2 rounded-full bg-white/10 border border-white/20 text-[#CBDDE9] text-xs font-extrabold uppercase tracking-[0.2em] mb-8 inline-flex items-center gap-2 backdrop-blur-md shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Welcome back, {userInfo.name.split(' ')[0]}
              </span>
            )}
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl leading-tight">
              Elevate Your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CBDDE9] to-white">Student Living</span>
            </h1>
            <p className="text-lg md:text-2xl text-[#CBDDE9] font-medium mb-12 drop-shadow-md max-w-2xl mx-auto">
              Discover premium, secure, and fully-managed hostel accommodations designed exclusively for university success.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="flex w-full max-w-3xl bg-white/10 backdrop-blur-xl p-2.5 rounded-full shadow-2xl border border-white/20 transition-all hover:bg-white/20"
          >
            <div className="flex items-center pl-6 pr-2 bg-white rounded-l-full flex-1 h-14 md:h-16">
              <Search className="w-6 h-6 text-[#2872A1]" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by room type, gender, or number..." 
                className="w-full text-gray-800 px-4 py-2 outline-none text-base md:text-lg bg-transparent placeholder-gray-400 font-medium" 
              />
            </div>
            <button 
              onClick={() => {
                document.getElementById('rooms-section').scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#2872A1] hover:bg-[#1f5a80] transition-colors text-white px-8 h-14 md:h-16 rounded-r-full font-bold text-base md:text-lg shadow-lg flex items-center gap-2 group"
            >
              Explore <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform hidden md:block" />
            </button>
          </motion.div>
        </div>
      </header>

      {/* ========================================== */}
      {/* WHY CHOOSE US SECTION (NEW) */}
      {/* ========================================== */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-blue-50 text-[#2872A1] rounded-2xl flex items-center justify-center mb-4"><ShieldCheck className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">24/7 Security</h3>
              <p className="text-sm text-gray-500">Secure premises with CCTV and dedicated warden oversight.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><Wifi className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">High-Speed WiFi</h3>
              <p className="text-sm text-gray-500">Uninterrupted connectivity optimized for lectures and assignments.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4"><CreditCard className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Payments</h3>
              <p className="text-sm text-gray-500">Hassle-free digital rent payments via our secure Stripe gateway.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4"><Clock className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fast Maintenance</h3>
              <p className="text-sm text-gray-500">Report room issues online and get them fixed within 24 hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* AVAILABLE ROOMS SECTION */}
      {/* ========================================== */}
      <section id="rooms-section" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        
        <div className="text-center mb-16">
          <span className="text-[#2872A1] font-extrabold uppercase tracking-wider text-sm bg-[#CBDDE9]/30 px-4 py-1.5 rounded-full inline-block mb-3">Our Residences</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Find Your Perfect Space</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Browse our carefully curated selection of student accommodations, filtered to meet your specific needs.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2872A1]"></div>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants} initial="hidden" animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredRooms.length > 0 ? filteredRooms.map((room) => {
              
              const currentOcc = room.currentOccupancy || 0;
              const availableBeds = room.maxCapacity - currentOcc;
              const isFull = availableBeds <= 0 || room.status === 'Full';
              const isMaintenance = room.status === 'Under Maintenance';
              const canBook = !isFull && !isMaintenance;
              const fillPercentage = (currentOcc / room.maxCapacity) * 100;

              return (
                <motion.div key={room._id} variants={itemVariants} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#CBDDE9]/40 transition-all duration-300 border border-gray-100 flex flex-col group">
                  
                  {/* Image Header */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={room.image || (roomPhotos[room.roomType?.toLowerCase()] || roomPhotos.default)} 
                      alt={`Room ${room.roomNumber}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      onError={(e) => { e.target.src = roomPhotos.default; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm flex items-center gap-1 uppercase tracking-wider">
                        <Users className="w-3.5 h-3.5 text-[#2872A1]" /> {room.designatedGender}
                      </span>
                    </div>
                    
                    <div className="absolute bottom-4 left-4">
                      <p className="text-white text-sm font-medium opacity-90 drop-shadow-md">Monthly Rent</p>
                      <p className="text-2xl font-extrabold text-white drop-shadow-lg">Rs. {room.monthlyRent.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-2xl font-extrabold text-gray-900">Room {room.roomNumber}</h3>
                      <span className="text-xs font-bold text-[#2872A1] bg-[#CBDDE9]/30 px-3 py-1 rounded-lg uppercase tracking-wider">
                        {room.roomType}
                      </span>
                    </div>

                    {/* Amenities Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.airConditioning === 'AC' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md uppercase"><Wind className="w-3 h-3" /> A/C</span>
                      )}
                      {room.bathroomType && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded-md uppercase"><Bath className="w-3 h-3" /> {room.bathroomType} Bath</span>
                      )}
                    </div>
                    
                    <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                      {room.description || "A comfortable and spacious room perfect for your stay."}
                    </p>
                    
                    {/* Occupancy Progress */}
                    <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Availability</span>
                        <span className={`text-sm font-extrabold ${isFull ? 'text-red-500' : 'text-[#2872A1]'}`}>
                          {isFull ? 'Room Full' : `${availableBeds} ${availableBeds === 1 ? 'Bed' : 'Beds'} Left`}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-1.5">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${fillPercentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                        <span>{currentOcc} Booked</span>
                        <span>Max {room.maxCapacity}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/book/${room._id}`)} 
                      disabled={!canBook}
                      className={`w-full py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all flex justify-center items-center gap-2 ${
                        canBook 
                          ? 'bg-[#2872A1] hover:bg-[#1f5a80] text-white shadow-lg shadow-[#CBDDE9] hover:shadow-xl active:scale-[0.98]' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      {isMaintenance ? 'Under Maintenance' : isFull ? 'Currently Full' : 'Book This Room'}
                    </button>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-200 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Rooms Found</h3>
                <p className="text-gray-500 max-w-md mx-auto">We couldn't find any rooms matching "{searchQuery}". Try adjusting your search or check back later.</p>
              </div>
            )}
          </motion.div>
        )}
      </section>

      {/* ========================================== */}
      {/* PARTNER SERVICES SECTION */}
      {/* ========================================== */}
      {!userInfo && (
        <section className="bg-white py-20 border-t border-gray-100">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-7xl mx-auto px-6">
            
            <div className="text-center mb-16">
              <span className="text-[#2872A1] font-extrabold uppercase tracking-wider text-sm bg-[#CBDDE9]/30 px-4 py-1.5 rounded-full inline-block mb-3">Partnerships</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Join Our Ecosystem</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">AuraLive isn't just a hostel; it's a complete student ecosystem. Partner with us to provide essential services to our residents.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Laundry */}
              <div className="bg-gray-50 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-cyan-200 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 shadow-inner">
                  <Shirt className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Laundry Services</h3>
                <p className="text-gray-500 mb-8 flex-1 leading-relaxed">Provide scheduled washing, ironing, and direct-to-room delivery services for our busy students.</p>
                <button onClick={() => navigate('/register/laundry')} className="w-full py-4 font-bold text-cyan-700 bg-white border border-cyan-100 hover:bg-cyan-600 hover:text-white rounded-xl transition-all shadow-sm">Become a Partner</button>
              </div>
              
              {/* Food */}
              <div className="bg-gray-50 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-orange-200 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 shadow-inner">
                  <Utensils className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Meal Suppliers</h3>
                <p className="text-gray-500 mb-8 flex-1 leading-relaxed">Supply daily nutritious meals, breakfast packages, and on-demand custom orders to residents.</p>
                <button onClick={() => navigate('/register/meal')} className="w-full py-4 font-bold text-orange-700 bg-white border border-orange-100 hover:bg-orange-600 hover:text-white rounded-xl transition-all shadow-sm">Become a Supplier</button>
              </div>
              
              {/* Maintenance */}
              <div className="bg-gray-50 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-emerald-200 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 shadow-inner">
                  <Wrench className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Maintenance</h3>
                <p className="text-gray-500 mb-8 flex-1 leading-relaxed">Join our certified technical team to resolve plumbing, electrical, and furniture issues promptly.</p>
                <button onClick={() => navigate('/register/maintainer')} className="w-full py-4 font-bold text-emerald-700 bg-white border border-emerald-100 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm">Join Tech Team</button>
              </div>

            </div>
          </motion.div>
        </section>
      )}
      
    </div>
  );
};

export default Home;