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
  featured: boolean;
  urgent: boolean;
  createdAt: string;
}

const FILTERS = [
  { key: '', label: 'Tümü' },
  { key: 'pending', label: 'Bekleyen' },
  { key: 'active', label: 'Aktif' },
  { key: 'sold', label: 'Satıldı' },
  { key: 'featured', label: 'Vitrin' },
];

export default function AdminListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = (f: string) => {
    setLoading(true);
    const q = f ? `?filter=${f}` : '';
    api.get<{ listings: Listing[]; total: number }>(`/api/admin/listings${q}`)
      .then(r => { setListings(r.listings); setTotal(r.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

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

  const toggleFeatured = async (id: string) => {
    const res = await api.patch<Listing>(`/api/admin/listings/${id}/feature`, {});
    setListings(prev => prev.map(l => l.id === id ? { ...l, featured: res.featured } : l));
  };

  const toggleUrgent = async (id: string) => {
    const res = await api.patch<Listing>(`/api/admin/listings/${id}/urgent`, {});
    setListings(prev => prev.map(l => l.id === id ? { ...l, urgent: res.urgent } : l));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          İlanlar <span className="text-base font-normal" style={{ color: 'var(--muted)' }}>({total})</span>
        </h1>
      </div>

      {/* Filtre sekmeleri */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg w-fit" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={{
              background: filter === f.key ? 'var(--accent)' : 'transparent',
              color: filter === f.key ? 'white' : 'var(--muted)',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Yükleniyor...</p>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>İlan</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Fiyat</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Durum</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Etiket</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Tarih</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l, i) => {
                const statusInfo = !l.confirm
                  ? { text: 'Bekliyor', color: '#d97706' }
                  : l.status === 'ACTIVE' ? { text: 'Aktif', color: '#16a34a' }
                  : l.status === 'SOLD' ? { text: 'Satıldı', color: '#6b7280' }
                  : { text: l.status, color: 'var(--muted)' };

                return (
                  <tr key={l.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: 'var(--surface)' }}>
                    <td className="px-4 py-3">
                      <Link href={`/listings/${l.id}`} className="font-medium hover:underline" style={{ color: 'var(--text)' }}>
                        {l.title}
                      </Link>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                        #{l.id} {l.locationCity && `· ${l.locationCity}`}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--accent)' }}>
                      £{(l.pricePence / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{ background: `${statusInfo.color}18`, color: statusInfo.color }}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {l.featured && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                            style={{ background: '#7c3aed18', color: '#7c3aed' }}>⭐ Vitrin</span>
                        )}
                        {l.urgent && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                            style={{ background: '#dc262618', color: '#dc2626' }}>🔴 Acil</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>
                      {new Date(l.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end flex-wrap">
                        {!l.confirm && (
                          <button onClick={() => approveListing(l.id)}
                            className="text-xs px-2 py-1 rounded font-medium text-white"
                            style={{ background: '#16a34a' }}>
                            Onayla
                          </button>
                        )}
                        <button onClick={() => toggleFeatured(l.id)}
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{
                            background: l.featured ? '#7c3aed' : 'var(--bg)',
                            color: l.featured ? 'white' : 'var(--muted)',
                            border: '1px solid var(--border)',
                          }}>
                          ⭐
                        </button>
                        <button onClick={() => toggleUrgent(l.id)}
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{
                            background: l.urgent ? '#dc2626' : 'var(--bg)',
                            color: l.urgent ? 'white' : 'var(--muted)',
                            border: '1px solid var(--border)',
                          }}>
                          🔴
                        </button>
                        <button onClick={() => deleteListing(l.id)}
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{ background: '#dc262618', color: '#dc2626' }}>
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {listings.length === 0 && !loading && (
            <div className="text-center py-12" style={{ color: 'var(--muted)' }}>İlan yok</div>
          )}
        </div>
      )}
    </div>
  );
}
