import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getListing(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const price = (listing.price / 100).toFixed(2);

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
              src={`${process.env.NEXT_PUBLIC_API_URL}/${listing.images[0]}`}
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
    </div>
  );
}
