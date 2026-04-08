"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';

export default function CatererLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('caterer_token');
    if (token) router.replace('/dashboard');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const response = await api.post('/caterer-auth/login', { username, password });
      if (response.data.access_token) {
        localStorage.setItem('caterer_token', response.data.access_token);
        localStorage.setItem('caterer_id', response.data.caterer.id);
        localStorage.setItem('caterer_name', response.data.caterer.name);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      if (err.response?.status === 401) setError('Incorrect username or password.');
      else setError('Server connection error. Is the backend running?');
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md border border-orange-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic">caterme<span className="text-orange-500">.</span></h1>
          <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-widest">Mumbai Partner Portal</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium text-center">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="Username" className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all outline-none text-black font-bold" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
          <input type="password" placeholder="Password" className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all outline-none text-black font-bold" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          <button type="submit" disabled={isSubmitting} className={`w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-orange-600 transition-all active:scale-95 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isSubmitting ? 'Verifying...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
