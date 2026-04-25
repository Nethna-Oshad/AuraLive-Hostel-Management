import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useReactToPrint } from 'react-to-print';
import { Download, CheckCircle } from 'lucide-react';

const StudentPass = ({ studentInfo, paymentId }) => {
  const componentRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let isActive = true;

    const qrValue = `AuraLive|${studentInfo?.name || 'Student'}|Room:${studentInfo?.roomNumber || 'N/A'}|PayID:${paymentId || 'PAYMENT-VERIFIED'}`;

    QRCode.toDataURL(qrValue, { width: 170, margin: 1 })
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

  const handleDownload = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${studentInfo?.name || 'Student'}_Hostel_Pass`,
  });

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      
      <div 
        ref={componentRef} 
        className="w-80 bg-white border border-gray-200 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center"
      >
        <div className="text-emerald-500 mb-2">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">AuraLive Pass</h2>
        <p className="text-sm text-gray-500 mb-6">Payment Verified</p>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Hostel pass QR" className="w-[150px] h-[150px]" />
          ) : (
            <div className="w-[150px] h-[150px] bg-white rounded-md border border-dashed border-gray-300" />
          )}
        </div>

        <div className="w-full text-left bg-gray-50 p-4 rounded-xl">
          <p className="text-xs text-gray-500 font-bold uppercase">Name</p>
          <p className="text-gray-800 font-semibold mb-2">{studentInfo?.name || 'Student'}</p>
          <p className="text-xs text-gray-500 font-bold uppercase">Room</p>
          <p className="text-gray-800 font-semibold">{studentInfo?.roomNumber || 'N/A'}</p>
        </div>
      </div>

      <button 
        onClick={handleDownload}
        className="flex items-center gap-2 px-6 py-3 bg-[#2872A1] text-white font-bold rounded-xl hover:bg-[#1f5a80] transition-colors"
      >
        <Download className="w-5 h-5" />
        Download PDF Pass
      </button>
    </div>
  );
};

export default StudentPass;