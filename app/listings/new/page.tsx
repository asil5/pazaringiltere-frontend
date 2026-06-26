'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const BASE = process.env.NEXT_PUBLIC_API_URL!;

interface Category { id: string; name: string; slug: string; parentId: string | null; icon: string | null; }

// Kategori tipine göre attribute alanları
const ATTR_FIELDS: Record<string, { key: string; label: string; type: 'text' | 'number' | 'select'; options?: string[]; placeholder?: string }[]> = {
  vasita: [
    { key: 'marka',    label: 'Marka',       type: 'text',   placeholder: 'Toyota, BMW, Ford...' },
    { key: 'model',    label: 'Model',        type: 'text',   placeholder: 'Corolla, 3 Serisi...' },
    { key: 'yil',      label: 'Yıl',          type: 'number', placeholder: '2019' },
    { key: 'km',       label: 'Kilometre',    type: 'number', placeholder: '45000' },
    { key: 'yakit',    label: 'Yakıt',        type: 'select', options: ['Benzin', 'Dizel', 'LPG', 'Elektrik', 'Hibrit'] },
    { key: 'vites',    label: 'Vites',        type: 'select', options: ['Manuel', 'Otomatik', 'Yarı Otomatik'] },
    { key: 'kasaTipi', label: 'Kasa Tipi',    type: 'select', options: ['Sedan', 'Hatchback', 'SUV', 'Kombi', 'Coupe', 'Van', 'Pick-up'] },
    { key: 'renk',     label: 'Renk',         type: 'text',   placeholder: 'Beyaz, Siyah, Gri...' },
    { key: 'kimden',   label: 'Kimden',       type: 'select', options: ['Sahibinden', 'Galeriden'] },
  ],
  emlak: [
    { key: 'odaSayisi',    label: 'Oda Sayısı',       type: 'select', options: ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1', '6+'] },
    { key: 'm2',           label: 'Alan (m²)',         type: 'number', placeholder: '85' },
    { key: 'isitma',       label: 'Isıtma',            type: 'select', options: ['Kombi', 'Merkezi', 'Yerden Isıtma', 'Klima', 'Soba', 'Yok'] },
    { key: 'esyali',       label: 'Eşyalı',            type: 'select', options: ['Eşyalı', 'Eşyasız', 'Kısmi Eşyalı'] },
    { key: 'site',         label: 'Site İçerisinde',   type: 'select', options: ['Evet', 'Hayır'] },
    { key: 'krediyeUygun', label: 'Krediye Uygun',     type: 'select', options: ['Evet', 'Hayır'] },
    { key: 'kimden',       label: 'Kimden',             type: 'select', options: ['Sahibinden', 'Emlakçıdan'] },
  ],
  elektronik: [
    { key: 'marka',  label: 'Marka',   type: 'text',   placeholder: 'Apple, Samsung, Sony...' },
    { key: 'durum',  label: 'Durum',   type: 'select', options: ['Sıfır', 'İkinci El', 'Yenilenmiş'] },
    { key: 'garanti', label: 'Garanti', type: 'select', options: ['Var', 'Yok'] },
  ],
};

function getCategoryType(slug: string): string {
  if (['vasita','otomobil','motosiklet','ticari-arac','yedek-parca'].includes(slug)) return 'vasita';
  if (['emlak','satilik-konut','kiralik-konut','isyeri-ofis','arsa-tarla'].includes(slug)) return 'emlak';
  if (['elektronik','telefon','bilgisayar','tv-ses','oyun-konsol'].includes(slug)) return 'elektronik';
  return '';
}

const UK_CITIES = ['London','Birmingham','Manchester','Leeds','Liverpool','Sheffield','Bristol','Leicester','Coventry','Bradford','Nottingham','Newcastle'];

export default function NewListingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [attrs, setAttrs] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: '', description: '', price: '', locationCity: '', locationPostcode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/categories`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <p className="text-lg mb-4">İlan vermek için giriş yapman gerekiyor.</p>
        <a href="/auth/login" className="inline-block px-6 py-2.5 rounded-lg text-white font-semibold"
          style={{ background: 'var(--accent)' }}>Giriş Yap</a>
      </div>
    );
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const setAttr = (k: string, v: string) => setAttrs(a => ({ ...a, [k]: v }));

  const parents = categories.filter(c => !c.parentId);
  const children = (pid: string) => categories.filter(c => c.parentId === pid);

  const catType = getCategoryType(selectedSlug);
  const attrFields = ATTR_FIELDS[catType] ?? [];

  const handleCategoryChange = (id: string) => {
    setSelectedCategoryId(id);
    const cat = categories.find(c => c.id === id);
    setSelectedSlug(cat?.slug ?? '');
    setAttrs({});
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const pricePence = Math.round(parseFloat(form.price) * 100);
      if (isNaN(pricePence) || pricePence <= 0) throw new Error('Geçerli bir fiyat gir');

      // Boş olmayan attr alanlarını al
      const cleanAttrs: Record<string, any> = {};
      for (const [k, v] of Object.entries(attrs)) {
        if (v?.trim()) {
          const field = attrFields.find(f => f.key === k);
          cleanAttrs[k] = field?.type === 'number' ? +v : v;
        }
      }

      const res = await api.post<{ listing: { id: string } }>('/api/listings', {
        title: form.title,
        description: form.description,
        pricePence,
        locationCity: form.locationCity,
        locationPostcode: form.locationPostcode,
        categoryId: selectedCategoryId ? +selectedCategoryId : undefined,
        attributes: Object.keys(cleanAttrs).length > 0 ? cleanAttrs : undefined,
      });
      router.push(`/listings/${res.listing.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Hata oluştu');
    } finally { setLoading(false); }
  };

  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2";
  const inputStyle = { borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">İlan Ver</h1>
      <form onSubmit={submit} className="space-y-5">

        {/* Kategori seçimi */}
        <div>
          <label className="block text-sm font-medium mb-1">Kategori *</label>
          <div className="grid grid-cols-2 gap-3">
            {/* Ana kategori */}
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Ana Kategori</p>
              <select
                value={parents.find(p => children(p.id).some(c => c.id === selectedCategoryId))?.id ?? ''}
                onChange={e => {
                  setSelectedCategoryId('');
                  setSelectedSlug('');
                  setAttrs({});
                }}
                className={inputCls} style={inputStyle}>
                <option value="">Seç...</option>
                {parents.map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                ))}
              </select>
            </div>
            {/* Alt kategori */}
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Alt Kategori</p>
              <select
                value={selectedCategoryId}
                onChange={e => handleCategoryChange(e.target.value)}
                className={inputCls} style={inputStyle}>
                <option value="">Seç...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.parentId ? `  ${cat.icon ?? ''} ${cat.name}` : `${cat.icon ?? ''} ${cat.name}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Kategori'ye özgü attribute alanlar */}
        {attrFields.length > 0 && (
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--muted)' }}>
              {catType === 'vasita' ? '🚗 Araç Bilgileri' : catType === 'emlak' ? '🏠 Emlak Bilgileri' : '📱 Ürün Bilgileri'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {attrFields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-medium mb-1">{field.label}</label>
                  {field.type === 'select' ? (
                    <select value={attrs[field.key] ?? ''} onChange={e => setAttr(field.key, e.target.value)}
                      className={inputCls} style={inputStyle}>
                      <option value="">Seç...</option>
                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} placeholder={field.placeholder}
                      value={attrs[field.key] ?? ''} onChange={e => setAttr(field.key, e.target.value)}
                      className={inputCls} style={inputStyle} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Genel alanlar */}
        <div>
          <label className="block text-sm font-medium mb-1">Başlık *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} required
            placeholder="Örn: iPhone 14 Pro Max 256GB"
            className={inputCls} style={inputStyle} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Açıklama</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={4} placeholder="Ürün hakkında detaylar..."
            className={`${inputCls} resize-none`} style={inputStyle} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fiyat (£) *</label>
          <input type="number" step="0.01" min="0.01" value={form.price}
            onChange={e => set('price', e.target.value)} required
            placeholder="0.00" className={inputCls} style={inputStyle} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Şehir</label>
            <select value={form.locationCity} onChange={e => set('locationCity', e.target.value)}
              className={inputCls} style={inputStyle}>
              <option value="">Seç...</option>
              {UK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Posta Kodu</label>
            <input value={form.locationPostcode} onChange={e => set('locationPostcode', e.target.value)}
              placeholder="Örn: SW1A 1AA" className={inputCls} style={inputStyle} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-lg text-white font-semibold disabled:opacity-50"
          style={{ background: 'var(--accent)' }}>
          {loading ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
        </button>
        <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
          İlan admin onayından sonra yayınlanır.
        </p>
      </form>
    </div>
  );
}
