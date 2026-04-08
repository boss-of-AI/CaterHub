// caterer-site/src/app/settings/page.tsx
"use client";
import React, { useState } from 'react';
import api from '@/api/axios';
import { Lock, CheckCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function Settings() {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) return alert("New passwords do not match!");

        setLoading(true);
        try {
            await api.patch('/caterer-auth/update-password', {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            });
            alert("Password updated successfully!");
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            alert(err.response?.data?.message || "Error updating password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-md mx-auto">
                <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 font-bold transition-all">
                    <ChevronLeft size={20} /> Back to Dashboard
                </Link>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Security</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Change your portal password</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Current Password</label>
                            <input
                                type="password" required className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none transition-all font-bold"
                                value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">New Password</label>
                            <input
                                type="password" required className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none transition-all font-bold"
                                value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Confirm New Password</label>
                            <input
                                type="password" required className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-orange-500 outline-none transition-all font-bold"
                                value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-5 bg-slate-900 text-white rounded-[1.2rem] font-black text-lg hover:bg-orange-500 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
                        >
                            {loading ? "Updating..." : <><Lock size={20} /> Update Password</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}