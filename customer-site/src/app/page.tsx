import Link from 'next/link';

// Fetch event categories from backend
async function getEventCategories() {
  try {
    const res = await fetch('http://localhost:3001/event-categories', { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

// Fetch a few legacy menus for the secondary section
async function getFeaturedMenus() {
  try {
    const res = await fetch('http://localhost:3001/menus', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.filter((m: any) => m.caterer?.city?.trim().toLowerCase() === 'mumbai').slice(0, 3);
  } catch { return []; }
}

export default async function Home() {
  const [categories, featuredMenus] = await Promise.all([getEventCategories(), getFeaturedMenus()]);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[85vh] flex items-center justify-center bg-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070"
            className="w-full h-full object-cover opacity-40"
            alt="Catering Mumbai"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/20 to-gray-900/80" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-orange-400 font-bold tracking-widest uppercase text-sm mb-4">Mumbai&apos;s #1 Catering Platform</p>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            What are you <span className="text-orange-500">celebrating?</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-medium">
            Choose your event type, customize your dream menu, and let Mumbai&apos;s top caterers bring it to life.
          </p>

          <a href="#events" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all shadow-xl hover:shadow-orange-500/25 hover:scale-[1.02] active:scale-95">
            Explore Menus ↓
          </a>
        </div>
      </div>

      {/* Event Categories Grid */}
      <section id="events" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900">Pick Your Event</h2>
            <p className="text-gray-500 mt-3 text-lg">Select an event type to browse curated menu packages</p>
            <div className="h-1 w-16 bg-orange-500 mx-auto mt-4 rounded-full" />
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/events/${cat.id}`}
                  className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 hover:-translate-y-1 text-center"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{cat.label}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{cat.description}</p>
                  {cat._count?.skeletons > 0 && (
                    <span className="inline-block mt-3 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                      {cat._count.skeletons} packages
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">Loading event categories...</p>
          )}
        </div>
      </section>

      {/* Secondary: Browse by Caterer (legacy menus) */}
      {featuredMenus.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-1">Or Browse by Caterer</p>
                <h2 className="text-3xl font-bold text-gray-900">Popular in Mumbai</h2>
                <div className="h-1 w-12 bg-orange-500 mt-2 rounded-full" />
              </div>
              <Link href="/menus?city=Mumbai" className="text-orange-500 font-bold hover:text-orange-600 transition-colors">
                View All →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredMenus.map((menu: any) => (
                <Link key={menu.id} href={`/menus?city=Mumbai`} className="group block bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${menu.isNonVeg ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {menu.isNonVeg ? 'Non-Veg' : 'Veg'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">{menu.name}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{menu.description}</p>
                  <p className="mt-4 text-xl font-extrabold text-gray-900">₹{menu.pricePerHead}<span className="text-sm font-normal text-gray-500">/head</span></p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why CaterMe */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Why Mumbai Trusts CaterMe</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="p-6">
              <div className="text-5xl mb-4">🍛</div>
              <h3 className="text-xl font-bold mb-2">Local Flavors</h3>
              <p className="text-gray-400">From Maharashtrian feasts to global fusion. 120+ dishes curated from Mumbai&apos;s top caterers.</p>
            </div>
            <div className="p-6">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-2">Verified Quality</h3>
              <p className="text-gray-400">Every caterer is hand-picked after a strict kitchen audit. Your food, our guarantee.</p>
            </div>
            <div className="p-6">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Customise & Book</h3>
              <p className="text-gray-400">Pick your event, customize every dish, and get quotes instantly. No long calls.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}