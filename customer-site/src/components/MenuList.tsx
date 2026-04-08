'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BookingModal from './BookingModal';
import Cookies from 'js-cookie';

function MenuContent({ menus }: { menus: any[] }) {
    const [selectedMenu, setSelectedMenu] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        // 1. Determine Auth Status
        const token = Cookies.get('token') || localStorage.getItem('token');
        setIsAuthenticated(!!token);

        // 2. THE AUTO-OPEN LOGIC
        // If we returned from login, the URL will have ?menuId=...
        const targetId = searchParams.get('menuId');
        if (targetId) {
            const autoMenu = menus.find(m => m.id === targetId);
            if (autoMenu) {
                setSelectedMenu(autoMenu);

                // Clean URL parameters so refresh doesn't keep popping the modal
                // This keeps the user on /menus but removes the ?menuId=... from the address bar
                const newRelativePathQuery = window.location.pathname;
                window.history.replaceState(null, '', newRelativePathQuery);
            }
        }
    }, [searchParams, menus]);

    return (
        <>
            <div className="grid gap-8">
                {menus.map((menu) => (
                    <div key={menu.id} className="border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 shadow-sm hover:shadow-md transition-all">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-800">{menu.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded font-semibold ${menu.isNonVeg ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {menu.isNonVeg ? 'Non-Veg' : 'Veg'}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-4 max-w-lg">{menu.description}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {menu.items?.map((item: string, i: number) => (
                                    <span key={i} className="bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-lg shadow-sm">
                                        {item}
                                    </span>
                                ))}
                            </div>

                            <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                <span>👥</span> Min. Guests: {menu.minHeadcount}
                            </p>
                        </div>

                        <div className="text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0">
                            <div className="mb-4">
                                <span className="text-2xl font-bold text-gray-900">₹{menu.pricePerHead}</span>
                                <span className="text-gray-500 text-sm"> / person</span>
                            </div>
                            <button
                                onClick={() => setSelectedMenu(menu)}
                                className="w-full md:w-auto bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md active:scale-95"
                            >
                                Check Availability
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedMenu && (
                <BookingModal
                    catererId={selectedMenu.catererId}
                    menuId={selectedMenu.id}
                    menuName={selectedMenu.name}
                    pricePerHead={selectedMenu.pricePerHead}
                    minHeadcount={selectedMenu.minHeadcount}
                    isAuthenticated={isAuthenticated}
                    onClose={() => setSelectedMenu(null)}
                />
            )}
        </>
    );
}

export default function MenuList({ menus }: { menus: any[] }) {
    return (
        <Suspense fallback={
            <div className="flex justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        }>
            <MenuContent menus={menus} />
        </Suspense>
    );
}