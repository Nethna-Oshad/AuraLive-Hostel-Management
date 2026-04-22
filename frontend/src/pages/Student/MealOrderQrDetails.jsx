import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { CheckCircle2, ReceiptText, Store, CalendarDays, CircleAlert } from 'lucide-react';

const MealOrderQrDetails = () => {
  const { reference } = useParams();
  const normalizedReference = useMemo(() => String(reference || '').trim().toUpperCase(), [reference]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!normalizedReference) {
        setError('Invalid order reference.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/meals/orders/reference/${encodeURIComponent(normalizedReference)}`
        );
        setOrder(response.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load this meal order.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [normalizedReference]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <p className="text-sm font-semibold text-gray-500">Loading meal order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-red-100 rounded-2xl p-8 text-center">
          <CircleAlert className="w-12 h-12 mx-auto text-red-500" />
          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">Order Not Found</h1>
          <p className="mt-2 text-sm text-gray-600">{error || 'No order matched this QR code.'}</p>
        </div>
      </div>
    );
  }

  const statusBadgeClass =
    order.deliveryStatus === 'Delivered'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-amber-100 text-amber-700 border-amber-200';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-3xl shadow-sm p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Meal Order Details</h1>
            <p className="text-sm text-gray-500 mt-1">Reference: {order.orderReference || normalizedReference}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusBadgeClass}`}>
            {order.deliveryStatus || order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
            <p className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-2">
              <Store className="w-4 h-4" /> Shop
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-800">{order.externalShopName || '-'}</p>
          </div>
          <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
            <p className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Date and Slot
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-800">{order.bookingDate}</p>
            <p className="text-xs text-gray-500 mt-1">{order.slotLabel}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
          <p className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-2">
            <ReceiptText className="w-4 h-4" /> Order Items
          </p>
          {Array.isArray(order.externalItems) && order.externalItems.length > 0 ? (
            <div className="mt-3 space-y-2">
              {order.externalItems.map((item, idx) => (
                <div key={`${item.itemName}-${idx}`} className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-gray-800">
                    {item.itemName} <span className="text-gray-500 font-normal">x{item.quantity}</span>
                  </p>
                  <p className="font-bold text-gray-700">Rs. {item.lineTotal}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm font-semibold text-gray-800">{order.externalMenuItem || '-'}</p>
          )}
        </div>

        <div className="rounded-xl border border-emerald-100 p-4 bg-emerald-50">
          <p className="text-sm text-emerald-800 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Payment: {order.paymentStatus} | Total: Rs. {order.externalAmount || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MealOrderQrDetails;
