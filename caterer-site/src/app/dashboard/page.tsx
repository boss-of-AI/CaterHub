"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { MapPin, Utensils, CheckCircle, LogOut, ShieldCheck, XCircle, Phone, Clock, Calendar } from 'lucide-react';

export default function CatererDashboard() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(true);
    const [myId, setMyId] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('ALL');
    const router = useRouter();

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const token = localStorage.getItem('caterer_token');
            const catererId = localStorage.getItem('caterer_id');
            setMyId(catererId);

            if (!token) {
                router.replace('/');
                return;
            }

            setIsVerifying(false);

            try {
                setLoading(true);
                const res = await api.get(`/orders/my-invitations${filter !== 'ALL' ? `?status=${filter}` : ''}`);
                setJobs(res.data);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    localStorage.clear();
                    router.replace('/');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetch();
    }, [router, filter]);

    const handleAccept = async (orderId: string) => {
        try {
            await api.patch(`/orders/${orderId}/accept`);
            toast.success('Interest sent! Waiting for admin to pick the winner.');
            const res = await api.get('/orders/my-invitations');
            setJobs(res.data);
        } catch (err) {
            toast.error('Error accepting job. Please try again.');
        }
    };

    const handleReject = async (orderId: string) => {
        if (!window.confirm('Are you sure you want to decline this job?')) return;
        try {
            await api.patch(`/orders/${orderId}/reject`);
            toast.success('Job declined.');
            const res = await api.get('/orders/my-invitations');
            setJobs(res.data);
        } catch (err) {
            toast.error('Error declining job.');
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            window.location.href = '/';
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse font-black text-orange-500 tracking-tighter text-2xl">caterme.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans text-slate-900">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Partner Dashboard</h1>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mt-1">
                            Mumbai Market Activity
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/settings">
                            <button className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-slate-400 hover:text-orange-500 transition-all hover:scale-105 active:scale-95">
                                <ShieldCheck size={24} />
                            </button>
                        </Link>
                        <button onClick={handleLogout} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-slate-400 hover:text-red-500 transition-all hover:scale-105 active:scale-95">
                            <LogOut size={24} />
                        </button>
                    </div>
                </header>

                {/* Navigation Tabs */}
                <div className="flex gap-6 mb-8 border-b border-gray-200">
                    <Link href="/dashboard" className="font-black text-slate-800 border-b-4 border-slate-800 pb-2 px-2 transition-colors">
                        Incoming Jobs
                    </Link>
                    <Link href="/my-menus" className="font-bold text-gray-400 hover:text-gray-900 pb-2 px-2 transition-colors">
                        My Menus
                    </Link>
                </div>

                {/* Sub-Filters */}
                <div className="flex gap-2 mb-6">
                    {['ALL', 'PENDING', 'ACCEPTED', 'WON'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === f ? 'bg-orange-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            {f === 'ALL' ? 'All Jobs' : f === 'PENDING' ? 'New Requests' : f === 'ACCEPTED' ? 'Waiting for Admin' : 'Won Jobs'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                        <p className="font-bold text-slate-400">Loading your feed...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold text-lg">No active shouting at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {jobs.map((job: any) => {
                            const myAssignment = job.possibleCaterers?.[0];
                            const isWinner = job.status === 'ASSIGNED' && job.finalCatererId === myId;
                            const isLoser = (job.status === 'ASSIGNED' && job.finalCatererId !== myId) || myAssignment?.status === 'REJECTED';
                            const hasAcceptedButWaiting = myAssignment?.status === 'ACCEPTED' && job.status === 'BROADCASTED';

                            // Format Date and Time properly
                            const eventDateObj = new Date(job.eventDate);
                            const formattedDate = eventDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                            const formattedTime = eventDateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

                            return (
                                <div key={job.id} className={`bg-white p-8 rounded-[2rem] shadow-sm border transition-all ${isWinner ? 'border-green-500 ring-4 ring-green-50' : 'border-slate-100'}`}>

                                    {/* Top Row: Meta Info & Payout */}
                                    <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
                                        <div>
                                            <span className="text-[10px] font-black px-3 py-1 rounded-md bg-slate-100 text-slate-500 uppercase tracking-widest mr-2">
                                                UID: {job.id.substring(0, 6)}
                                            </span>
                                            <span className="text-[10px] font-black px-3 py-1 rounded-md bg-orange-50 text-orange-600 uppercase tracking-widest">
                                                {job.eventType}
                                            </span>

                                            <div className="mt-4">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                                                <p className="text-xl font-black text-slate-800">{job.customer?.name}</p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Admin Payout</p>
                                            <p className="text-3xl font-black text-green-600 tracking-tighter">₹{job.adminSetPrice}</p>
                                        </div>
                                    </div>

                                    {/* Middle Row: Event Details & Menu */}
                                    <div className="grid md:grid-cols-2 gap-8 mb-8">

                                        {/* Event Logistics */}
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3 text-slate-700">
                                                <Calendar className="text-orange-500 mt-1" size={20} />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                                                    <p className="font-bold">{formattedDate}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 text-slate-700">
                                                <Clock className="text-orange-500 mt-1" size={20} />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">Time</p>
                                                    <p className="font-bold">{formattedTime}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 text-slate-700">
                                                <MapPin className="text-orange-500 mt-1" size={20} />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
                                                    <p className="font-bold">{job.eventLocation}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 text-slate-700">
                                                <Utensils className="text-orange-500 mt-1" size={20} />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">Headcount</p>
                                                    <p className="font-bold">{job.headcount} Guests</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Details */}
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Requested Menu</p>
                                            <p className="text-lg font-black text-slate-800">{job.menu?.name || job.skeleton?.name}</p>
                                            <p className="text-sm text-slate-500 mt-1 mb-4 italic">{job.menu?.description || job.skeleton?.description}</p>

                                            <div className="flex flex-wrap gap-2">
                                                {/* Legacy menu items */}
                                                {job.menu?.items?.map((item: string, idx: number) => (
                                                    <span key={idx} className="bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-2 py-1 rounded-md shadow-sm">
                                                        {item}
                                                    </span>
                                                ))}
                                                {/* Skeleton dish selections */}
                                                {job.dishSelections?.map((ds: any) => (
                                                    <span key={ds.id} className="bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-2 py-1 rounded-md shadow-sm">
                                                        {ds.dish?.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons / Status */}
                                    {isWinner ? (
                                        <div className="bg-green-600 p-6 rounded-2xl text-white">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle size={24} />
                                                    <p className="font-black text-xl uppercase italic">Order Won!</p>
                                                </div>
                                                <a href={`tel:${job.customer?.phoneNumber}`} className="flex items-center gap-2 bg-white text-green-700 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg">
                                                    <Phone size={18} />
                                                    Call {job.customer?.phoneNumber}
                                                </a>
                                            </div>
                                        </div>
                                    ) : isLoser ? (
                                        <div className="bg-slate-100 p-5 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-slate-400 font-bold">
                                            <XCircle size={20} />
                                            Order assigned to another partner.
                                        </div>
                                    ) : hasAcceptedButWaiting ? (
                                        <div className="w-full py-4 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl font-black flex items-center justify-center gap-3">
                                            <div className="animate-pulse bg-orange-400 h-2 w-2 rounded-full"></div>
                                            Interest Sent - Awaiting Selection
                                        </div>
                                    ) : (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleAccept(job.id)}
                                                className="flex-1 py-4 bg-slate-900 text-white rounded-[1.2rem] font-black text-lg hover:bg-orange-500 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
                                            >
                                                <CheckCircle size={20} />
                                                Accept @ ₹{job.adminSetPrice}/head
                                            </button>
                                            <button
                                                onClick={() => handleReject(job.id)}
                                                className="px-6 py-4 bg-white text-red-500 border-2 border-red-200 rounded-[1.2rem] font-black text-lg hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={20} />
                                                Decline
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}