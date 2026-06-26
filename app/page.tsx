import ListingCard from '@/components/ListingCard';
import SearchBar from '@/components/SearchBar';

const BASE = process.env.NEXT_PUBLIC_API_URL!;

interface Listing {
  id: string;
  title: string;
  pricePence: number;
  locationCity: string;
  images: string[];
  createdAt: string;
  featured?: boolean;
  urgent?: boolean;
}

async function getListings(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  try {
    const res = await fetch(`${BASE}/api/listings?${qs}`, { next: { revalidate: 60 } });
    if (!res.ok) return { listings: [], total: 0 };
    return res.json();
  } catch {
    return { listings: [], total: 0 };
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string }>;
}) {
  const sp = await searchParams;

  const [main, featured, urgent] = await Promise.all([
    getListings({ ...(sp.q ? { q: sp.q } : {}), ...(sp.city ? { city: sp.city } : {}), limit: '20' }),
    !sp.q && !sp.city ? getListings({ featured: 'true', limit: '6' }) : Promise.resolve({ listings: [] }),
    !sp.q && !sp.city ? getListings({ urgent: 'true', limit: '6' })  : Promise.resolve({ listings: [] }),
  ]);

  const isSearch = !!(sp.q || sp.city);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">İngiltere&apos;de Türkçe Alışveriş</h1>
        <p style={{ color: 'var(--muted)' }}>
          {isSearch
            ? `"${sp.q || sp.city}" için ${main.total} ilan bulundu`
            : main.total > 0 ? `${main.total} ilan` : 'Henüz ilan yok — ilk ilanı sen ver!'}
        </p>
      </div>

      <SearchBar defaultQ={sp.q} defaultCity={sp.city} />

      {/* Vitrin ilanlar — sadece arama yoksa */}
      {!isSearch && featured.listings.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">⭐</span>
            <h2 className="font-bold text-lg">Vitrin İlanlar</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featured.listings.map((l: Listing) => (
              <div key={l.id} className="relative">
                <div className="absolute top-2 left-2 z-10 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: '#7c3aed' }}>
                  ⭐ Vitrin
                </div>
                <ListingCard listing={l} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Acil ilanlar — sadece arama yoksa */}
      {!isSearch && urgent.listings.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔴</span>
            <h2 className="font-bold text-lg">Acil İlanlar</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {urgent.listings.map((l: Listing) => (
              <div key={l.id} className="relative">
                <div className="absolute top-2 left-2 z-10 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: '#dc2626' }}>
                  🔴 Acil
                </div>
                <ListingCard listing={l} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tüm ilanlar */}
      <section className="mt-8">
        {(!isSearch && (featured.listings.length > 0 || urgent.listings.length > 0)) && (
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-bold text-lg">Son İlanlar</h2>
          </div>
        )}

        {main.listings.length === 0 ? (
          <div className="text-center py-24" style={{ color: 'var(--muted)' }}>
            <p className="text-5xl mb-4">📦</p>
            <p className="text-lg">{isSearch ? 'Sonuç bulunamadı' : 'Henüz ilan yok'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {main.listings.map((l: Listing) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
