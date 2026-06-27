'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Store {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  phone: string | null;
  active: boolean;
  created_at: string;
  user_name: string;
  user_email: string;
  listing_count: string;
}

export default function AdminStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get<{ stores: Store[]; total: number }>('/api/admin/stores')
      .then(r => { setStores(r.stores); setTotal(r.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const activate = async (id: string) => {
    await api.patch(`/api/admin/stores/${id}/activate`, {});
    setStores(prev => prev.map(s => s.id === id ? { ...s, active: true } : s));
  };

  const deactivate = async (id: string) => {
    await api.patch(`/api/admin/stores/${id}/deactivate`, {});
    setStores(prev => prev.map(s => s.id === id ? { ...s, active: false } : s));
  };

  const deleteStore = async (id: string) => {
    if (!confirm('Bu mağazayı silmek istediğinden emin misin?')) return;
    await api.delete(`/api/admin/stores/${id}`);
    setStores(prev => prev.filter(s => s.id !== id));
    setTotal(prev => prev - 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Mağazalar
          <span className="text-base font-normal ml-2" style={{ color: 'var(--muted)' }}>({total})</span>
        </h1>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Yükleniyor...</p>
      ) : stores.length === 0 ? (
        <div className="text-center py-16 rounded-xl border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          <p className="text-4xl mb-2">🏪</p>
          <p>Henüz mağaza yok.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Mağaza</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Sahip</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>İlan</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Durum</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Tarih</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s, i) => (
                <tr key={s.id}
                  style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: 'var(--surface)' }}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.name}</p>
                    {s.slug ? (
                      <Link href={`/magaza/${s.slug}`}
                        className="text-xs hover:underline" style={{ color: 'var(--accent)' }}
                        target="_blank">
                        /magaza/{s.slug}
                      </Link>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>Slug yok</span>
                    )}
                    {s.description && (
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--muted)' }}>{s.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm">{s.user_name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.user_email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{s.listing_count}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        background: s.active ? '#16a34a18' : '#d9780618',
                        color: s.active ? '#16a34a' : '#d97806',
                      }}>
                      {s.active ? '✓ Aktif' : '⏳ Bekliyor'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>
                    {new Date(s.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {!s.active ? (
                        <button onClick={() => activate(s.id)}
                          className="text-xs px-2 py-1 rounded font-medium text-white"
                          style={{ background: '#16a34a' }}>
                          Onayla
                        </button>
                      ) : (
                        <button onClick={() => deactivate(s.id)}
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{ background: '#d9780618', color: '#d97806', border: '1px solid #d97806' }}>
                          Durdur
                        </button>
                      )}
                      <button onClick={() => deleteStore(s.id)}
                        className="text-xs px-2 py-1 rounded font-medium"
                        style={{ background: '#dc262618', color: '#dc2626' }}>
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
