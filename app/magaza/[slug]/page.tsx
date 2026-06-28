import Link from 'next/link';
import { notFound } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_API_URL!;

function formatPrice(p: number) {
  return `£${(p / 100).toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
}

async function getStore(slug: string) {
  try {
    const res = await fetch(`${BASE}/api/stores/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function MagazaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getStore(slug);
  if (!data) notFound();

  const { store, listings, total } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-5 flex items-center gap-1" style={{ color: 'var(--muted)' }}>
        <Link href="/" style={{ color: 'var(--muted)' }}>Ana Sayfa</Link>
        <span>›</span>
        <span style={{ color: 'var(--text)' }}>Mağaza</span>
        <span>›</span>
        <span style={{ color: 'var(--text)' }}>{store.name}</span>
      </nav>

      {/* Mağaza başlık kartı */}
      <div className="rounded-2xl border p-6 mb-8 flex items-start gap-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {/* Avatar / Logo */}
        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
          style={{ background: 'var(--accent)' }}>
          {store.name?.[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-xl font-bold">{store.name}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
              style={{ background: '#16a34a' }}>
              ✓ Aktif Mağaza
            </span>
          </div>
          {store.description && (
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>
              {store.description}
            </p>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              📦 <strong>{total}</strong> aktif ilan
            </span>
            {store.phone && (
              <a href={`https://wa.me/${store.phone.replace(/\D/g, '')}?text=Mağazanızla ilgileniyorum`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-white"
                style={{ background: '#25D366' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* İlanlar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">
          Mağaza İlanları
          <span className="text-sm font-normal ml-2" style={{ color: 'var(--muted)' }}>
            ({total})
          </span>
        </h2>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20 rounded-xl border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          <p className="text-3xl mb-2">📦</p>
          <p>Bu mağazada henüz aktif ilan yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {listings.map((l: any) => (
            <Link key={l.id} href={`/listings/${l.id}`}
              className="rounded-xl border overflow-hidden hover:shadow-md transition-shadow block"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="aspect-[4/3] bg-gray-100 relative">
                {l.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.images[0].startsWith('http') ? l.images[0] : `${BASE}${l.images[0]}`} alt={l.title}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl"
                    style={{ color: 'var(--muted)' }}>📷</div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2 mb-1">{l.title}</p>
                <p className="font-bold" style={{ color: 'var(--accent)' }}>
                  {formatPrice(l.pricePence)}
                </p>
                {l.locationCity && (
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>📍 {l.locationCity}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
