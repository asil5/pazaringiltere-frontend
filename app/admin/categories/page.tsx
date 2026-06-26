'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  level: number;
  sortOrder: number;
}

const COMMON_ICONS = ['🏠', '🚗', '📱', '👗', '🌿', '⚽', '📚', '🐶', '💼', '🔧', '🎮', '🎵', '🍕', '✈️', '💍'];

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);

  const [form, setForm] = useState({ name: '', slug: '', icon: '', parentId: '', sortOrder: '0' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get<{ categories: Category[] }>('/api/admin/categories')
      .then(r => setCategories(r.categories))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: '', slug: '', icon: '', parentId: '', sortOrder: '0' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || '',
      parentId: cat.parentId || '',
      sortOrder: String(cat.sortOrder),
    });
    setError('');
    setShowForm(true);
  };

  const handleNameChange = (val: string) => {
    setForm(f => ({ ...f, name: val, slug: editTarget ? f.slug : slugify(val) }));
  };

  const save = async () => {
    if (!form.name.trim() || !form.slug.trim()) { setError('İsim ve slug zorunlu'); return; }
    setSaving(true);
    setError('');
    try {
      const body = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        icon: form.icon || undefined,
        parentId: form.parentId ? Number(form.parentId) : undefined,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editTarget) {
        await api.patch(`/api/admin/categories/${editTarget.id}`, body);
      } else {
        await api.post('/api/admin/categories', body);
      }
      setShowForm(false);
      load();
    } catch (e: any) {
      setError(e.message || 'Hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (cat: Category) => {
    if (!confirm(`"${cat.name}" kategorisini silmek istediğinden emin misin?`)) return;
    try {
      await api.delete(`/api/admin/categories/${cat.id}`);
      setCategories(prev => prev.filter(c => c.id !== cat.id));
    } catch (e: any) {
      alert(e.message || 'Silinemedi');
    }
  };

  const topLevel = categories.filter(c => !c.parentId);
  const getChildren = (parentId: string) => categories.filter(c => c.parentId === parentId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Kategoriler <span className="text-base font-normal" style={{ color: 'var(--muted)' }}>({categories.length})</span>
        </h1>
        <button onClick={openAdd}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--accent)' }}>
          + Kategori Ekle
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl p-6 w-full max-w-md shadow-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="font-bold text-lg mb-4">{editTarget ? 'Kategori Düzenle' : 'Yeni Kategori'}</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>İsim *</label>
                <input value={form.name} onChange={e => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="Elektronik" />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Slug *</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="elektronik" />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>İkon (emoji)</label>
                <div className="flex gap-1 flex-wrap mb-2">
                  {COMMON_ICONS.map(ic => (
                    <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      className="w-8 h-8 rounded text-lg"
                      style={{
                        background: form.icon === ic ? 'var(--accent)' : 'var(--bg)',
                        border: '1px solid var(--border)',
                      }}>
                      {ic}
                    </button>
                  ))}
                </div>
                <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="veya emoji gir: 🏠" />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Üst Kategori (opsiyonel)</label>
                <select value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="">— Ana kategori —</option>
                  {topLevel.filter(c => c.id !== editTarget?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Sıra</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  min="0" />
              </div>

              {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={save} disabled={saving}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: 'var(--accent)', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Yükleniyor...</p>
      ) : (
        <div className="space-y-2">
          {topLevel.length === 0 && (
            <div className="text-center py-12" style={{ color: 'var(--muted)' }}>
              Henüz kategori yok. İlk kategoriyi ekle.
            </div>
          )}

          {topLevel.map(cat => {
            const children = getChildren(cat.id);
            return (
              <div key={cat.id} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                {/* Ana kategori satırı */}
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ background: 'var(--surface)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-8 text-center">{cat.icon || '📁'}</span>
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{cat.slug}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full ml-2"
                      style={{ background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                      {children.length} alt
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(cat)}
                      className="text-xs px-2 py-1 rounded font-medium"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                      Düzenle
                    </button>
                    <button onClick={() => deleteCategory(cat)}
                      className="text-xs px-2 py-1 rounded font-medium"
                      style={{ background: '#dc262618', color: '#dc2626' }}>
                      Sil
                    </button>
                  </div>
                </div>

                {/* Alt kategoriler */}
                {children.map((child, ci) => (
                  <div key={child.id} className="flex items-center justify-between px-4 py-2.5"
                    style={{
                      background: 'var(--bg)',
                      borderTop: '1px solid var(--border)',
                    }}>
                    <div className="flex items-center gap-3 pl-8">
                      <span className="text-base">{child.icon || '▸'}</span>
                      <div>
                        <p className="text-sm font-medium">{child.name}</p>
                        <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{child.slug}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(child)}
                        className="text-xs px-2 py-1 rounded font-medium"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                        Düzenle
                      </button>
                      <button onClick={() => deleteCategory(child)}
                        className="text-xs px-2 py-1 rounded font-medium"
                        style={{ background: '#dc262618', color: '#dc2626' }}>
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
