import api from '@/lib/api';
import MenuList from '@/components/MenuList';
import Link from 'next/link';

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MenusPage({ searchParams }: Props) {
    const resolvedSearchParams = await searchParams;
    const city = typeof resolvedSearchParams.city === 'string' ? resolvedSearchParams.city : 'Mumbai';

    let menus = [];
    try {
        const { data } = await api.get('/menus');

        menus = data
            .filter((menu: any) => menu.caterer?.city?.toLowerCase() === city.toLowerCase())
            .map((menu: any) => ({
                id: menu.id,
                name: menu.name,
                description: menu.description,
                items: menu.items || [], // NEW: Passing the array to the frontend
                pricePerHead: menu.pricePerHead,
                minHeadcount: menu.minHeadcount,
                isNonVeg: menu.isNonVeg,
                catererId: menu.catererId,
                city: menu.caterer?.city,
            }));

    } catch (error) {
        console.error("Failed to fetch menus:", error);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">🍽️</span>
                        <h1 className="text-xl font-bold text-gray-900">CaterMe <span className="text-orange-500">{city}</span></h1>
                    </Link>

                    <div className="text-sm text-gray-500">
                        Showing top menus in <strong>{city}</strong>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {menus.length > 0 ? (
                    <MenuList menus={menus} />
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-bold text-gray-700">No menus found in {city} yet.</h3>
                        <p className="text-gray-500 mt-2">Try checking back later or select a different city.</p>
                        <Link href="/" className="inline-block mt-4 text-orange-500 font-medium hover:underline">
                            ← Go Home
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}