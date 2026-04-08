"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const msg = searchParams.get("msg");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);

            // --- STATE PRESERVATION LOGIC ---
            const redirectTo = searchParams.get("redirect");
            const menuId = searchParams.get("menuId");

            if (redirectTo && menuId) {
                // Return to menus and trigger the specific menu modal
                router.push(`${redirectTo}?menuId=${menuId}`);
            } else if (redirectTo) {
                // Return to whatever page they were on
                router.push(redirectTo);
            } else {
                // Fallback to home
                router.push("/");
            }

            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid email or password");
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
                    <p className="text-gray-500 mt-2">Login to manage your bookings</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            required
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        {/* Preserve the redirect and menuId for signup as well */}
                        <Link
                            href={`/signup?${searchParams.toString()}`}
                            className="font-bold text-orange-600 hover:text-orange-500"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}