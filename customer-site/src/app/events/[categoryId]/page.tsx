import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ categoryId: string }>;
}

async function getCategory(id: string) {
  try {
    const res = await fetch(`http://localhost:3001/event-categories/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export default async function EventCategoryPage({ params }: Props) {
  const { categoryId } = await params;
  const category = await getCategory(categoryId);

  if (!category) return notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="text-gray-400 hover:text-white text-sm font-medium transition-colors mb-4 inline-block">← Back to Events</Link>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{category.icon}</span>
            <div>
              <h1 className="text-4xl font-extrabold">{category.label}</h1>
              <p className="text-gray-400 mt-1 text-lg">{category.description}</p>
            </div>
          </div>
          <p className="text-orange-400 font-bold mt-4">
            {category.skeletons?.length || 0} curated menu packages available
          </p>
        </div>
      </div>

      {/* Skeleton Cards */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        {category.skeletons && category.skeletons.length > 0 ? (
          <div className="space-y-6">
            {category.skeletons.map((skeleton: any) => {
              const totalDishes = skeleton.slots?.reduce((sum: number, s: any) => sum + (s._count?.dishes || s.dishes?.length || 0), 0) || 0;
              const slotCount = skeleton.slots?.length || 0;

              return (
                <div key={skeleton.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    {/* Left: Info */}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{skeleton.name}</h2>
                      <p className="text-gray-500 mb-4">{skeleton.description}</p>

                      {/* Slot summary pills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {skeleton.slots?.map((slot: any) => (
                          <span key={slot.id} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium">
                            {slot.label} ({slot.minChoices}-{slot.maxChoices})
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">👥 {skeleton.minHeadcount}-{skeleton.maxHeadcount || '∞'} guests</span>
                        <span className="flex items-center gap-1">🍽️ {slotCount} courses</span>
                        <span className="flex items-center gap-1">📋 {totalDishes} dishes to choose from</span>
                      </div>
                    </div>

                    {/* Right: Price & CTA */}
                    <div className="text-right md:min-w-[200px]">
                      <div className="mb-4">
                        <p className="text-3xl font-extrabold text-gray-900">₹{skeleton.basePrice.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">per person</p>
                      </div>
                      <Link
                        href={`/events/${categoryId}/${skeleton.id}`}
                        className="inline-block w-full md:w-auto bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg active:scale-95 text-center"
                      >
                        Customize & Book →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📋</p>
            <h3 className="text-xl font-bold text-gray-700">No packages available yet</h3>
            <p className="text-gray-500 mt-2">Our team is working on curating the perfect menus for this category.</p>
            <Link href="/" className="inline-block mt-6 text-orange-500 font-bold hover:underline">← Browse Other Events</Link>
          </div>
        )}
      </main>
    </div>
  );
}
