import Link from 'next/link';

interface CatererProps {
  id: string;         // This is the Menu ID
  name: string;       // This is the Menu Name (e.g., "Coastal Lover")
  city: string;
  index: number;      // Used for the "Caterer #1" label
  pricePerHead: number;
  description?: string | null;
  isNonVeg: boolean;
}

export default function CatererCard({
  id,
  name,
  city,
  index,
  pricePerHead,
  description,
  isNonVeg
}: CatererProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            {/* Anonymous Branding */}
            <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-1">
              Mumbai Caterer #{index + 1}
            </h3>
            <h4 className="text-xl font-bold text-gray-900">{name}</h4>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${isNonVeg ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
            {isNonVeg ? 'Non-Veg' : 'Pure Veg'}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description || "Authentic flavors curated for your special event in Mumbai."}
        </p>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
          <div>
            <span className="text-2xl font-bold text-gray-900">₹{pricePerHead}</span>
            <span className="text-gray-500 text-xs ml-1">/ plate</span>
          </div>
          <Link
            href={`/menus/${id}`}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}