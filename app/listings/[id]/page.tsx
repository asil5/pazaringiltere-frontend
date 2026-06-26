import Link from 'next/link';
import { notFound } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_API_URL!;

async function getListingData(id: string) {
  try {
    const res = await fetch(`${BASE}/api/listings/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getListingData(id);
  if (!data) notFound();

  const listing = data.listing ?? data;
  const seller = data.seller ?? null;
  const otherListings: any[] = data.otherListings ?? [];

  const price = ((listing.pricePence ?? listing.price ?? 0) / 100).toFixed(2);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm mb-6 inline-block" style={{ color: 'var(--muted)' }}>
        ← Geri
      </Link>

      <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {listing.images?.length > 0 && (
          <div className="aspect-video bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}${listing.images[0]}`}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <p className="text-2xl font-bold shrink-0" style={{ color: 'var(--accent)' }}>£{price}</p>
          </div>

          {listing.locationCity && (
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              📍 {listing.locationCity} {listing.locationPostcode && `· ${listing.locationPostcode}`}
            </p>
          )}

          {listing.description && (
            <div className="border-t pt-4 mt-4" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-semibold mb-2">Açıklama</h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--muted)' }}>
                {listing.description}
              </p>
            </div>
          )}

          <div className="border-t pt-4 mt-6" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>
              Satın almak için giriş yapman gerekiyor.
            </p>
            <Link href="/auth/login"
              className="inline-block px-6 py-3 rounded-lg text-white font-semibold"
              style={{ background: 'var(--accent)' }}>
              Satın Al — £{price}
            </Link>
          </div>
        </div>
      </div>

      {/* Seller Info */}
      {seller && (
        <div className="mt-6 rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-3">Satıcı</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: 'var(--accent)' }}>
              {seller.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="font-medium">{seller.name}</p>
              {seller.createdAt && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  Üye: {new Date(seller.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seller's Other Listings */}
      {otherListings.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-4">
            {seller?.name ? `${seller.name} adlı satıcının diğer ilanları` : 'Satıcının diğer ilanları'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {otherListings.map((item: any) => {
              const itemPrice = ((item.pricePence ?? item.price ?? 0) / 100).toFixed(2);
              const itemImg = item.images?.[0];
              return (
                <Link key={item.id} href={`/listings/${item.id}`}
                  className="block rounded-lg overflow-hidden border transition-shadow hover:shadow-md"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="aspect-square bg-gray-100">
                    {itemImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`${BASE}${itemImg}`} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📷</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium line-clamp-2 mb-1">{item.title}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>£{itemPrice}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
