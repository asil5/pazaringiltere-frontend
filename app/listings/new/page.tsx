'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function NewListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', price: '', locationCity: '', locationPostcode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <p className="text-lg mb-4">İlan vermek için giriş yapman gerekiyor.</p>
        <a href="/auth/login"
          className="inline-block px-6 py-2.5 rounded-lg text-white font-semibold"
          style={{ background: 'var(--accent)' }}>
          Giriş Yap
        </a>
      </div>
    );
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const pricePence = Math.round(parseFloat(form.price) * 100);
      if (isNaN(pricePence) || pricePence <= 0) throw new Error('Geçerli bir fiyat gir');
      const res = await api.post<{ listing: { id: string } }>('/api/listings', {
        title: form.title,
        description: form.description,
        pricePence,
        locationCity: form.locationCity,
        locationPostcode: form.locationPostcode,
      });
      router.push(`/listings/${res.listing.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Hata oluştu');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">İlan Ver</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Başlık *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} required
            placeholder="Örn: iPhone 14 Pro Max 256GB"
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Açıklama</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={4} placeholder="Ürün hakkında detaylar..."
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 resize-none"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fiyat (£) *</label>
          <input type="number" step="0.01" min="0.01" value={form.price} onChange={e => set('price', e.target.value)} required
            placeholder="0.00"
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Şehir</label>
            <input value={form.locationCity} onChange={e => set('locationCity', e.target.value)}
              placeholder="Örn: London"
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Posta Kodu</label>
            <input value={form.locationPostcode} onChange={e => set('locationPostcode', e.target.value)}
              placeholder="Örn: SW1A 1AA"
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }} />
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
