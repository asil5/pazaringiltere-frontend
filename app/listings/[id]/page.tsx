import Link from 'next/link';
import { notFound } from 'next/navigation';
import PhotoGallery from '@/components/PhotoGallery';

const BASE = process.env.NEXT_PUBLIC_API_URL!;

// Attribute etiket haritası
const ATTR_LABELS: Record<string, string> = {
  marka: 'Marka', model: 'Model', yil: 'Yıl', km: 'Kilometre',
  yakit: 'Yakıt', vites: 'Vites', kasaTipi: 'Kasa Tipi',
  motorHacmi: 'Motor Hacmi', renk: 'Renk', kimden: 'Kimden',
  odaSayisi: 'Oda Sayısı', m2: 'Alan (m²)', isitma: 'Isıtma',
  esyali: 'Eşyalı', site: 'Site İçerisinde',
  krediyeUygun: 'Krediye Uygun', durum: 'Durum', garanti: 'Garanti',
};

function whatsappUrl(phone: string, title: string) {
  const clean = phone.replace(/\s+/g, '').replace(/^\+/, '');
  const msg = encodeURIComponent(`Merhaba, pazaringiltere.co.uk'da "${title}" ilanınızı gördüm, ilgileniyorum.`);
  return `https://wa.me/${clean}?text=${msg}`;
}

function formatPrice(p: number) {
  return `£${(p / 100).toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
}

async function getListingData(id: string) {
  try {
    const res = await fetch(`${BASE}/api/listings/${id}`, { cache: 'no-store' });
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
  const sellerStore: { name: string; slug: string } | null = data.sellerStore ?? null;
  const otherListings: any[] = data.otherListings ?? [];
  const attrs: Record<string, any> = listing.attributes ?? {};
  const hasAttrs = Object.keys(attrs).filter(k => k !== 'features').length > 0;
  const features: string[] = attrs.features ?? [];

  const pricePence = listing.pricePence ?? listing.price ?? 0;
  const cat = listing.category;

  // Breadcrumb için
  const breadcrumbs = [
    { label: 'Ana Sayfa', href: '/' },
    ...(cat ? [{ label: cat.name, href: `/kategori/${cat.slug}` }] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm mb-3 flex items-center gap-1 flex-wrap" style={{ color: 'var(--muted)' }}>
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span>›</span>}
            <Link href={b.href} style={{ color: 'var(--muted)' }}>{b.label}</Link>
          </span>
        ))}
        {breadcrumbs.length > 0 && <span>›</span>}
        <span style={{ color: 'var(--text)' }} className="line-clamp-1">{listing.title}</span>
      </nav>

      {/* İlan başlığı */}
      <h1 className="text-xl font-bold mb-4">{listing.title}</h1>

      {/* 3-kolon ana layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1.4fr] gap-5">

        {/* Kolon 1: Fotoğraf */}
        <div>
          <PhotoGallery images={listing.images ?? []} title={listing.title} base={BASE} />
        </div>

        {/* Kolon 2: Fiyat + Bilgiler tablosu */}
        <div>
          {/* Fiyat */}
          <div className="mb-4">
            <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
              {formatPrice(pricePence)}
            </p>
            {listing.locationCity && (
              <p className="text-sm mt-1 flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                <span>📍</span>
                <span>{listing.locationCity}</span>
                {listing.locationPostcode && <span>· {listing.locationPostcode}</span>}
              </p>
            )}
          </div>

          {/* Bilgiler tablosu */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-2.5 px-4 font-medium w-1/2" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>İlan No</td>
                  <td className="py-2.5 px-4">{listing.id}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-2.5 px-4 font-medium" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>İlan Tarihi</td>
                  <td className="py-2.5 px-4">
                    {new Date(listing.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                </tr>
                {cat && (
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2.5 px-4 font-medium" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>Kategori</td>
                    <td className="py-2.5 px-4">
                      <Link href={`/kategori/${cat.slug}`} style={{ color: 'var(--accent)' }}>{cat.name}</Link>
                    </td>
                  </tr>
                )}
                {hasAttrs && Object.entries(attrs)
                  .filter(([k]) => k !== 'features')
                  .map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-2.5 px-4 font-medium" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>
                        {ATTR_LABELS[k] ?? k}
                      </td>
                      <td className="py-2.5 px-4">
                        {typeof v === 'boolean' ? (v ? 'Evet' : 'Hayır') : String(v)}
                      </td>
                    </tr>
                  ))
                }
                {listing.viewCount > 0 && (
                  <tr>
                    <td className="py-2.5 px-4 font-medium" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>Görüntülenme</td>
                    <td className="py-2.5 px-4">👁 {listing.viewCount} kişi</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolon 3: Satıcı sidebar */}
        <div className="space-y-3">
          {/* Satıcı kartı */}
          {seller && (
            <div className="rounded-xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
                  style={{ background: 'var(--accent)' }}>
                  {seller.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="font-semibold text-sm">{seller.name}</p>
                  {seller.createdAt && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                      Üye: {new Date(seller.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>

              {/* İletişim */}
              {seller.phone && (
                <div className="rounded-lg p-3 mb-3 text-sm" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <p className="font-medium mb-1" style={{ color: 'var(--muted)' }}>📞 Cep</p>
                  <p className="font-semibold">{seller.phone}</p>
                </div>
              )}

              {/* WhatsApp butonu */}
              {seller.phone ? (
                <a href={whatsappUrl(seller.phone, listing.title)}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-white font-semibold text-sm mb-2"
                  style={{ background: '#25D366' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Mesaj
                </a>
              ) : (
                <Link href="/auth/login"
                  className="flex items-center justify-center w-full py-3 rounded-lg text-white font-semibold text-sm mb-2"
                  style={{ background: 'var(--accent)' }}>
                  İletişim İçin Giriş Yap
                </Link>
              )}

              {/* Mağaza linki */}
              {sellerStore && (
                <Link href={`/magaza/${sellerStore.slug}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium mb-2"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--accent)' }}>
                  🏪 {sellerStore.name} Mağazasına Git
                </Link>
              )}

              {/* Vitrin/Acil badges */}
              <div className="flex gap-2 flex-wrap">
                {listing.featured && (
                  <span className="text-xs font-bold px-2 py-1 rounded text-white" style={{ background: '#7c3aed' }}>⭐ Vitrin İlan</span>
                )}
                {listing.urgent && (
                  <span className="text-xs font-bold px-2 py-1 rounded text-white" style={{ background: '#dc2626' }}>🔴 Acil</span>
                )}
              </div>
            </div>
          )}

          {!seller && (
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <Link href="/auth/login"
                className="flex items-center justify-center w-full py-3 rounded-lg text-white font-semibold text-sm"
                style={{ background: 'var(--accent)' }}>
                İletişim İçin Giriş Yap
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Alt bölüm: Açıklama + Özellikler */}
      <div className="mt-6 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        {/* Tab başlıkları */}
        <div className="flex border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="px-5 py-3 text-sm font-semibold border-b-2" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
            ☰ İlan Detayları
          </div>
        </div>

        <div className="p-5">
          {/* Açıklama */}
          {listing.description && (
            <div className="mb-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <span>≡</span> İlan Açıklaması
              </h2>
              <div className="rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap"
                style={{ background: 'var(--surface)', color: 'var(--muted)' }}>
                {listing.description}
              </div>
              {listing.viewCount > 0 && (
                <p className="text-xs mt-2 text-center" style={{ color: 'var(--muted)' }}>
                  👁 {listing.viewCount} kişi tarafından görüntülendi
                </p>
              )}
            </div>
          )}

          {/* Özellikler (features) - araçlar için */}
          {features.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <span>☑</span> Özellikler
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Satıcının diğer ilanları */}
      {otherListings.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-4 text-base">
            {seller?.name ? `${seller.name} adlı satıcının diğer ilanları` : 'Satıcının diğer ilanları'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherListings.map((item: any) => {
              const itemImg = item.images?.[0];
              return (
                <Link key={item.id} href={`/listings/${item.id}`}
                  className="block rounded-xl overflow-hidden border transition-shadow hover:shadow-md"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="aspect-[4/3] bg-gray-100">
                    {itemImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={itemImg.startsWith('http') ? itemImg : `${BASE}${itemImg}`} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📷</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium line-clamp-2 mb-1">{item.title}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                      {formatPrice(item.pricePence ?? item.price ?? 0)}
                    </p>
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
