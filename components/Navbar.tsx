'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight" style={{ color: 'var(--accent)' }}>
          Pazar İngiltere
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/listings/new"
                className="px-3 py-1.5 rounded text-white text-sm font-medium"
                style={{ background: 'var(--accent)' }}>
                + İlan Ver
              </Link>
              <span style={{ color: 'var(--muted)' }}>{user.name}</span>
              <button onClick={handleLogout} style={{ color: 'var(--muted)' }}>Çıkış</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ color: 'var(--muted)' }}>Giriş</Link>
              <Link href="/auth/register"
                className="px-3 py-1.5 rounded text-white text-sm font-medium"
                style={{ background: 'var(--accent)' }}>
                Üye Ol
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
