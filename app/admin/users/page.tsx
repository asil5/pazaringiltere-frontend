'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ users: User[]; total: number }>('/api/admin/users')
      .then(r => { setUsers(r.users); setTotal(r.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const deactivate = async (id: string) => {
    if (!confirm('Bu kullanıcıyı deaktive etmek istediğinden emin misin?')) return;
    await api.patch(`/api/admin/users/${id}/deactivate`, {});
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: false } : u));
  };

  if (loading) return <p style={{ color: 'var(--muted)' }}>Yükleniyor...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Kullanıcılar <span className="text-base font-normal" style={{ color: 'var(--muted)' }}>({total})</span>
      </h1>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Kullanıcı</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Rol</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Durum</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Kayıt Tarihi</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: 'var(--surface)' }}>
                <td className="px-4 py-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{
                      background: u.role === 'admin' ? '#c84b3118' : '#6b728018',
                      color: u.role === 'admin' ? 'var(--accent)' : '#6b7280',
                    }}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{
                      background: u.active ? '#16a34a18' : '#dc262618',
                      color: u.active ? '#16a34a' : '#dc2626',
                    }}>
                    {u.active ? 'Aktif' : 'Deaktif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>
                  {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.active && u.role !== 'admin' && (
                    <button onClick={() => deactivate(u.id)}
                      className="text-xs px-2 py-1 rounded font-medium text-white"
                      style={{ background: '#dc2626' }}>
                      Deaktive Et
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
