import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Users, Wind, Bath, CheckCircle, 
  ShieldCheck, Wallet, CalendarDays, BedDouble
} from 'lucide-react';
import toast from 'react-hot-toast';

const RoomDetails = () => {
  const { id } = useParams(); // Gets the room ID from the URL
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [relatedRooms, setRelatedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Fallback images
  const roomPhotos = {
    single: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    double: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
    shared: "https://images.unsplash.com/photo-1555854817-5b2738a91574?auto=format&fit=crop&w=1200&q=80",
    default: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"
  };

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        // Fetch all rooms
        const response = await axios.get('http://localhost:5000/api/rooms');
        const allVisibleRooms = response.data.filter(r => r.display === true);
        
        // Find the specific room
        const currentRoom = allVisibleRooms.find(r => r._id === id);
        setRoom(currentRoom);

        // Find related rooms (Same type, excluding the current one)
        if (currentRoom) {
          const related = allVisibleRooms
            .filter(r => r.roomType === currentRoom.roomType && r._id !== currentRoom._id)
            .slice(0, 3); // Get max 3 related rooms
          setRelatedRooms(related);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching room details:", err);
        setLoading(false);
        toast.error("Failed to load room details.");
      }
    };
    fetchRoomData();
  }, [id]); // Re-run if the ID in the URL changes

  const handleBooking = () => {
    // 1. Check if they are logged in at all
    if (!userInfo) {
      toast.error('Please log in to book a room.');
      navigate('/login');
      return;
    }
    
    // 2. Check if they are a Student (Admins/Partners shouldn't book rooms)
    if (userInfo.role !== 'Student') {
      toast.error('Only registered students can book rooms.');
      return;
    }

    // 3. If all checks pass, send them to the booking wizard!
    navigate(`/booking/${room._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2872A1]"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Room not found</h2>
        <button onClick={() => navigate('/home')} className="text-[#2872A1] hover:underline font-bold">Go back Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* Top Navigation Bar inside the page */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-gray-500 hover:text-[#2872A1] font-semibold transition-colors w-max">
          <ArrowLeft className="w-5 h-5" />
          Back to all rooms
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT SIDE: Room Images & Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Hero Image */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl overflow-hidden h-[400px] shadow-lg border border-gray-100">
              <img 
                src={room.image || roomPhotos[room.roomType?.toLowerCase()] || roomPhotos.default} 
                alt={`Room ${room.roomNumber}`} 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = roomPhotos.default; }}
              />
            </motion.div>

            {/* Room Info Header */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#CBDDE9]/40 text-[#2872A1] text-xs font-bold uppercase tracking-wider rounded-lg">
                  {room.roomType}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-lg">
                  {room.designatedGender}
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 border border-emerald-100">
                  <CheckCircle className="w-3 h-3" /> Available Now
                </span>
              </div>
              
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Room {room.roomNumber}</h1>
              <p className="flex items-center gap-2 text-gray-500 font-medium mb-6">
                <MapPin className="w-5 h-5 text-[#2872A1]" />
                {room.floorLevel}, AuraLive Main Building
              </p>
              
              <h3 className="text-xl font-bold text-gray-800 mb-3">About this room</h3>
              <p className="text-gray-600 leading-relaxed">
                {room.description || "A highly comfortable space designed for students. Quiet, secure, and perfectly equipped for your academic journey."}
              </p>
            </motion.div>

            {/* Amenities Grid */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">What this place offers</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 text-gray-700 font-medium">
                  <Users className="w-6 h-6 text-[#2872A1]" /> {room.maxCapacity} Person Capacity
                </div>
                <div className="flex items-center gap-3 text-gray-700 font-medium">
                  <Wind className="w-6 h-6 text-[#2872A1]" /> {room.airConditioning}
                </div>
                <div className="flex items-center gap-3 text-gray-700 font-medium">
                  <Bath className="w-6 h-6 text-[#2872A1]" /> {room.bathroomType} Bath
                </div>
                {room.hasBalcony && (
                  <div className="flex items-center gap-3 text-gray-700 font-medium">
                    <MapPin className="w-6 h-6 text-[#2872A1]" /> Private Balcony
                  </div>
                )}
                {room.furnishing?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-500" /> {item}
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* RIGHT SIDE: Booking Card (Sticky) */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white p-8 rounded-3xl shadow-xl shadow-[#CBDDE9]/30 border border-[#2872A1]/20 sticky top-28">
              
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Monthly Rent</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-[#2872A1]">Rs. {room.monthlyRent}</span>
                  <span className="text-gray-500 font-medium mb-1">/ month</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-700 font-semibold">
                    <Wallet className="w-5 h-5 text-[#2872A1]" /> Key Money
                  </div>
                  <span className="font-bold text-gray-900">Rs. {room.keyMoney}</span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-700 font-semibold">
                    <CalendarDays className="w-5 h-5 text-[#2872A1]" /> Minimum Stay
                  </div>
                  <span className="font-bold text-gray-900">6 Months</span>
                </div>

                <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-5 h-5" /> Secure Booking
                  </div>
                  <span className="font-bold text-emerald-700">Verified</span>
                </div>
              </div>

              <button 
                onClick={handleBooking}
                className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg shadow-[#CBDDE9] hover:shadow-xl hover:-translate-y-1 bg-gradient-to-r from-[#2872A1] to-[#1f5a80]"
              >
                Secure this Room
              </button>
              <p className="text-center text-xs text-gray-400 mt-4 font-medium">You won't be charged yet.</p>

            </motion.div>
          </div>

        </div>

        {/* BOTTOM SECTION: Related Rooms */}
        {relatedRooms.length > 0 && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-24 pt-12 border-t border-gray-200">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">More {room.roomType} Rooms</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedRooms.map((related) => (
                <div key={related._id} onClick={() => navigate(`/book/${related._id}`)} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 group">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={related.image || roomPhotos[related.roomType?.toLowerCase()] || roomPhotos.default} 
                      alt={`Room ${related.roomNumber}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = roomPhotos.default; }}
                    />
                    <div className="absolute top-3 right-3 bg-[#2872A1] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      Rs. {related.monthlyRent}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xl font-bold text-gray-900">Room {related.roomNumber}</h4>
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{related.designatedGender}</span>
                    </div>
                    <p className="text-gray-500 text-sm flex items-center gap-1.5 font-medium">
                      <BedDouble className="w-4 h-4 text-[#2872A1]" /> {related.roomType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default RoomDetails;