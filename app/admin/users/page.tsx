'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  phone: string | null;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = (q: string) => {
    setLoading(true);
    const qs = q ? `?search=${encodeURIComponent(q)}` : '';
    api.get<{ users: User[]; total: number }>(`/api/admin/users${qs}`)
      .then(r => { setUsers(r.users); setTotal(r.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(''); }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => load(val), 400);
  };

  const deactivate = async (id: string) => {
    if (!confirm('Bu kullanıcıyı deaktive etmek istediğinden emin misin?')) return;
    await api.patch(`/api/admin/users/${id}/deactivate`, {});
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: false } : u));
  };

  const changeRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Bu kullanıcıyı ${newRole} yapmak istediğinden emin misin?`)) return;
    await api.patch(`/api/admin/users/${id}/role`, { role: newRole });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          Kullanıcılar <span className="text-base font-normal" style={{ color: 'var(--muted)' }}>({total})</span>
        </h1>
      </div>

      {/* Arama */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="İsim veya email ara..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="w-72 px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        />
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Yükleniyor...</p>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Kullanıcı</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Telefon</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Rol</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Durum</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--muted)' }}>Kayıt</th>
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
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>
                    {u.phone || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        background: u.role === 'admin' ? '#7c3aed18' : '#6b728018',
                        color: u.role === 'admin' ? '#7c3aed' : '#6b7280',
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
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => changeRole(u.id, u.role)}
                        className="text-xs px-2 py-1 rounded font-medium"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                        {u.role === 'admin' ? '→ user' : '→ admin'}
                      </button>
                      {u.active && u.role !== 'admin' && (
                        <button onClick={() => deactivate(u.id)}
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{ background: '#dc262618', color: '#dc2626' }}>
                          Deaktive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
            <div className="text-center py-12" style={{ color: 'var(--muted)' }}>Kullanıcı bulunamadı</div>
          )}
        </div>
      )}
    </div>
  );
}
