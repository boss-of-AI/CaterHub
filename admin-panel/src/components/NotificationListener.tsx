import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_SERVER_URL = 'http://localhost:3001'; // Update this when deploying!

export default function NotificationListener() {
    useEffect(() => {
        // Only connect if the admin is logged in
        const token = localStorage.getItem("caterme_token");
        if (!token) return;

        // 1. Connect to the Radio Tower
        const socket = io(SOCKET_SERVER_URL);

        console.log("🎧 Admin tuned into: admin-alerts channel");

        // 2. Listen for Admin specific broadcasts
        socket.on('admin-alerts', (notification: any) => {

            // 3. Trigger a beautiful Toast notification (Without Tailwind!)
            toast((t) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '250px' }}>
                    <b style={{ fontSize: '15px', color: '#1f2937' }}>
                        {notification.title}
                    </b>
                    <span style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.4' }}>
                        {notification.message}
                    </span>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                            marginTop: '8px', padding: '4px 0', border: 'none', background: 'transparent',
                            color: '#f97316', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left', fontSize: '12px'
                        }}
                    >
                        Dismiss
                    </button>
                </div>
            ), {
                duration: 6000,
                position: 'top-right',
                style: { border: '1px solid #f97316', padding: '16px', borderRadius: '12px' }
            });
        });

        // 4. Cleanup on unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    return null; // This runs invisibly in the background
}