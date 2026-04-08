'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface BookingModalProps {
  catererId: string;
  menuId: string;
  menuName: string;
  pricePerHead: number;
  minHeadcount: number;
  isAuthenticated: boolean;
  onClose: () => void;
}

export default function BookingModal({
  catererId,
  menuId,
  menuName,
  pricePerHead,
  minHeadcount,
  isAuthenticated,
  onClose
}: BookingModalProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    customerEmail: '',
    eventDate: '',
    eventTime: '19:00', // Default to 7:00 PM
    eventLocation: '',
    headcount: minHeadcount,
    eventType: 'wedding',
    otherEventDetails: '',
  });

  // 1. Sync User and Restore Drafts
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name,
        phoneNumber: user.phoneNumber,
        customerEmail: user.email
      }));
    }

    const savedDraft = localStorage.getItem('draftBooking');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.menuId === menuId) {
          setFormData(prev => ({
            ...prev,
            eventDate: draft.eventDate || '',
            eventTime: draft.eventTime || '19:00',
            eventLocation: draft.eventLocation || '',
            headcount: draft.headcount || minHeadcount,
            eventType: draft.eventType || 'wedding',
            otherEventDetails: draft.otherEventDetails || '',
          }));
        }
      } catch (e) {
        console.error("Draft restoration error", e);
      }
    }
  }, [user, menuId, minHeadcount]);

  // 2. The Logic Handler
  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- GUEST BEHAVIOR: Save and Redirect ---
    // SAFETY LOCK: Added `|| !user` to guarantee it never submits if the user context hasn't loaded
    if (!isAuthenticated || !user) {
      localStorage.setItem('draftBooking', JSON.stringify({
        menuId,
        catererId,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        eventLocation: formData.eventLocation,
        headcount: formData.headcount,
        eventType: formData.eventType,
        otherEventDetails: formData.otherEventDetails
      }));

      router.push(`/login?redirect=/menus&menuId=${menuId}`);
      return;
    }

    // --- AUTHENTICATED BEHAVIOR: Submit to Backend ---
    if (formData.headcount < minHeadcount) {
      alert(`Minimum ${minHeadcount} guests required.`);
      return;
    }

    setLoading(true);
    try {
      // Merge Date and Time for Prisma DateTime column
      const combinedDateTime = new Date(`${formData.eventDate}T${formData.eventTime}:00`);

      // CREATE A CLEAN PAYLOAD to avoid NestJS 400 Errors
      // SAFETY LOCK: Pull directly from the `user` context to ensure fields are never empty strings
      const payload: any = {
        menuId: menuId,
        customerName: user.name || formData.customerName || "Customer",
        phoneNumber: user.phoneNumber || formData.phoneNumber || "N/A",
        customerEmail: user.email || formData.customerEmail || "no-reply@caterme.com",
        eventDate: combinedDateTime.toISOString(), // Full YYYY-MM-DDTHH:mm:ss.sssZ
        eventLocation: formData.eventLocation,
        eventType: formData.eventType,
        headcount: Number(formData.headcount),
        totalAmount: formData.headcount * pricePerHead,
        otherEventDetails: formData.otherEventDetails || '',
      };

      // Only attach catererId if it exists (in case they are booking a general menu)
      if (catererId) {
        payload.catererId = catererId;
      }

      await api.post('/orders', payload);

      localStorage.removeItem('draftBooking');
      setSuccess(true);
    } catch (error: any) {
      console.error("Submission Error:", error);

      // EXPLICIT ERROR ALERT: Shows exactly what NestJS rejected
      if (error.response?.data?.message) {
        alert(`Validation Error: ${JSON.stringify(error.response.data.message)}`);
      } else {
        alert("Something went wrong. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Request Sent!</h2>
          <p className="text-gray-600 mb-6">Caterers in Mumbai will now be notified of your request.</p>
          <button onClick={onClose} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">Book {menuName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleAction} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">

            {/* FULL NAME */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                placeholder="Login to enter name"
                className={`mt-1 w-full border rounded-lg p-2 transition-all ${!isAuthenticated ? 'bg-gray-100 text-gray-400 cursor-not-allowed italic' : 'bg-gray-50'}`}
                value={isAuthenticated ? formData.customerName : ''}
                readOnly
              />
            </div>

            {/* PHONE */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                placeholder="Login to enter phone number"
                className={`mt-1 w-full border rounded-lg p-2 transition-all ${!isAuthenticated ? 'bg-gray-100 text-gray-400 cursor-not-allowed italic' : 'bg-gray-50'}`}
                value={isAuthenticated ? formData.phoneNumber : ''}
                readOnly
              />
            </div>

            {/* DATE & TIME SECTION */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Event Date</label>
              <input
                required
                type="date"
                className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.eventDate}
                onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Event Time</label>
              <input
                required
                type="time"
                className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.eventTime}
                onChange={e => setFormData({ ...formData, eventTime: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Location (Mumbai)</label>
              <input
                required
                type="text"
                placeholder="e.g. Juhu, Bandra, South Mumbai"
                className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.eventLocation}
                onChange={e => setFormData({ ...formData, eventLocation: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Guests</label>
              <input
                required
                type="number"
                min={minHeadcount}
                className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.headcount}
                onChange={e => setFormData({ ...formData, headcount: Number(e.target.value) })}
              />
              <p className="text-[10px] text-orange-600 mt-1">Minimum: {minHeadcount}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Event Type</label>
              <select
                className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.eventType}
                onChange={e => setFormData({ ...formData, eventType: e.target.value })}
              >
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="birthday">Birthday</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl mt-4 flex justify-between items-center border border-orange-100">
            <span className="text-orange-800 font-bold">Estimated Total:</span>
            <span className="text-xl font-extrabold text-orange-900">₹{(formData.headcount * pricePerHead).toLocaleString()}</span>
          </div>

          {!isAuthenticated ? (
            <button
              type="button"
              onClick={handleAction}
              className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 shadow-lg transition-all transform active:scale-[0.98]"
            >
              Login to Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 shadow-lg transition-all transform active:scale-[0.98]"
            >
              {loading ? 'Sending Request...' : 'Check Availability'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}