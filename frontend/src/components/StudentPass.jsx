import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas'; // 👈 NEW: Used for saving as an image!
import { Download, CheckCircle } from 'lucide-react';

const StudentPass = ({ studentInfo, paymentId }) => {
  const componentRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let isActive = true;

    // 🌟 FIX 1: Formatted Text for Notepad/Scanners
    // This will show up clearly as text when scanned by any mobile phone!
    const qrText = `AURALIVE HOSTEL PASS\n--------------------\nName: ${studentInfo?.name || 'Student'}\nRoom: ${studentInfo?.roomNumber || 'N/A'}\nStatus: Verified\nPayID: ${paymentId || 'N/A'}`;

    QRCode.toDataURL(qrText, { width: 170, margin: 1 })
      .then((url) => {
        if (isActive) setQrDataUrl(url);
      })
      .catch(() => {
        if (isActive) setQrDataUrl('');
      });

    return () => {
      isActive = false;
    };
  }, [studentInfo?.name, studentInfo?.roomNumber, paymentId]);

  // 🌟 FIX 2: Download as a high-quality PNG Image
  const handleDownloadImage = async () => {
    if (componentRef.current) {
      try {
        // scale: 2 makes the downloaded image high-resolution!
        const canvas = await html2canvas(componentRef.current, { scale: 2, backgroundColor: '#ffffff' });
        const image = canvas.toDataURL('image/png');
        
        // Create a fake link to trigger the download
        const link = document.createElement('a');
        link.href = image;
        link.download = `${studentInfo?.name || 'Student'}_AuraLive_Pass.png`;
        link.click();
      } catch (error) {
        console.error("Failed to download image:", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      
      {/* This is the exact section that gets converted to an image */}
      <div 
        ref={componentRef} 
        className="w-80 bg-white border border-gray-200 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Decorative Header */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#2872A1]"></div>

        <div className="text-emerald-500 mb-2 mt-2">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">AuraLive Pass</h2>
        <p className="text-xs font-bold text-[#2872A1] bg-[#CBDDE9]/30 px-3 py-1 rounded-full uppercase tracking-widest mb-6">Verified Resident</p>

        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6 group relative">
          <div className="absolute inset-0 bg-[#2872A1]/5 rounded-2xl scale-105 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Hostel pass QR" className="w-[160px] h-[160px] relative z-10" />
          ) : (
            <div className="w-[160px] h-[160px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold">Generating...</div>
          )}
        </div>

        <div className="w-full text-left bg-gray-50 p-5 rounded-2xl border border-gray-100">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Resident Name</p>
          <p className="text-gray-900 font-bold text-lg leading-none mb-4">{studentInfo?.name || 'Student'}</p>
          
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Allocated Room</p>
          <p className="text-[#2872A1] font-black text-xl leading-none">{studentInfo?.roomNumber || 'N/A'}</p>
        </div>
      </div>

      <button 
        onClick={handleDownloadImage}
        className="flex items-center gap-2 px-8 py-3.5 bg-[#2872A1] text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-[#1f5a80] hover:scale-105 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
      >
        <Download className="w-5 h-5" />
        Save as Image
      </button>
    </div>
  );
};

export default StudentPass;