import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, ChevronLeft, ChevronRight, Quote, PlusCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper function for "Time Ago"
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

const Reviews = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [reviews, setReviews] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  
  // Add Review State
  const [isAdding, setIsAdding] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // DUMMY DATA: So the UI shows up even if your database is empty!
  const dummyReviews = [
    { _id: '1', studentName: 'Kavindu Perera', profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', rating: 5, comment: 'Absolutely love living here! The WiFi is super fast which is great for my SLIIT assignments, and the maintenance team is incredibly responsive.', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: '2', studentName: 'Sanduni Fernando', profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', rating: 4, comment: 'Great environment and very secure. The laundry service makes life so much easier. Highly recommended for any university student.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { _id: '3', studentName: 'Tharusha Dilshan', profileImage: '', rating: 5, comment: 'The rooms are spacious and the digital rent payment system is very convenient. No complaints at all!', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() }
  ];

  const fetchReviews = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reviews');
      // THE FIX: If database has reviews, show them. If database is empty, show Dummy Data!
      setReviews(res.data.length > 0 ? res.data : dummyReviews);
    } catch (error) {
      setReviews(dummyReviews);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleNext = () => setSelectedIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  const handlePrev = () => setSelectedIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));

  const submitReview = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return toast.error("Please write a comment.");
    
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/reviews', {
        studentId: userInfo._id,
        studentName: userInfo.name,
        profileImage: userInfo.profileImage || '', 
        rating: newReview.rating,
        comment: newReview.comment
      });
      toast.success("Review added successfully!");
      setIsAdding(false);
      setNewReview({ rating: 5, comment: '' });
      fetchReviews(); 
    } catch (error) {
      toast.error("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        onClick={() => interactive && setNewReview({...newReview, rating: i + 1})}
        className={`w-5 h-5 ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
      />
    ));
  };

  if (reviews.length === 0 && userInfo?.role !== 'Student') return null;

  return (
    <section className="py-20 bg-white relative z-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-[#2872A1] font-extrabold uppercase tracking-wider text-sm bg-[#CBDDE9]/30 px-4 py-1.5 rounded-full inline-block mb-3">Student Stories</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-2">What Our Residents Say</h2>
            <p className="text-gray-500 text-lg">Real experiences from students who call AuraLive their home.</p>
          </div>
          
          {userInfo?.role === 'Student' && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#2872A1] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#1f5a80] transition-colors shadow-lg hover:-translate-y-0.5 shrink-0"
            >
              <PlusCircle className="w-5 h-5" /> Write a Review
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.slice(0, 6).map((review, index) => (
            <motion.div 
              key={review._id} whileHover={{ y: -5 }} onClick={() => setSelectedIndex(index)}
              className="bg-gray-50 rounded-3xl p-8 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-[#CBDDE9]/50 transition-all border border-gray-100 flex flex-col h-full group relative overflow-hidden"
            >
              <Quote className="absolute top-4 right-4 w-12 h-12 text-gray-200/50 -rotate-12 group-hover:text-[#CBDDE9]/40 transition-colors" />
              <div className="flex items-center gap-1 mb-4 z-10">{renderStars(review.rating)}</div>
              <p className="text-gray-600 font-medium italic mb-8 flex-1 line-clamp-4 z-10">"{review.comment}"</p>
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-200 z-10">
                <div className="w-12 h-12 rounded-full bg-[#2872A1] text-white flex items-center justify-center font-bold overflow-hidden shadow-inner border-2 border-white ring-2 ring-gray-100">
                  {review.profileImage ? <img src={review.profileImage} alt="Profile" className="w-full h-full object-cover" /> : review.studentName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-sm">{review.studentName}</h4>
                  <p className="text-xs text-gray-500 font-bold tracking-wide mt-0.5">{timeAgo(review.createdAt)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* POPUP MODAL FOR VIEWING REVIEWS */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl relative overflow-hidden">
              <button onClick={() => setSelectedIndex(null)} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-20"><X className="w-5 h-5 text-gray-600" /></button>
              <div className="p-10 md:p-14 text-center relative">
                <Quote className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-24 text-gray-100 z-0" />
                <div className="relative z-10">
                  <div className="flex justify-center gap-1 mb-6">{renderStars(reviews[selectedIndex].rating)}</div>
                  <p className="text-xl md:text-2xl text-gray-800 font-medium italic mb-10 leading-relaxed">"{reviews[selectedIndex].comment}"</p>
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-[#2872A1] text-white flex items-center justify-center font-extrabold text-2xl overflow-hidden shadow-lg border-4 border-white ring-4 ring-[#CBDDE9] mb-4">
                      {reviews[selectedIndex].profileImage ? <img src={reviews[selectedIndex].profileImage} alt="Profile" className="w-full h-full object-cover" /> : reviews[selectedIndex].studentName.charAt(0)}
                    </div>
                    <h4 className="font-extrabold text-gray-900 text-lg">{reviews[selectedIndex].studentName}</h4>
                    <p className="text-sm text-gray-500 font-bold mt-1">{new Date(reviews[selectedIndex].createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2 md:px-6 pointer-events-none">
                <button onClick={handlePrev} className="w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-[#2872A1] hover:bg-[#2872A1] hover:text-white transition-all pointer-events-auto border border-gray-100"><ChevronLeft className="w-6 h-6" /></button>
                <button onClick={handleNext} className="w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-[#2872A1] hover:bg-[#2872A1] hover:text-white transition-all pointer-events-auto border border-gray-100"><ChevronRight className="w-6 h-6" /></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP MODAL TO ADD A NEW REVIEW */}
      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="bg-[#2872A1] p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2"><Star className="w-5 h-5 fill-white" /> Share Your Experience</h2>
                <button onClick={() => setIsAdding(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={submitReview} className="p-8">
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rate your stay</label>
                  <div className="flex gap-2">{renderStars(newReview.rating, true)}</div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
                  <textarea 
                    rows="4" required
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#2872A1] resize-none"
                    placeholder="Tell us what you love about AuraLive..."
                  ></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#2872A1] hover:bg-[#1f5a80] text-white py-3.5 rounded-xl font-bold transition-all shadow-md flex justify-center items-center gap-2">
                  {isSubmitting ? 'Submitting...' : <><Send className="w-4 h-4" /> Post Review</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Reviews;