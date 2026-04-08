'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function NotificationListener() {
    useEffect(() => {
        // 1. Get the logged-in Caterer's ID
        const catererId = localStorage.getItem('caterer_id');

        // Only connect if they are actually logged in
        if (!catererId) return;

        // 2. Connect to the Radio Tower
        const socket = io(SOCKET_SERVER_URL);

        // 3. Tune into the specific Caterer's channel
        const channelName = `caterer-${catererId}`;
        console.log(`🎧 Caterer tuned into: ${channelName}`);

        // 4. Listen for incoming broadcasts/pings!
        socket.on(channelName, (notification: any) => {
            // Trigger a beautiful Toast notification matching your orange/dark UI
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-black text-white">
                                    {notification.title}
                                </p>
                                <p className="mt-1 text-sm text-slate-300 font-medium line-clamp-2">
                                    {notification.message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-slate-700">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-bold text-orange-500 hover:text-orange-400 hover:bg-slate-800 transition-colors focus:outline-none"
                        >
                            Close
                        </button>
                    </div>
                </div>
            ), { duration: 6000, position: 'top-right' });
        });

        // 5. Cleanup when they leave the dashboard
        return () => {
            socket.disconnect();
        };
    }, []);

    return null; // This runs invisibly in the background
}