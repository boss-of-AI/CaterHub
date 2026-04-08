'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Dish { id: string; name: string; isNonVeg: boolean; cuisine: string; isPremium: boolean; }
interface SlotDish { dishId: string; dish: Dish; }
interface Slot { id: string; category: string; label: string; minChoices: number; maxChoices: number; isRequired: boolean; dishes: SlotDish[]; }
interface Skeleton { id: string; name: string; description: string; basePrice: number; minHeadcount: number; maxHeadcount: number; slots: Slot[]; category?: { label: string; icon: string }; }

export default function SkeletonCustomizePage() {
  const { categoryId, skeletonId } = useParams() as { categoryId: string; skeletonId: string };
  const { user } = useAuth();
  const router = useRouter();

  const [skeleton, setSkeleton] = useState<Skeleton | null>(null);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<Record<string, Set<string>>>({});
  const [showBooking, setShowBooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Booking form
  const [bookingForm, setBookingForm] = useState({
    eventDate: '', eventTime: '19:00', eventLocation: '', headcount: 0,
    eventType: '', otherEventDetails: '',
  });

  useEffect(() => {
    fetch(`http://localhost:3001/skeletons/${skeletonId}`)
      .then(r => r.json())
      .then((data: Skeleton) => {
        setSkeleton(data);
        setBookingForm(prev => ({
          ...prev,
          headcount: data.minHeadcount,
          eventType: data.category?.label || 'event',
        }));
        // Init selections
        const init: Record<string, Set<string>> = {};
        data.slots.forEach(slot => { init[slot.id] = new Set(); });
        setSelections(init);
      })
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false));
  }, [skeletonId]);

  const toggleDish = (slotId: string, dishId: string, maxChoices: number) => {
    setSelections(prev => {
      const updated = new Map(Object.entries(prev).map(([k, v]) => [k, new Set(v)]));
      const slotSet = updated.get(slotId) || new Set();
      if (slotSet.has(dishId)) {
        slotSet.delete(dishId);
      } else {
        if (slotSet.size >= maxChoices) {
          toast.error(`Maximum ${maxChoices} items allowed for this course`);
          return prev;
        }
        slotSet.add(dishId);
      }
      updated.set(slotId, slotSet);
      return Object.fromEntries(updated);
    });
  };

  const isValid = () => {
    if (!skeleton) return false;
    return skeleton.slots.every(slot => {
      const count = selections[slot.id]?.size || 0;
      if (slot.isRequired && count < slot.minChoices) return false;
      return true;
    });
  };

  const totalSelected = Object.values(selections).reduce((sum, s) => sum + s.size, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      // Save draft and redirect to login
      localStorage.setItem('draftSkeletonBooking', JSON.stringify({
        skeletonId, categoryId, selections: Object.fromEntries(
          Object.entries(selections).map(([k, v]) => [k, Array.from(v)])
        ),
        bookingForm,
      }));
      router.push(`/login?redirect=/events/${categoryId}/${skeletonId}`);
      return;
    }

    if (!isValid()) {
      toast.error('Please complete all required courses');
      return;
    }

    setSubmitting(true);
    try {
      const dishSelections = Object.entries(selections).flatMap(([slotId, dishSet]) =>
        Array.from(dishSet).map(dishId => ({ slotId, dishId }))
      );

      const combinedDateTime = new Date(`${bookingForm.eventDate}T${bookingForm.eventTime}:00`);

      await api.post('/orders', {
        skeletonId,
        dishSelections,
        customerName: user.name,
        phoneNumber: user.phoneNumber,
        customerEmail: user.email,
        eventDate: combinedDateTime.toISOString(),
        eventLocation: bookingForm.eventLocation,
        eventType: bookingForm.eventType,
        headcount: Number(bookingForm.headcount),
        totalAmount: Number(bookingForm.headcount) * (skeleton?.basePrice || 0),
        otherEventDetails: bookingForm.otherEventDetails,
      });

      toast.success('Booking request sent! We\'ll get back to you shortly.');
      router.push('/my-orders');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-400 font-medium text-lg">Loading menu...</div>
    </div>
  );

  if (!skeleton) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-bold text-gray-700">Menu not found</h2>
        <Link href="/" className="text-orange-500 font-bold mt-4 inline-block">← Go Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href={`/events/${categoryId}`} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Back to packages</Link>
            <h1 className="text-xl font-bold text-gray-900">{skeleton.name}</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-gray-900">₹{skeleton.basePrice.toLocaleString()}<span className="text-sm font-normal text-gray-500">/head</span></p>
            <p className="text-xs text-gray-500">{skeleton.minHeadcount}-{skeleton.maxHeadcount || '∞'} guests</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-gray-600 mb-8 text-lg">{skeleton.description}</p>

        {/* Dish Selection Grid */}
        <div className="space-y-8">
          {skeleton.slots.map((slot) => {
            const selected = selections[slot.id] || new Set();
            const isSlotValid = !slot.isRequired || selected.size >= slot.minChoices;

            return (
              <div key={slot.id} className={`bg-white rounded-2xl border ${isSlotValid ? 'border-gray-100' : 'border-orange-300'} shadow-sm p-6`}>
                {/* Slot Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{slot.label}</h3>
                    <p className="text-sm text-gray-500">
                      Pick {slot.minChoices === slot.maxChoices ? slot.minChoices : `${slot.minChoices}-${slot.maxChoices}`} items
                      {!slot.isRequired && <span className="ml-1 text-gray-400">(optional)</span>}
                    </p>
                  </div>
                  <div className={`text-sm font-bold px-3 py-1 rounded-full ${selected.size >= slot.minChoices ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {selected.size}/{slot.maxChoices}
                  </div>
                </div>

                {/* Dish Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {slot.dishes.map(({ dish }) => {
                    const isSelected = selected.has(dish.id);
                    const isDisabled = !isSelected && selected.size >= slot.maxChoices;

                    return (
                      <button
                        key={dish.id}
                        type="button"
                        onClick={() => toggleDish(slot.id, dish.id, slot.maxChoices)}
                        disabled={isDisabled}
                        className={`relative text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50 shadow-md'
                            : isDisabled
                              ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'border-gray-100 bg-white hover:border-orange-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Selection indicator */}
                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>

                        <p className="font-semibold text-gray-900 text-sm pr-6">{dish.name}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`w-2.5 h-2.5 rounded-sm ${dish.isNonVeg ? 'bg-red-500' : 'bg-green-500'}`} />
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide">{dish.cuisine?.replace('_', ' ')}</span>
                          {dish.isPremium && <span className="text-[10px] text-amber-600 font-bold ml-auto">★ Premium</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky Booking Bar */}
        <div className="sticky bottom-0 bg-white border-t shadow-2xl rounded-t-2xl mt-10 p-6 z-20">
          {!showBooking ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{totalSelected} dishes selected across {skeleton.slots.length} courses</p>
                <p className="text-xl font-extrabold text-gray-900">
                  ₹{skeleton.basePrice.toLocaleString()} <span className="text-sm font-normal text-gray-500">× {bookingForm.headcount} guests = </span>
                  <span className="text-orange-600">₹{(skeleton.basePrice * bookingForm.headcount).toLocaleString()}</span>
                </p>
              </div>
              <button
                onClick={() => { if (!isValid()) { toast.error('Please complete all required courses'); return; } setShowBooking(true); }}
                className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                disabled={!isValid()}
              >
                Proceed to Book →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">Event Details</h3>
                <button type="button" onClick={() => setShowBooking(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">← Back to menu</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                  <input required type="date" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                    value={bookingForm.eventDate} onChange={e => setBookingForm({ ...bookingForm, eventDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                  <input required type="time" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                    value={bookingForm.eventTime} onChange={e => setBookingForm({ ...bookingForm, eventTime: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location (Mumbai)</label>
                  <input required type="text" placeholder="e.g. Juhu, Bandra, South Mumbai" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                    value={bookingForm.eventLocation} onChange={e => setBookingForm({ ...bookingForm, eventLocation: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                  <input required type="number" min={skeleton.minHeadcount} max={skeleton.maxHeadcount || undefined} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                    value={bookingForm.headcount} onChange={e => setBookingForm({ ...bookingForm, headcount: Number(e.target.value) })} />
                  <p className="text-[10px] text-orange-600 mt-1">Min: {skeleton.minHeadcount} {skeleton.maxHeadcount && `• Max: ${skeleton.maxHeadcount}`}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes</label>
                  <input type="text" maxLength={25} placeholder="Optional (max 25 chars)" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                    value={bookingForm.otherEventDetails} onChange={e => setBookingForm({ ...bookingForm, otherEventDetails: e.target.value })} />
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl flex justify-between items-center border border-orange-100">
                <span className="text-orange-800 font-bold">Estimated Total:</span>
                <span className="text-xl font-extrabold text-orange-900">₹{(bookingForm.headcount * skeleton.basePrice).toLocaleString()}</span>
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 shadow-lg transition-all active:scale-[0.98]">
                {!user ? 'Login to Continue' : submitting ? 'Sending Request...' : 'Confirm Booking Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
