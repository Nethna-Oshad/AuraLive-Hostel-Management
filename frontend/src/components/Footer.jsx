import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#CBDDE9]/40 pt-16 pb-8 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Section: Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Column 1: Brand & Contact */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4 inline-block hover:opacity-90 transition-opacity">
              Aura<span className="text-[#2872A1]">Live</span>
            </Link>
            <p className="text-gray-500 text-sm mb-6 max-w-sm leading-relaxed">
              Premium student living and hostel management in Sri Lanka. We connect SLIIT students with safe, comfortable, and affordable accommodations.
            </p>
            <div className="space-y-3">
              <p className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <MapPin className="w-4 h-4 text-[#2872A1]" />
                New Kandy Road, Malabe
              </p>
              <p className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <Phone className="w-4 h-4 text-[#2872A1]" />
                +94 77 123 4567
              </p>
              <p className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <Mail className="w-4 h-4 text-[#2872A1]" />
                hello@auralive.lk
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          {/* Column 3: Legal & Company */}
<div>
  <h4 className="text-gray-900 font-bold mb-5 uppercase tracking-wider text-sm">Company</h4>
  <ul className="space-y-3">
    <li><Link to="/about-us" className="text-gray-500 hover:text-[#2872A1] transition-colors text-sm font-medium flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#CBDDE9]"></span> About Us</Link></li>
    <li><Link to="/privacy-policy" className="text-gray-500 hover:text-[#2872A1] transition-colors text-sm font-medium flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#CBDDE9]"></span> Privacy Policy</Link></li>
    <li><Link to="/terms-of-service" className="text-gray-500 hover:text-[#2872A1] transition-colors text-sm font-medium flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#CBDDE9]"></span> Terms of Service</Link></li>
    <li><Link to="/help-center" className="text-gray-500 hover:text-[#2872A1] transition-colors text-sm font-medium flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#CBDDE9]"></span> Help Center</Link></li>
  </ul>
</div>

          

        </div>

        {/* Bottom Section: Copyright & Socials */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} AuraLive. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="#" className="w-9 h-9 rounded-full bg-[#CBDDE9]/30 flex items-center justify-center text-[#2872A1] hover:bg-[#2872A1] hover:text-white transition-all duration-300 hover:-translate-y-1">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-[#CBDDE9]/30 flex items-center justify-center text-[#2872A1] hover:bg-[#2872A1] hover:text-white transition-all duration-300 hover:-translate-y-1">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-[#CBDDE9]/30 flex items-center justify-center text-[#2872A1] hover:bg-[#2872A1] hover:text-white transition-all duration-300 hover:-translate-y-1">
              <Twitter className="w-4 h-4" />
            </a>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-sm text-gray-500 font-medium">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> by AuraLive Team
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;