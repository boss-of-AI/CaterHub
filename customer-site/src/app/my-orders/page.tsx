"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyOrdersPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            api.get("/orders/my-orders")
                .then((res) => setOrders(res.data))
                .catch((err) => {
                    console.error("Error fetching orders:", err);
                    // If token is invalid/expired, force a logout
                    if (err.response?.status === 401) {
                        if (logout) logout();
                        router.push('/login');
                    }
                })
                .finally(() => setLoading(false));
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading, router, logout]);

    if (authLoading || loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-pulse text-gray-400 font-medium">Fetching your Mumbai feast details...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-bold text-gray-800">Please Login</h2>
                <p className="text-gray-500 mt-2 mb-6">You need to be logged in to view your catering requests.</p>
                <Link href="/login" className="btn-primary px-8 py-3 rounded-xl bg-orange-500 text-white font-bold">Login Now</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black text-gray-900 mb-8">My Catering Requests</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                        <span className="text-5xl block mb-4">🍱</span>
                        <h3 className="text-xl font-bold text-gray-800">No requests yet</h3>
                        <p className="text-gray-500 mt-2 mb-6">Your catering bookings for Mumbai events will appear here.</p>
                        <Link href="/menus?city=Mumbai" className="text-orange-500 font-bold hover:underline">
                            Explore Menus →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order: any) => {
                            // Format Date & Time
                            const eventDateObj = new Date(order.eventDate);
                            const formattedDate = eventDateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                            const formattedTime = eventDateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

                            return (
                                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'ASSIGNED' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'BROADCASTED' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-orange-100 text-orange-700'
                                                }`}>
                                                {order.status === 'ASSIGNED' ? 'CONFIRMED' : order.status}
                                            </span>
                                            <span className="text-gray-400 text-xs font-bold">ID: {order.id.split('-')[0]}</span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900">{order.menu?.name}</h3>

                                        {/* Updated to show the Final Caterer and the Location */}
                                        <p className="text-gray-500 text-sm mt-1">
                                            <span className="font-semibold text-gray-700">
                                                {order.finalCaterer?.name || "Looking for the best caterer..."}
                                            </span>
                                            {" "} • {order.eventLocation}
                                        </p>
                                    </div>

                                    <div className="md:text-right w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 flex justify-between md:flex-col items-center md:items-end">
                                        <div className="text-left md:text-right">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Event Schedule</p>
                                            <p className="font-bold text-gray-800">{formattedDate}</p>
                                            <p className="text-xs font-bold text-orange-600">{formattedTime}</p>
                                        </div>
                                        <div className="md:mt-2 text-right">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mb-0.5">Estimated Total</p>
                                            <p className="text-gray-900 font-black text-xl">₹{order.totalAmount?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}