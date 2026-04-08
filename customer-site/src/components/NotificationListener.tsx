'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function NotificationListener() {
    const { user } = useAuth();

    useEffect(() => {
        // Only connect if a customer is logged in
        if (!user || !user.id) return;

        // 1. Connect to the Radio Tower
        const socket = io(SOCKET_SERVER_URL);

        // 2. Tune into the specific customer's channel
        const channelName = `customer-${user.id}`;
        console.log(`🎧 Customer tuned into: ${channelName}`);

        // 3. Listen for broadcasts
        socket.on(channelName, (notification: any) => {
            // 4. Trigger the custom Tailwind Toast!
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-black text-gray-900">
                                    {notification.title}
                                </p>
                                <p className="mt-1 text-sm text-gray-500 font-medium">
                                    {notification.message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-gray-100">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-bold text-orange-600 hover:text-orange-500 hover:bg-orange-50 transition-colors focus:outline-none"
                        >
                            Close
                        </button>
                    </div>
                </div>
            ), { duration: 6000, position: 'top-right' });
        });

        // 5. Cleanup when they log out or leave
        return () => {
            socket.disconnect();
        };
    }, [user]);

    return null; // Invisible background component
}