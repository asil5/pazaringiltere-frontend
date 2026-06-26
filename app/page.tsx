import ListingCard from '@/components/ListingCard';
import SearchBar from '@/components/SearchBar';

interface Listing {
  id: string;
  title: string;
  price: number;
  locationCity: string;
  images: string[];
  createdAt: string;
}

async function getListings(q?: string, city?: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (city) params.set('city', city);
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/listings?${params}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
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
  const { listings, total } = await getListings(sp.q, sp.city);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">
          İngiltere&apos;de Türkçe Alışveriş
        </h1>
        <p style={{ color: 'var(--muted)' }}>
          {total > 0 ? `${total} ilan bulundu` : 'Henüz ilan yok — ilk ilanı sen ver!'}
        </p>
      </div>

      <SearchBar defaultQ={sp.q} defaultCity={sp.city} />

      {listings.length === 0 ? (
        <div className="text-center py-24" style={{ color: 'var(--muted)' }}>
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg">Henüz ilan yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {listings.map((l: Listing) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
