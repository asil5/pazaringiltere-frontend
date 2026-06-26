import ListingCard from '@/components/ListingCard';
import SearchBar from '@/components/SearchBar';
import CategorySidebar from '@/components/CategorySidebar';

const BASE = process.env.NEXT_PUBLIC_API_URL!;

interface Listing {
  id: string; title: string; pricePence: number;
  locationCity: string; images: string[];
}
interface Category {
  id: string; name: string; slug: string;
  icon: string | null; parentId: string | null; level: number;
}

async function getListings(params: Record<string, string>) {
  try {
    const r = await fetch(`${BASE}/api/listings?${new URLSearchParams(params)}`, { next: { revalidate: 60 } });
    return r.ok ? r.json() : { listings: [], total: 0 };
  } catch { return { listings: [], total: 0 }; }
}

async function getCategories(): Promise<Category[]> {
  try {
    const r = await fetch(`${BASE}/api/categories`, { next: { revalidate: 300 } });
    return r.ok ? r.json() : [];
  } catch { return []; }
}

export default async function HomePage({
  searchParams,
}: { searchParams: Promise<{ q?: string; city?: string; category?: string }> }) {
  const sp = await searchParams;
  const isSearch = !!(sp.q || sp.city || sp.category);

  const [categories, main, featured, urgent] = await Promise.all([
    getCategories(),
    getListings({
      ...(sp.q ? { q: sp.q } : {}),
      ...(sp.city ? { city: sp.city } : {}),
      ...(sp.category ? { category: sp.category } : {}),
      limit: '24',
    }),
    !isSearch ? getListings({ featured: 'true', limit: '6' }) : Promise.resolve({ listings: [] }),
    !isSearch ? getListings({ urgent: 'true', limit: '6' })   : Promise.resolve({ listings: [] }),
  ]);

  const activeCategory = categories.find(c => c.slug === sp.category);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Arama */}
      <div className="mb-6">
        <SearchBar defaultQ={sp.q} defaultCity={sp.city} />
      </div>

      <div className="flex gap-5">
        {/* Sol sidebar — kategoriler */}
        <CategorySidebar categories={categories} />

        {/* Ana içerik */}
        <div className="flex-1 min-w-0">

          {/* Başlık */}
          <div className="mb-4">
            {activeCategory ? (
              <h1 className="text-xl font-bold">
                {activeCategory.icon} {activeCategory.name}
                <span className="text-sm font-normal ml-2" style={{ color: 'var(--muted)' }}>
                  {main.total} ilan
                </span>
              </h1>
            ) : isSearch ? (
              <h1 className="text-xl font-bold">
                Arama sonuçları
                <span className="text-sm font-normal ml-2" style={{ color: 'var(--muted)' }}>
                  {main.total} ilan
                </span>
              </h1>
            ) : (
              <h1 className="text-xl font-bold">
                İngiltere&apos;de Türkçe Alışveriş
                <span className="text-sm font-normal ml-2" style={{ color: 'var(--muted)' }}>
                  {main.total > 0 ? `${main.total} ilan` : ''}
                </span>
              </h1>
            )}
          </div>

          {/* Vitrin İlanlar */}
          {!isSearch && featured.listings.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold flex items-center gap-1.5">
                  <span>⭐</span> Vitrin İlanlar
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {featured.listings.map((l: Listing) => (
                  <div key={l.id} className="relative">
                    <div className="absolute top-2 left-2 z-10 text-xs font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ background: '#7c3aed' }}>⭐ Vitrin</div>
                    <ListingCard listing={l} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Acil İlanlar */}
          {!isSearch && urgent.listings.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold flex items-center gap-1.5">
                  <span>🔴</span> Acil İlanlar
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {urgent.listings.map((l: Listing) => (
                  <div key={l.id} className="relative">
                    <div className="absolute top-2 left-2 z-10 text-xs font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ background: '#dc2626' }}>🔴 Acil</div>
                    <ListingCard listing={l} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* İlan grid */}
          <section>
            {(featured.listings.length > 0 || urgent.listings.length > 0) && !isSearch && (
              <h2 className="font-semibold mb-3">Son İlanlar</h2>
            )}

            {main.listings.length === 0 ? (
              <div className="text-center py-20 rounded-xl border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                <p className="text-4xl mb-3">📦</p>
                <p>{isSearch ? 'Sonuç bulunamadı' : 'Henüz ilan yok — ilk ilanı sen ver!'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {main.listings.map((l: Listing) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
