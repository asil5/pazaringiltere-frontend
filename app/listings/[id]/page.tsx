import Link from 'next/link';
import { notFound } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_API_URL!;

function whatsappUrl(phone: string, title: string) {
  const clean = phone.replace(/\s+/g, '').replace(/^\+/, '');
  const msg = encodeURIComponent(`Merhaba, pazaringiltere.co.uk'da "${title}" ilanınızı gördüm, ilgileniyorum.`);
  return `https://wa.me/${clean}?text=${msg}`;
}

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
            {seller?.phone ? (
              <a href={whatsappUrl(seller.phone, listing.title)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold"
                style={{ background: '#25D366' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp ile İletişim
              </a>
            ) : (
              <>
                <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>
                  Satın almak için giriş yapman gerekiyor.
                </p>
                <Link href="/auth/login"
                  className="inline-block px-6 py-3 rounded-lg text-white font-semibold"
                  style={{ background: 'var(--accent)' }}>
                  Giriş Yap
                </Link>
              </>
            )}
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
