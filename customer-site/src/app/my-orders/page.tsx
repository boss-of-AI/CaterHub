"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";

export default function MyOrdersPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const router = useRouter();

    const handleCheckout = async (orderId: string) => {
        setCheckoutLoading(true);
        try {
            const res = await api.post(`/orders/${orderId}/checkout`);
            const paymentOptions = res.data;

            const options = {
                key: paymentOptions.keyId,
                amount: paymentOptions.amount,
                currency: paymentOptions.currency,
                name: "CaterMe Professionals",
                description: paymentOptions.description,
                order_id: paymentOptions.razorpayOrderId,
                handler: async function (response: any) {
                    try {
                        await api.post(`/orders/${orderId}/verify-payment`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        alert("Payment successful! Your order has been confirmed.");
                        
                        // Refetch orders
                        setLoading(true);
                        const ordersRes = await api.get("/orders/my-orders");
                        setOrders(ordersRes.data);
                        setLoading(false);
                    } catch (err) {
                        console.error('Payment verification failed:', err);
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: paymentOptions.customerName,
                    email: paymentOptions.customerEmail,
                    contact: paymentOptions.customerPhone,
                },
                theme: {
                    color: "#f97316"
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                console.error("Payment failed", response.error);
                alert("Payment failed: " + response.error.description);
            });
            rzp.open();

        } catch (err) {
            console.error("Checkout failed:", err);
            alert("Failed to initiate checkout. Please try again.");
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handlePdfDownload = async (orderId: string) => {
        try {
            const res = await api.get(`/orders/${orderId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `booking-${orderId.split('-')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("PDF Download error", error);
            alert("Failed to download PDF.");
        }
    };

    useEffect(() => {
        if (user) {
            api.get("/orders/my-orders")
                .then((res) => setOrders(res.data))
                .catch((err) => {
                    console.error("Error fetching orders:", err);
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
        <div className="min-h-screen bg-gray-50 pb-20">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
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
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                order.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                order.status === 'AWAITING_PAYMENT' ? 'bg-indigo-100 text-indigo-700' :
                                                order.status === 'BROADCASTED' ? 'bg-blue-100 text-blue-700' :
                                                'bg-orange-100 text-orange-700'
                                                }`}>
                                                {order.status === 'AWAITING_PAYMENT' ? 'PAYMENT DUE' : order.status}
                                            </span>
                                            <span className="text-gray-400 text-xs font-bold">ID: {order.id.split('-')[0]}</span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900">{order.menu?.name}</h3>

                                        {/* White-Label: Do not show caterer name */}
                                        <p className="text-gray-500 text-sm mt-1">
                                            <span className="font-semibold text-gray-700">
                                                CaterMe Professionals
                                            </span>
                                            {" "} • {order.eventLocation}
                                        </p>
                                    </div>

                                    <div className="md:text-right w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 flex flex-col justify-between items-center md:items-end gap-3">
                                        <div className="text-left md:text-right w-full flex justify-between md:flex-col">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Event Schedule</p>
                                                <p className="font-bold text-gray-800">{formattedDate}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mb-0.5">Estimated Total</p>
                                                <p className="text-gray-900 font-black text-xl">₹{order.totalAmount?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        
                                        {order.status === 'AWAITING_PAYMENT' && order.confirmationFee && (
                                            <button 
                                                onClick={() => handleCheckout(order.id)}
                                                disabled={checkoutLoading}
                                                className="w-full md:w-auto mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                Pay Advance: ₹{order.confirmationFee.toLocaleString()}
                                            </button>
                                        )}

                                        {order.status === 'CONFIRMED' && (
                                            <button 
                                                onClick={() => handlePdfDownload(order.id)}
                                                className="w-full md:w-auto mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                                            >
                                                📄 Download PDF
                                            </button>
                                        )}
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