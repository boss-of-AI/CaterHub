import React, { useState, useEffect } from 'react';
import { broadcastOrder } from '../api/axios';

interface Caterer {
    id: string;
    name: string;
}

interface Selection {
    catererId: string;
    name: string;
    adminSetPrice: number;
}

interface BroadcastModalProps {
    order: any;
    allCaterers: Caterer[];
    onClose: () => void;
    onRefresh: () => void;
}

export default function BroadcastModal({ order, allCaterers, onClose, onRefresh }: BroadcastModalProps) {
    const [selections, setSelections] = useState<Selection[]>([]);

    useEffect(() => {
        const originalId = order.menu?.catererId;
        const menuPrice = order.menu?.pricePerHead || 0;
        const originalCat = allCaterers.find(c => c.id === originalId);

        if (originalCat) {
            setSelections([{
                catererId: originalCat.id,
                name: originalCat.name,
                adminSetPrice: menuPrice
            }]);
        }
    }, [order, allCaterers]);

    const handleCheck = (caterer: Caterer, isChecked: boolean) => {
        const menuPrice = order.menu?.pricePerHead || 0;
        if (isChecked) {
            setSelections(prev => [
                ...prev,
                { catererId: caterer.id, name: caterer.name, adminSetPrice: menuPrice }
            ]);
        } else {
            setSelections(prev => prev.filter(s => s.catererId !== caterer.id));
        }
    };

    const updatePrice = (catererId: string, price: string) => {
        const val = price === '' ? 0 : Number(price);
        setSelections(prev => prev.map(s =>
            s.catererId === catererId ? { ...s, adminSetPrice: val } : s
        ));
    };

    const handleSend = async () => {
        if (selections.length === 0) return alert("Select at least one caterer");
        try {
            await broadcastOrder(order.id, selections.map(({ catererId, adminSetPrice }) => ({
                catererId,
                adminSetPrice
            })));
            onRefresh();
            onClose();
        } catch (err) {
            alert("Failed to broadcast order");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">

                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900">Broadcast Order</h2>
                    <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase">Ref: {order.id}</p>
                </div>

                <div className="p-8 space-y-4 max-h-[50vh] overflow-y-auto">
                    {allCaterers.map((cat) => {
                        const selection = selections.find(s => s.catererId === cat.id);
                        const isSelected = !!selection;

                        return (
                            <div key={cat.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white'}`}>
                                <label className="flex items-center gap-4 cursor-pointer flex-1">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-orange-500 rounded-md"
                                        checked={isSelected}
                                        onChange={(e) => handleCheck(cat, e.target.checked)}
                                    />
                                    <span className={`text-base font-bold ${isSelected ? 'text-orange-950' : 'text-gray-700'}`}>
                                        {cat.name}
                                    </span>
                                </label>

                                {isSelected && (
                                    <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
                                        <span className="text-gray-500 text-sm font-bold mr-2">₹</span>
                                        <input
                                            type="number"
                                            // Manual black color to override any global CSS issues
                                            className="w-24 text-base font-bold text-black focus:outline-none bg-white"
                                            style={{ color: 'black', backgroundColor: 'white' }}
                                            value={selection.adminSetPrice || ''}
                                            onChange={(e) => updatePrice(cat.id, e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                    <button
                        onClick={handleSend}
                        disabled={selections.length === 0}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold text-white shadow-lg ${selections.length > 0 ? 'bg-orange-500' : 'bg-gray-300'}`}
                    >
                        Broadcast ({selections.length})
                    </button>
                </div>
            </div>
        </div>
    );
}