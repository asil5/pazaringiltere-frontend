'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Stats {
  totalListings: number;
  totalUsers: number;
  activeListings: number;
  pendingListings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>('/api/admin/stats').then(setStats).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: 'Toplam İlan', value: stats.totalListings, color: '#2563eb' },
    { label: 'Aktif İlan', value: stats.activeListings, color: '#16a34a' },
    { label: 'Onay Bekleyen', value: stats.pendingListings, color: '#d97706' },
    { label: 'Toplam Üye', value: stats.totalUsers, color: 'var(--accent)' },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {!stats ? (
        <p style={{ color: 'var(--muted)' }}>Yükleniyor...</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(c => (
            <div key={c.label} className="rounded-xl border p-5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-sm mb-1" style={{ color: 'var(--muted)' }}>{c.label}</p>
              <p className="text-3xl font-bold" style={{ color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
