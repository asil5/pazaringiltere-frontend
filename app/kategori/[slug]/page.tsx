import Link from 'next/link';
import CategorySidebar from '@/components/CategorySidebar';
import CategoryFilters from '@/components/CategoryFilters';

const BASE = process.env.NEXT_PUBLIC_API_URL!;

interface Category {
  id: string; name: string; slug: string;
  icon: string | null; parentId: string | null; level: number;
}
interface Listing {
  id: string; title: string; pricePence: number;
  locationCity: string | null; images: string[];
  createdAt: string; featured: boolean; urgent: boolean;
  category?: { name: string; slug: string } | null;
}

async function getCategories(): Promise<Category[]> {
  try {
    const r = await fetch(`${BASE}/api/categories`, { next: { revalidate: 300 } });
    return r.ok ? r.json() : [];
  } catch { return []; }
}

async function getListings(params: Record<string, string>) {
  try {
    const r = await fetch(`${BASE}/api/listings?${new URLSearchParams(params)}`, { cache: 'no-store' });
    return r.ok ? r.json() : { listings: [], total: 0 };
  } catch { return { listings: [], total: 0 }; }
}

function formatPrice(p: number) {
  return `£${(p / 100).toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Bugün';
  if (days === 1) return 'Dün';
  if (days < 30) return `${days} gün önce`;
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export default async function KategoriPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ priceMin?: string; priceMax?: string; city?: string; view?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const [categories, data] = await Promise.all([
    getCategories(),
    getListings({
      category: slug,
      ...(sp.priceMin ? { priceMin: sp.priceMin } : {}),
      ...(sp.priceMax ? { priceMax: sp.priceMax } : {}),
      ...(sp.city ? { city: sp.city } : {}),
      limit: '40',
    }),
  ]);

  const category = categories.find(c => c.slug === slug);
  const parent = category?.parentId
    ? categories.find(c => c.id === category.parentId)
    : null;
  const subcategories = categories.filter(c => c.parentId === category?.id);

  const listings: Listing[] = data.listings ?? [];
  const total: number = data.total ?? 0;
  const isGridView = sp.view === 'grid';
  const currentParams = {
    priceMin: sp.priceMin ?? '',
    priceMax: sp.priceMax ?? '',
    city: sp.city ?? '',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm mb-4 flex items-center gap-1" style={{ color: 'var(--muted)' }}>
        <Link href="/" style={{ color: 'var(--muted)' }}>Ana Sayfa</Link>
        <span>›</span>
        {parent && (
          <>
            <span>{parent.icon} {parent.name}</span>
            <span>›</span>
          </>
        )}
        <span style={{ color: 'var(--text)' }}>{category?.icon} {category?.name ?? slug}</span>
      </nav>

      <div className="flex gap-5 items-start">
        {/* Sol sidebar */}
        <div className="w-52 shrink-0">
          <CategorySidebar categories={categories} activeSlug={slug} />
          <CategoryFilters slug={slug} currentParams={currentParams} />
        </div>

        {/* Sağ içerik */}
        <div className="flex-1 min-w-0">
          {/* Başlık + istatistik */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">
              {category?.icon} {category?.name ?? slug}
              <span className="text-sm font-normal ml-2" style={{ color: 'var(--muted)' }}>
                toplam {total} ilan
              </span>
            </h1>

            {/* Liste / Galeri toggle */}
            <div className="flex gap-1 rounded-lg border p-0.5" style={{ borderColor: 'var(--border)' }}>
              <Link href={`/kategori/${slug}?${new URLSearchParams({ ...currentParams, view: 'list' })}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors"
                style={{ background: !isGridView ? 'var(--accent)' : 'transparent', color: !isGridView ? '#fff' : 'var(--muted)' }}>
                ≡ Liste
              </Link>
              <Link href={`/kategori/${slug}?${new URLSearchParams({ ...currentParams, view: 'grid' })}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors"
                style={{ background: isGridView ? 'var(--accent)' : 'transparent', color: isGridView ? '#fff' : 'var(--muted)' }}>
                ⊞ Galeri
              </Link>
            </div>
          </div>

          {/* Eğer üst kategori ise alt kategorileri göster */}
          {subcategories.length > 0 && listings.length === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {subcategories.map(sub => (
                <Link key={sub.id} href={`/kategori/${sub.slug}`}
                  className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:shadow-md"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <span className="text-2xl">{sub.icon ?? '📁'}</span>
                  <span className="text-sm font-medium">{sub.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* İlanlar */}
          {listings.length === 0 ? (
            <div className="text-center py-20 rounded-xl border"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
              <p className="text-4xl mb-3">📦</p>
              <p>Bu kategoride henüz ilan yok.</p>
              <Link href="/listings/new" className="mt-4 inline-block text-sm font-semibold px-4 py-2 rounded"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                İlan Ver
              </Link>
            </div>
          ) : isGridView ? (
            /* GALERI görünümü */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {listings.map(l => (
                <Link key={l.id} href={`/listings/${l.id}`}
                  className="rounded-xl border overflow-hidden hover:shadow-md transition-shadow block"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="aspect-[4/3] bg-gray-100 relative">
                    {l.images?.[0] ? (
                      <img src={`${BASE}${l.images[0]}`} alt={l.title}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl" style={{ color: 'var(--muted)' }}>
                        📷
                      </div>
                    )}
                    {l.featured && (
                      <span className="absolute top-1 left-1 text-xs font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ background: '#7c3aed' }}>⭐ Vitrin</span>
                    )}
                    {l.urgent && (
                      <span className="absolute top-1 right-1 text-xs font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ background: '#dc2626' }}>Acil</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium line-clamp-2 mb-1">{l.title}</p>
                    <p className="font-bold" style={{ color: 'var(--accent)' }}>{formatPrice(l.pricePence)}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{l.locationCity}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* LİSTE görünümü */
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              {/* Tablo başlığı */}
              <div className="hidden sm:grid grid-cols-[80px_1fr_120px_110px_100px] gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <span>Görsel</span>
                <span>İlan Başlığı</span>
                <span className="text-right">Fiyat</span>
                <span>İl</span>
                <span>Tarih</span>
              </div>

              {listings.map((l, i) => (
                <Link key={l.id} href={`/listings/${l.id}`}
                  className="flex sm:grid sm:grid-cols-[80px_1fr_120px_110px_100px] gap-3 items-center px-4 py-3 transition-colors hover:opacity-90"
                  style={{
                    borderBottom: i < listings.length - 1 ? '1px solid var(--border)' : 'none',
                    background: l.featured ? 'rgba(124,58,237,0.04)' : 'var(--bg)',
                  }}>
                  {/* Görsel */}
                  <div className="w-16 h-12 sm:w-auto sm:h-14 rounded overflow-hidden shrink-0"
                    style={{ background: 'var(--surface)' }}>
                    {l.images?.[0] ? (
                      <img src={`${BASE}${l.images[0]}`} alt={l.title}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg" style={{ color: 'var(--muted)' }}>
                        📷
                      </div>
                    )}
                  </div>

                  {/* Başlık */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                      {l.featured && <span className="inline-block text-xs font-bold mr-1 px-1 rounded text-white" style={{ background: '#7c3aed' }}>VİTRİN</span>}
                      {l.urgent && <span className="inline-block text-xs font-bold mr-1 px-1 rounded text-white" style={{ background: '#dc2626' }}>ACİL</span>}
                      {l.title}
                    </p>
                    <p className="text-xs sm:hidden mt-0.5" style={{ color: 'var(--muted)' }}>
                      {formatPrice(l.pricePence)} · {l.locationCity}
                    </p>
                  </div>

                  {/* Fiyat */}
                  <p className="hidden sm:block text-right font-bold" style={{ color: 'var(--accent)' }}>
                    {formatPrice(l.pricePence)}
                  </p>

                  {/* İl */}
                  <p className="hidden sm:block text-sm" style={{ color: 'var(--muted)' }}>
                    {l.locationCity ?? '—'}
                  </p>

                  {/* Tarih */}
                  <p className="hidden sm:block text-xs" style={{ color: 'var(--muted)' }}>
                    {timeAgo(l.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
