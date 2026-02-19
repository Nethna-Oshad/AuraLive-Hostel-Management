import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-6 mt-10">
      <div className="container mx-auto px-4 text-center text-gray-600">
        <p className="flex items-center justify-center gap-2 mb-2">
          Made with <Heart size={16} className="text-red-500 fill-red-500" /> by AuraLive Team
        </p>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} AuraLive. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;