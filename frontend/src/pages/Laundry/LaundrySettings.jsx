import React, { useState, useEffect } from 'react';
import LaundrySidebar from './LaundrySidebar';
import LaundryNavbar from './LaundryNavbar';
import { Save, DollarSign, Clock, Shirt } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const LaundrySettings = () => {
  const [loading, setLoading] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  const [prices, setPrices] = useState({
    pricePerKg: 200,
    washIronPrice: 50,
    dryCleanPrice: 150,
    oneDayDeliveryFee: 100
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        if (!userInfo._id) return;
        const res = await fetch(`http://localhost:5000/api/laundry/profile/${userInfo._id}`);
        const data = await res.json();
        if (res.ok && data) {
          setPrices({
            pricePerKg: data.pricePerKg || 200,
            washIronPrice: data.washIronPrice || 50,
            dryCleanPrice: data.dryCleanPrice || 150,
            oneDayDeliveryFee: data.oneDayDeliveryFee || 100
          });
        }
      } catch (err) {
        console.error("Failed to load prices", err);
      }
    };
    fetchPrices();
  }, [userInfo._id]);

  // ==========================================
  // 🛡️ THE FIX: PREVENT TYPING INVALID CHARACTERS
  // ==========================================
  const blockInvalidChars = (e) => {
    // Prevent typing Minus, Plus, 'e' (exponent), and Decimal point (since we want whole Rupees)
    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handlePriceChange = (field, value) => {
    // Allow the box to be empty so they can delete and retype numbers
    if (value === '') {
      setPrices(prev => ({ ...prev, [field]: '' }));
      return;
    }
    
    // Parse the number and force it to be positive (fixes copy-pasting negative numbers)
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setPrices(prev => ({ ...prev, [field]: Math.abs(num) }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const basePrice = Number(prices.pricePerKg);
    const washPrice = Number(prices.washIronPrice);
    const dryPrice = Number(prices.dryCleanPrice);
    const deliveryFee = Number(prices.oneDayDeliveryFee);

    if (!basePrice || basePrice < 1) return toast.error("Base Price must be at least Rs. 1");
    if (!washPrice || washPrice < 1) return toast.error("Wash & Iron Price must be at least Rs. 1");
    if (!dryPrice || dryPrice < 1) return toast.error("Dry Clean Price must be at least Rs. 1");
    if (!deliveryFee || deliveryFee < 1) return toast.error("Express Delivery Fee must be at least Rs. 1");

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/laundry/update-prices/${userInfo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pricePerKg: basePrice,
          washIronPrice: washPrice,
          dryCleanPrice: dryPrice,
          oneDayDeliveryFee: deliveryFee
        })
      });
      
      if (res.ok) {
        toast.success("Prices updated successfully!");
      } else {
        toast.error("Failed to update prices.");
      }
    } catch (err) {
      toast.error("Server connection failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Toaster />
      <LaundrySidebar />
      <div className="flex-1">
        <LaundryNavbar />
        <main className="p-8 max-w-2xl">
          <h2 className="text-3xl font-black text-gray-800 mb-6">Pricing Settings</h2>
          
          <form onSubmit={handleUpdate} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
            
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Base Price per 1Kg (Rs.)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
                <input 
                  type="number" 
                  min="1" 
                  required
                  value={prices.pricePerKg} 
                  onKeyDown={blockInvalidChars}
                  onChange={(e) => handlePriceChange('pricePerKg', e.target.value)} 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#2872A1] transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Wash & Iron Extra (Rs.)</label>
                <input 
                  type="number" 
                  min="1" 
                  required
                  value={prices.washIronPrice} 
                  onKeyDown={blockInvalidChars}
                  onChange={(e) => handlePriceChange('washIronPrice', e.target.value)} 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#2872A1] transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Dry Clean Extra (Rs.)</label>
                <input 
                  type="number" 
                  min="1" 
                  required
                  value={prices.dryCleanPrice} 
                  onKeyDown={blockInvalidChars}
                  onChange={(e) => handlePriceChange('dryCleanPrice', e.target.value)} 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#2872A1] transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">1-Day Delivery Express Fee (Rs.)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
                <input 
                  type="number" 
                  min="1" 
                  required
                  value={prices.oneDayDeliveryFee} 
                  onKeyDown={blockInvalidChars}
                  onChange={(e) => handlePriceChange('oneDayDeliveryFee', e.target.value)} 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#2872A1] transition-all" 
                />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-4 bg-[#2872A1] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1e567a] transition-all active:scale-[0.98] disabled:opacity-70">
              <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save Pricing Changes'}
            </button>

          </form>
        </main>
      </div>
    </div>
  );
};

export default LaundrySettings;