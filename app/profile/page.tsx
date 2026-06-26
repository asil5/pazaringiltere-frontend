'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  pricePence: number;
  locationCity: string;
  images: string[];
  status: string;
  confirm: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    api.get<{ listings: Listing[] }>('/api/listings/mine')
      .then(r => setListings(r.listings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  if (!user) return null;

  const statusLabel = (l: Listing) => {
    if (l.status === 'sold') return { text: 'Satıldı', color: '#6b7280' };
    if (!l.confirm) return { text: 'Onay bekliyor', color: '#d97706' };
    if (l.status === 'active') return { text: 'Yayında', color: '#16a34a' };
    return { text: l.status, color: 'var(--muted)' };
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="rounded-xl border p-6 mb-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{user.email}</p>
            {user.role === 'admin' && (
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded font-medium text-white" style={{ background: 'var(--accent)' }}>
                Admin
              </span>
            )}
          </div>
          <Link href="/listings/new"
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ background: 'var(--accent)' }}>
            + İlan Ver
          </Link>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">İlanlarım</h2>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Yükleniyor...</p>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 border rounded-xl" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          <p className="text-4xl mb-3">📦</p>
          <p className="mb-4">Henüz ilanın yok.</p>
          <Link href="/listings/new"
            className="inline-block px-5 py-2 rounded-lg text-white text-sm font-medium"
            style={{ background: 'var(--accent)' }}>
            İlk ilanını ver
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(l => {
            const s = statusLabel(l);
            const price = (l.pricePence / 100).toFixed(2);
            return (
              <Link key={l.id} href={`/listings/${l.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border transition-shadow hover:shadow-sm"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="w-14 h-14 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                  {l.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${process.env.NEXT_PUBLIC_API_URL}/${l.images[0]}`} alt={l.title}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{l.title}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--accent)' }}>£{price}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full shrink-0"
                  style={{ background: `${s.color}18`, color: s.color }}>
                  {s.text}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
