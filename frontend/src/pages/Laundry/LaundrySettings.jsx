import React, { useState, useEffect } from 'react';
import LaundrySidebar from './LaundrySidebar';
import LaundryNavbar from './LaundryNavbar';
import { Save, DollarSign, Clock, Shirt } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const LaundrySettings = () => {
  const [loading, setLoading] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [prices, setPrices] = useState({
    pricePerKg: 200,
    washIronPrice: 50,
    dryCleanPrice: 150,
    oneDayDeliveryFee: 100
  });
// Fetch current prices on component mount
  useEffect(() => {
    // Fetch current prices from backend
    const fetchPrices = async () => {
      const res = await fetch(`http://localhost:5000/api/laundry/profile/${userInfo._id}`);
      const data = await res.json();
      if(res.ok) setPrices(data);
    };
    fetchPrices();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/laundry/update-prices/${userInfo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prices)
      });
      if(res.ok) toast.success("Prices updated successfully!");
    } catch (err) {
      toast.error("Update failed!");
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
                <input type="number" value={prices.pricePerKg} onChange={(e) => setPrices({...prices, pricePerKg: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#2872A1]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Wash & Iron Extra (Rs.)</label>
                <input type="number" value={prices.washIronPrice} onChange={(e) => setPrices({...prices, washIronPrice: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Dry Clean Extra (Rs.)</label>
                <input type="number" value={prices.dryCleanPrice} onChange={(e) => setPrices({...prices, dryCleanPrice: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">1-Day Delivery Express Fee (Rs.)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
                <input type="number" value={prices.oneDayDeliveryFee} onChange={(e) => setPrices({...prices, oneDayDeliveryFee: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none" />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-4 bg-[#2872A1] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1e567a] transition-all">
              <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save Pricing Changes'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};
export default LaundrySettings;