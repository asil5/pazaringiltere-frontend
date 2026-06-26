'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar({ defaultQ, defaultCity }: { defaultQ?: string; defaultCity?: string }) {
  const [q, setQ] = useState(defaultQ || '');
  const [city, setCity] = useState(defaultCity || '');
  const router = useRouter();

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    router.push(`/?${params}`);
  };

  return (
    <form onSubmit={search} className="flex gap-2 mb-6">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Ne arıyorsun?"
        className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      />
      <input
        value={city}
        onChange={e => setCity(e.target.value)}
        placeholder="Şehir"
        className="w-32 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      />
      <button type="submit"
        className="px-4 py-2 rounded-lg text-white text-sm font-medium"
        style={{ background: 'var(--accent)' }}>
        Ara
      </button>
    </form>
  );
}
