import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, Mail, Phone, ShieldCheck, Briefcase, 
  MapPin, Edit3, Save, X, Trash2, Camera, 
  CheckCircle, AlertTriangle 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import MaintainersSidebar from './MaintainersSidebar';
import MaintainersNavbar from './MaintainersNavbar';
import { motion, AnimatePresence } from 'framer-motion';

const MaintainerProfile = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  void motion;
  

  const fileInputRef = useRef(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    experience: '',
    bio: ''
  });

  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/maintainers/${userInfo._id}`);
        if (res.data) {
          setFormData({
            name: res.data.name || '',
            email: res.data.email || '',
            phone: res.data.phone || '',
            category: res.data.category || 'General',
            experience: res.data.experience || '1 Year',
            bio: res.data.bio || 'Maintenance Professional at AuraFix'
          });

          
          if (res.data.profileImage) {
            setProfilePicPreview(res.data.profileImage);
          }
        }
      } catch (err) {
        console.error(err);
        setFormData(prev => ({ ...prev, name: userInfo.name, email: userInfo.email }));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userInfo._id, userInfo.name, userInfo.email]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      
      setProfilePicPreview(URL.createObjectURL(file)); 
      
      const submitData = new FormData();
      Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
      submitData.append('profileImage', file); 

      try {
        toast.loading('Uploading Profile Picture...', { id: 'photo-upload' });
        
        const res = await axios.put(`http://localhost:5000/api/maintainers/update/${userInfo._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        toast.dismiss('photo-upload');
        toast.success('Profile picture updated successfully!');
        
       
        if (res.data && res.data.profileImage) {
          setProfilePicPreview(res.data.profileImage);
        }
      } catch (error) {
        console.error("Image upload error:", error);
        toast.dismiss('photo-upload');
        toast.error('Failed to upload profile picture.');
      }
    }
  };

  // Profile Update Function
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/api/maintainers/update/${userInfo._id}`, formData);
      if (res.status === 200) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        const newInfo = { ...userInfo, name: formData.name };
        localStorage.setItem('userInfo', JSON.stringify(newInfo));
      }
      } catch (error) {
        console.error(error);
      toast.error("Failed to update profile.");
    }
  };

  // Account Delete Function
  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/maintainers/${userInfo._id}`);
      toast.success("Account deleted.");
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error("Could not delete account.");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Profile...</div>;

  
  const displayImage = profilePicPreview 
    ? (profilePicPreview.startsWith('blob') || profilePicPreview.startsWith('http') ? profilePicPreview : `http://localhost:5000${profilePicPreview}`)
    : null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <Toaster position="top-center" />
      <MaintainersSidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <MaintainersNavbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-4xl mx-auto">
            
            {/* Header Section */}
            <div className="mb-10 flex justify-between items-end px-2">
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter">My Profile</h2>
                <p className="text-slate-500 font-medium">Manage your professional identity and account settings.</p>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[#2872A1] font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-sm"
                >
                  <Edit3 size={16} /> Edit Profile
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column - Avatar & Quick Info */}
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
                  
                  {/* IMAGE UPLOAD SECTION */}
                  <div className="relative group mb-6">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-[#2872A1] flex items-center justify-center text-white text-5xl font-black shadow-xl border-4 border-white overflow-hidden">
                      {displayImage ? (
                        <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        formData.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    
                    {/* Camera Icon */}
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-0 right-0 p-3 bg-white rounded-2xl shadow-lg text-[#2872A1] hover:scale-110 hover:bg-[#2872A1] hover:text-white transition-all border border-slate-100"
                    >
                      <Camera size={18} />
                    </button>
                    
                    {/* Hidden File Input */}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 leading-tight">{formData.name}</h3>
                  <p className="text-[#2872A1] font-bold text-xs uppercase tracking-widest mt-1">{formData.category} Expert</p>
                  
                  <div className="w-full mt-8 pt-8 border-t border-slate-50 space-y-4">
                    <div className="flex items-center gap-3 text-slate-500 text-sm font-bold bg-slate-50 p-3 rounded-2xl">
                      <Mail size={18} className="text-[#2872A1]" /> {formData.email}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-sm font-bold bg-slate-50 p-3 rounded-2xl">
                      <Phone size={18} className="text-[#2872A1]" /> {formData.phone || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-6 rounded-[2.5rem] border border-red-100">
                  <h4 className="text-red-600 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertTriangle size={14} /> Danger Zone
                  </h4>
                  <p className="text-red-400 text-[10px] font-medium mb-4">Deleting your account is permanent and cannot be undone.</p>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-3 bg-white text-red-500 border border-red-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                  >
                    Delete Account
                  </button>
                </div>
              </div>

              {/* Right Column - Forms */}
              <div className="md:col-span-2">
                <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100">
                  <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                          type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing}
                          className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#2872A1] transition-all font-bold text-slate-700 disabled:opacity-60"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Phone</label>
                        <input 
                          type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing}
                          className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#2872A1] transition-all font-bold text-slate-700 disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Category</label>
                        <select 
                          name="category" value={formData.category} onChange={handleChange} disabled={!isEditing}
                          className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#2872A1] transition-all font-bold text-slate-700 disabled:opacity-60 appearance-none"
                        >
                          <option value="Plumbing">Plumbing</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Furniture">Furniture</option>
                          <option value="General">General Maintenance</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Experience</label>
                        <input 
                          type="text" name="experience" value={formData.experience} onChange={handleChange} disabled={!isEditing}
                          className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#2872A1] transition-all font-bold text-slate-700 disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
                      <textarea 
                        name="bio" value={formData.bio} onChange={handleChange} disabled={!isEditing} rows="4"
                        className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#2872A1] transition-all font-bold text-slate-700 disabled:opacity-60 resize-none"
                      ></textarea>
                    </div>

                    {isEditing && (
                      <div className="flex gap-4 pt-4">
                        <button 
                          type="submit"
                          className="flex-1 py-4 bg-[#2872A1] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-[#1e567a] transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Save size={18} /> Save Changes
                        </button>
                        <button 
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Are you sure?</h3>
              <p className="text-slate-500 font-medium mb-8">This will permanently delete your maintainer account and remove all your data from AuraFix.</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteAccount}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-600 transition-all"
                >
                  Yes, Delete My Account
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  No, Keep It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MaintainerProfile;