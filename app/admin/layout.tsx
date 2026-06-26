'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (user === null) { router.push('/auth/login'); return; }
    if (user && user.role !== 'admin') { router.push('/'); }
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  const nav = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/listings', label: 'İlanlar' },
    { href: '/admin/categories', label: 'Kategoriler' },
    { href: '/admin/users', label: 'Kullanıcılar' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <aside className="w-48 shrink-0 border-r" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>Admin</p>
          <nav className="space-y-1">
            {nav.map(n => (
              <Link key={n.href} href={n.href}
                className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: path === n.href ? 'var(--accent)' : 'transparent',
                  color: path === n.href ? 'white' : 'var(--text)',
                }}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
