import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, BedDouble, Search, Shirt, Utensils, Wrench, 
  ShieldCheck, Wifi, CreditCard, Clock, ArrowRight, Wind, Bath, Loader2
} from 'lucide-react';

// IMPORT YOUR NEW REVIEWS COMPONENT
import Reviews from '../../components/Reviews';

// SLIDER IMAGES (Online Sample Photos)
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1555854817-5b2738a91574?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80"
];

const CAMPUS_GALLERY = [
  {
    title: "Modern Study Corners",
    type: "Academic",
    image: "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Comfortable Bedrooms",
    type: "Accommodation",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Fresh Meal Stations",
    type: "Dining",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Laundry Pickup Area",
    type: "Services",
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Safe Shared Lounges",
    type: "Community",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Maintenance Support",
    type: "Reliability",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"
  }
];

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Image Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Laundry Tracking State
  const [activeOrder, setActiveOrder] = useState(null);
  
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const roomPhotos = {
    single: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=60",
    double: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=60",
    shared: "https://images.unsplash.com/photo-1555854817-5b2738a91574?auto=format&fit=crop&w=500&q=60",
    default: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=500&q=60"
  };

  // Image Slider Timer (Changes every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomRes = await axios.get('http://localhost:5000/api/rooms');
        const visibleRooms = roomRes.data.filter(room => room.display === true);
        setRooms(visibleRooms);

        if (userInfo?._id && userInfo?.role === 'Student') {
          const orderRes = await axios.get(`http://localhost:5000/api/laundry/student/${userInfo._id}`);
          if (orderRes.data && orderRes.data.length > 0) {
            const current = orderRes.data.find(o => o.status !== 'Completed' && o.status !== 'Cancelled');
            if (current) setActiveOrder(current);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [userInfo?._id, userInfo?.role]);

  const filteredRooms = rooms.filter(room => {
    const searchLower = searchQuery.toLowerCase();
    return (
      room.roomNumber.toLowerCase().includes(searchLower) ||
      room.roomType.toLowerCase().includes(searchLower) ||
      room.designatedGender.toLowerCase().includes(searchLower) ||
      (room.description && room.description.toLowerCase().includes(searchLower))
    );
  });

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } } };

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
    <div className="min-h-screen bg-gradient-to-b from-[#f7fbff] via-[#f1f7fc] to-[#e9f2f9] font-sans overflow-x-hidden">
      
      {/* HERO SECTION WITH IMAGE SLIDER */}
      <header className="relative h-[600px] bg-black overflow-hidden">
        
        <AnimatePresence mode="popLayout">
          <motion.img 
            key={currentSlide}
            src={HERO_IMAGES[currentSlide]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full object-cover"
            alt="Hostel Background"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f]/95 via-[#1f5a80]/80 to-[#2872A1]/70 flex flex-col items-center justify-center text-center px-4 z-10">
          
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
              onClick={() => document.getElementById('rooms-section').scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#2872A1] hover:bg-[#1f5a80] transition-colors text-white px-8 h-14 md:h-16 rounded-r-full font-bold text-base md:text-lg shadow-lg flex items-center gap-2 group"
            >
              Explore <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform hidden md:block" />
            </button>
          </motion.div>

          {/* Slider Dots */}
          <div className="absolute bottom-8 flex gap-3">
            {HERO_IMAGES.map((_, idx) => (
              <div key={idx} onClick={() => setCurrentSlide(idx)} className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${currentSlide === idx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`} />
            ))}
          </div>
        </div>
      </header>

      {/* SMART DASHBOARD */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        {userInfo?.role === 'Student' ? (
          <div className="mb-16 space-y-6">
            <AnimatePresence>
              {activeOrder && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-2xl shadow-[#CBDDE9]/40 p-1 overflow-hidden border border-[#CBDDE9]/50"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6 p-6">
                    <div className="w-20 h-20 bg-[#CBDDE9]/30 rounded-2xl flex items-center justify-center text-[#2872A1] shrink-0">
                      <Clock className={`w-10 h-10 ${activeOrder.status === 'Washing' ? 'animate-spin-slow' : 'animate-pulse'}`} />
                    </div>
                    
                    <div className="flex-grow text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Active Laundry Order</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusStyle(activeOrder.status)}`}>
                          {activeOrder.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm font-medium">
                        Your <span className="text-gray-900 font-bold">{activeOrder.weightInKg}Kg</span> bag is being processed by <span className="text-[#2872A1] font-bold">{activeOrder.assignedPartner?.name || 'our partner'}</span>.
                      </p>
                    </div>

                    <button 
                      onClick={() => navigate('/student/my-orders')}
                      className="px-6 py-3.5 bg-[#2872A1] text-white rounded-xl font-bold text-sm hover:bg-[#1f5a80] transition-all flex items-center gap-2 shadow-lg hover:-translate-y-0.5 shrink-0"
                    >
                      Track Live <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="h-1.5 w-full bg-gray-100 flex">
                    <div 
                      className="h-full bg-[#2872A1] transition-all duration-1000" 
                      style={{ 
                        width: activeOrder.status === 'Pending' ? '25%' : 
                               activeOrder.status === 'Accepted' ? '50%' : 
                               activeOrder.status === 'Washing' ? '75%' : '100%' 
                      }} 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div onClick={() => navigate('/student/laundry')} className="bg-white p-6 rounded-3xl shadow-xl border-l-8 border-[#2872A1] flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-[#CBDDE9]/40 rounded-2xl flex items-center justify-center text-[#2872A1] group-hover:bg-[#2872A1] group-hover:text-white transition-colors"><Shirt className="w-8 h-8" /></div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900">Request Laundry</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">Wash, Dry & Iron services at your door</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-[#2872A1] group-hover:translate-x-2 transition-all" />
              </div>

              <div onClick={() => navigate('/student/maintenance')} className="bg-white p-6 rounded-3xl shadow-xl border-l-8 border-orange-400 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors"><Wrench className="w-8 h-8" /></div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900">Repair Request</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">Report room issues to our technicians</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-2 transition-all" />
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {[
              { icon: ShieldCheck, title: "24/7 Security", desc: "CCTV & Warden", color: "blue" },
              { icon: Wifi, title: "Fast WiFi", desc: "Optimized for study", color: "emerald" },
              { icon: CreditCard, title: "Smart Pay", desc: "Easy online rent", color: "purple" },
              { icon: Clock, title: "Fast Fixes", desc: "24hr maintenance", color: "orange" }
            ].map((feature, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * idx }} className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                <div className={`w-14 h-14 bg-${feature.color}-50 text-${feature.color}-500 rounded-2xl flex items-center justify-center mb-4`}><feature.icon className="w-7 h-7" /></div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500 font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* AVAILABLE ROOMS SECTION */}
      <section id="rooms-section" className="max-w-7xl mx-auto px-6 pb-14 relative z-10">
        <div className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-xl shadow-[#CBDDE9]/30 p-8 md:p-12 mb-16 border border-[#CBDDE9]/50">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#2872A1] mb-4">Available Accommodations</h2>
            <p className="text-gray-500 text-lg font-medium">Browse available rooms and book your stay instantly.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin h-16 w-16 text-[#2872A1]" /></div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.length > 0 ? filteredRooms.map((room) => {
                const currentOcc = room.currentOccupancy || 0;
                const availableBeds = room.maxCapacity - currentOcc;
                const isFull = availableBeds <= 0 || room.status === 'Full';
                const isMaintenance = room.status === 'Under Maintenance';
                const canBook = !isFull && !isMaintenance;
                const fillPercentage = (currentOcc / room.maxCapacity) * 100;

                return (
                  <motion.div key={room._id} variants={itemVariants} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#CBDDE9]/40 transition-all duration-300 border border-gray-100 flex flex-col group">
                    <div className="relative h-64 overflow-hidden">
                      <img src={room.image || (roomPhotos[room.roomType?.toLowerCase()] || roomPhotos.default)} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.target.src = roomPhotos.default; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm flex items-center gap-1 uppercase tracking-wider"><Users className="w-3.5 h-3.5 text-[#2872A1]" /> {room.designatedGender}</span>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <p className="text-white text-sm font-medium opacity-90 drop-shadow-md">Monthly Rent</p>
                        <p className="text-2xl font-extrabold text-white drop-shadow-lg">Rs. {room.monthlyRent.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-extrabold text-gray-900">Room {room.roomNumber}</h3>
                        <span className="text-xs font-bold text-[#2872A1] bg-[#CBDDE9]/30 px-3 py-1 rounded-lg uppercase tracking-wider">{room.roomType}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {room.airConditioning === 'AC' && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md uppercase"><Wind className="w-3 h-3" /> A/C</span>}
                        {room.bathroomType && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded-md uppercase"><Bath className="w-3 h-3" /> {room.bathroomType} Bath</span>}
                      </div>
                      
                      <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">{room.description || "A comfortable and spacious room perfect for your stay."}</p>
                      
                      <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Availability</span>
                          <span className={`text-sm font-extrabold ${isFull ? 'text-red-500' : 'text-[#2872A1]'}`}>{isFull ? 'Room Full' : `${availableBeds} ${availableBeds === 1 ? 'Bed' : 'Beds'} Left`}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-1.5"><div className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${fillPercentage}%` }}></div></div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase"><span>{currentOcc} Booked</span><span>Max {room.maxCapacity}</span></div>
                      </div>

                      <button onClick={() => navigate(`/book/${room._id}`)} disabled={!canBook} className={`w-full py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all flex justify-center items-center gap-2 ${canBook ? 'bg-[#2872A1] hover:bg-[#1f5a80] text-white shadow-lg shadow-[#CBDDE9] hover:shadow-xl active:scale-[0.98]' : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}>
                        {isMaintenance ? 'Under Maintenance' : isFull ? 'Currently Full' : 'Book This Room'}
                      </button>
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="col-span-full py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-10 h-10 text-gray-300" /></div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Rooms Found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">We couldn't find any rooms matching "{searchQuery}". Try adjusting your search or check back later.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* CAMPUS LIFE GALLERY */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-[2rem] p-8 md:p-10 bg-gradient-to-br from-[#0f2940] via-[#1f5a80] to-[#2b7eb4] shadow-2xl shadow-[#1f5a80]/25 border border-white/10 overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#ffffff_0,transparent_35%),radial-gradient(circle_at_80%_0%,#ffffff_0,transparent_35%)]"></div>
          <div className="relative">
            <div className="mb-8 md:mb-10 text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-[0.2em] mb-3">Campus Life</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Different Spaces, One Home</h2>
              <p className="text-[#d9ebf7] text-sm md:text-base">Explore our student spaces: rooms, services, food, and community areas.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CAMPUS_GALLERY.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.06 }}
                  className="group rounded-2xl overflow-hidden bg-white/10 border border-white/20 backdrop-blur-sm"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute left-4 bottom-4">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#cce6f7]">{item.type}</p>
                      <h3 className="text-white font-bold text-lg leading-tight">{item.title}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* REVIEWS SECTION ADDED HERE */}
      {/* ========================================== */}
      <section className="relative py-14 md:py-20 bg-gradient-to-b from-[#edf5fb] via-[#f7fbff] to-[#edf5fb] border-y border-[#d9e8f3]">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(#c7ddeb_1.2px,transparent_1.2px)] [background-size:18px_18px]"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <Reviews />
        </div>
      </section>

      {/* ========================================== */}
      {/* PARTNER SERVICES SECTION (Only for logged out users) */}
      {/* ========================================== */}
      {!userInfo && (
        <section className="bg-gradient-to-b from-[#f7fbff] to-[#e8f2fa] py-20 border-t border-[#d9e8f3]">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[#2872A1] font-extrabold uppercase tracking-wider text-sm bg-[#CBDDE9]/30 px-4 py-1.5 rounded-full inline-block mb-3">Partnerships</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Join Our Ecosystem</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">AuraLive isn't just a hostel; it's a complete student ecosystem. Partner with us to provide essential services to our residents.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-b from-cyan-50 to-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-cyan-100 hover:border-cyan-300 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 shadow-inner"><Shirt className="w-12 h-12" /></div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Laundry Services</h3>
                <p className="text-gray-500 mb-8 flex-1 leading-relaxed">Provide scheduled washing, ironing, and direct-to-room delivery services.</p>
                <button onClick={() => navigate('/register/laundry')} className="w-full py-4 font-bold text-cyan-700 bg-white border border-cyan-100 hover:bg-cyan-600 hover:text-white rounded-xl transition-all shadow-sm">Become a Partner</button>
              </div>
              <div className="bg-gradient-to-b from-orange-50 to-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-orange-100 hover:border-orange-300 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 shadow-inner"><Utensils className="w-12 h-12" /></div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Meal Suppliers</h3>
                <p className="text-gray-500 mb-8 flex-1 leading-relaxed">Supply daily nutritious meals and on-demand custom orders to residents.</p>
                <button onClick={() => navigate('/register/meal')} className="w-full py-4 font-bold text-orange-700 bg-white border border-orange-100 hover:bg-orange-600 hover:text-white rounded-xl transition-all shadow-sm">Become a Supplier</button>
              </div>
              <div className="bg-gradient-to-b from-emerald-50 to-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-emerald-100 hover:border-emerald-300 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 shadow-inner"><Wrench className="w-12 h-12" /></div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Maintenance</h3>
                <p className="text-gray-500 mb-8 flex-1 leading-relaxed">Join our certified technical team to resolve plumbing and electrical issues.</p>
                <button onClick={() => navigate('/register/maintainer')} className="w-full py-4 font-bold text-emerald-700 bg-white border border-emerald-100 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm">Join Tech Team</button>
              </div>
            </div>
          </motion.div>
        </section>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}} />
    </div>
  );
};

export default Home;