'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function SignupPage() {
    const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '', password: '' });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/customer-auth/signup', formData);
            router.push('/login?msg=Account created! Please login.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold mb-6">Join CaterMe</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSignup} className="space-y-4">
                    <input required type="text" placeholder="Full Name" className="w-full p-3 border rounded-xl"
                        onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <input required type="email" placeholder="Email" className="w-full p-3 border rounded-xl"
                        onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <input required type="tel" placeholder="Phone (Mumbai)" className="w-full p-3 border rounded-xl"
                        onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                    <input required type="password" placeholder="Password" className="w-full p-3 border rounded-xl"
                        onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold">Create Account</button>
                </form>
                <p className="mt-4 text-center text-sm">Already have an account? <Link href="/login" className="text-orange-600 font-bold">Login</Link></p>
            </div>
        </div>
    );
}