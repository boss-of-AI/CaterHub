"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/api/axios';
import { LogOut, ShieldCheck } from 'lucide-react';

export default function MyMenus() {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchMenus = async () => {
            const catererId = localStorage.getItem('caterer_id');
            if (!catererId) {
                router.replace('/');
                return;
            }

            try {
                // Fetch all menus from the backend
                const res = await api.get('/menus');

                // STRICT FILTER: Only keep the menus where the catererId matches the logged-in user
                const myOwnMenus = res.data.filter((menu: any) => menu.catererId === catererId);

                setMenus(myOwnMenus);
            } catch (err) {
                console.error("Error fetching menus", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMenus();
    }, [router]);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            window.location.href = '/';
        }
    };

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
                    <Link href="/dashboard" className="font-bold text-gray-400 hover:text-gray-900 pb-2 px-2 transition-colors">
                        Incoming Jobs
                    </Link>
                    <Link href="/my-menus" className="font-black text-orange-500 border-b-4 border-orange-500 pb-2 px-2">
                        My Menus
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                ) : menus.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold text-lg">No menus assigned to you yet.</p>
                        <p className="text-slate-400 text-sm mt-2">Contact the Admin to add your menus to the platform.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {menus.map((menu: any) => (
                            <div key={menu.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-black text-slate-800">{menu.name}</h3>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${menu.isNonVeg ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            {menu.isNonVeg ? 'Non-Veg' : 'Veg'}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 mb-4">{menu.description}</p>

                                    <div className="flex flex-wrap gap-2">
                                        {menu.items?.map((item: string, i: number) => (
                                            <span key={i} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-lg">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right w-full md:w-auto bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Standard Rate</p>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{menu.pricePerHead}</p>
                                    <p className="text-xs text-slate-500 font-bold">Min. {menu.minHeadcount} Guests</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}