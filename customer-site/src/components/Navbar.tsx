'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-2xl">🍽️</span>
                    <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-orange-600 transition-colors">
                        CaterMe <span className="text-orange-500">Mumbai</span>
                    </span>
                </Link>

                {/* Links */}
                <div className="flex items-center gap-6">
                    <Link href="/#events" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
                        Browse Events
                    </Link>
                    <Link href="/menus?city=Mumbai" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
                        Browse Caterers
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-6">
                            <Link href="/my-orders" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
                                My Requests
                            </Link>

                            <div className="flex items-center gap-4 border-l pl-6">
                                <span className="text-sm font-bold text-gray-800">
                                    Hi, {user.name.split(' ')[0]}
                                </span>
                                <button
                                    onClick={logout}
                                    className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/login?redirect=${pathname}`}
                                className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href={`/signup?redirect=${pathname}`}
                                className="bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm"
                            >
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}