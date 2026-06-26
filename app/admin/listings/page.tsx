'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  pricePence: number;
  locationCity: string;
  status: string;
  confirm: boolean;
  createdAt: string;
  userId: string;
}

export default function AdminListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get<{ listings: Listing[]; total: number }>('/api/admin/listings')
      .then(r => { setListings(r.listings); setTotal(r.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deleteListing = async (id: string) => {
    if (!confirm('Bu ilanı silmek istediğinden emin misin?')) return;
    await api.delete(`/api/admin/listings/${id}`);
    setListings(prev => prev.filter(l => l.id !== id));
    setTotal(prev => prev - 1);
  };

  const approveListing = async (id: string) => {
    await api.patch(`/api/admin/listings/${id}/approve`, {});
    setListings(prev => prev.map(l => l.id === id ? { ...l, confirm: true } : l));
  };

  if (loading) return <p style={{ color: 'var(--muted)' }}>Yükleniyor...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">İlanlar <span className="text-base font-normal" style={{ color: 'var(--muted)' }}>({total})</span></h1>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>İlan</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Fiyat</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Şehir</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Durum</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Tarih</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l, i) => {
              const status = !l.confirm ? { text: 'Onay bekliyor', color: '#d97706' }
                : l.status === 'ACTIVE' ? { text: 'Aktif', color: '#16a34a' }
                : l.status === 'SOLD' ? { text: 'Satıldı', color: '#6b7280' }
                : { text: l.status, color: 'var(--muted)' };

              return (
                <tr key={l.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: 'var(--surface)' }}>
                  <td className="px-4 py-3">
                    <Link href={`/listings/${l.id}`} className="font-medium hover:underline" style={{ color: 'var(--text)' }}>
                      {l.title}
                    </Link>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>#{l.id}</p>
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--accent)' }}>
                    £{(l.pricePence / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>{l.locationCity || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ background: `${status.color}18`, color: status.color }}>
                      {status.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>
                    {new Date(l.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {!l.confirm && (
                        <button onClick={() => approveListing(l.id)}
                          className="text-xs px-2 py-1 rounded font-medium text-white"
                          style={{ background: '#16a34a' }}>
                          Onayla
                        </button>
                      )}
                      <button onClick={() => deleteListing(l.id)}
                        className="text-xs px-2 py-1 rounded font-medium text-white"
                        style={{ background: '#dc2626' }}>
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {listings.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--muted)' }}>İlan yok</div>
        )}
      </div>
    </div>
  );
}
