'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Store {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  phone: string | null;
  active: boolean;
  createdAt: string;
}

interface Listing {
  id: string;
  title: string;
  pricePence: number;
  status: string;
  confirm: boolean;
  createdAt: string;
  images: string[];
}

const STATUS = (l: Listing) =>
  !l.confirm ? { text: 'Onay bekliyor', color: '#d97706' }
  : l.status === 'ACTIVE' ? { text: 'Yayında', color: '#16a34a' }
  : l.status === 'SOLD' ? { text: 'Satıldı', color: '#6b7280' }
  : { text: l.status, color: 'var(--muted)' };

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ilanlar' | 'magaza'>('ilanlar');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', pricePence: '' });

  // Mağaza state
  const [store, setStore] = useState<Store | null | undefined>(undefined); // undefined=yükleniyor
  const [storeForm, setStoreForm] = useState({ name: '', slug: '', description: '', phone: '' });
  const [storeEditing, setStoreEditing] = useState(false);
  const [storeSaving, setStoreSaving] = useState(false);
  const [storeError, setStoreError] = useState('');

  useEffect(() => {
    if (!user) return;
    api.get<{ user: any }>('/api/users/me').then(r => setPhone(r.user.phone || '')).catch(() => {});
    api.get<{ listings: Listing[] }>('/api/listings/mine')
      .then(r => setListings(r.listings))
      .catch(() => {})
      .finally(() => setLoading(false));
    api.get<Store | null>('/api/stores/me')
      .then(r => { setStore(r); if (r) setStoreForm({ name: r.name, slug: r.slug ?? '', description: r.description ?? '', phone: r.phone ?? '' }); })
      .catch(() => setStore(null));
  }, [user]);

  const savePhone = async () => {
    setSavingPhone(true);
    await api.patch('/api/users/me', { phone });
    setSavingPhone(false);
    setEditingPhone(false);
  };

  const openEdit = (l: Listing) => {
    setEditId(l.id);
    setEditForm({ title: l.title, pricePence: String(l.pricePence / 100) });
  };

  const saveEdit = async () => {
    if (!editId) return;
    const pricePence = Math.round(parseFloat(editForm.pricePence) * 100);
    await api.patch(`/api/listings/${editId}`, { title: editForm.title, pricePence });
    setListings(prev => prev.map(l => l.id === editId ? { ...l, title: editForm.title, pricePence } : l));
    setEditId(null);
  };

  const sf = (k: string, v: string) => setStoreForm(f => ({ ...f, [k]: v }));

  const createStore = async () => {
    if (!storeForm.name || !storeForm.slug) { setStoreError('Mağaza adı ve URL gerekli'); return; }
    setStoreSaving(true); setStoreError('');
    try {
      const res = await api.post<Store>('/api/stores', storeForm);
      setStore(res);
      setStoreEditing(false);
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('SLUG_TAKEN')) setStoreError('Bu URL kullanımda, başka bir tane dene');
      else if (msg.includes('STORE_ALREADY_EXISTS')) setStoreError('Zaten bir mağazan var');
      else setStoreError('Hata oluştu');
    } finally { setStoreSaving(false); }
  };

  const updateStore = async () => {
    setStoreSaving(true); setStoreError('');
    try {
      const res = await api.patch<Store>('/api/stores/me', storeForm);
      setStore(res);
      setStoreEditing(false);
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('SLUG_TAKEN')) setStoreError('Bu URL kullanımda');
      else setStoreError('Hata oluştu');
    } finally { setStoreSaving(false); }
  };

  const slugify = (v: string) =>
    v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 50);

  const markSold = async (id: string) => {
    if (!confirm('Bu ilanı satıldı olarak işaretlemek istediğinden emin misin?')) return;
    await api.patch(`/api/listings/${id}/sold`, {});
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'SOLD' } : l));
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Bu ilanı silmek istediğinden emin misin?')) return;
    await api.delete(`/api/listings/${id}`);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  if (!user) return null;

  const active  = listings.filter(l => l.confirm && l.status === 'ACTIVE').length;
  const pending = listings.filter(l => !l.confirm).length;
  const sold    = listings.filter(l => l.status === 'SOLD').length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profilim</h1>

      {/* Kullanıcı kartı */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
            style={{ background: 'var(--accent)' }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{user.email}</p>
          </div>
        </div>

        {/* WhatsApp / Telefon */}
        <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm font-medium mb-2">WhatsApp / Telefon</p>
          {editingPhone ? (
            <div className="flex gap-2">
              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+44 7700 000000"
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              <button onClick={savePhone} disabled={savingPhone}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: 'var(--accent)', opacity: savingPhone ? 0.7 : 1 }}>
                {savingPhone ? '...' : 'Kaydet'}
              </button>
              <button onClick={() => setEditingPhone(false)}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                İptal
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: phone ? 'var(--text)' : 'var(--muted)' }}>
                {phone || 'Telefon eklenmedi'}
              </span>
              <button onClick={() => setEditingPhone(true)}
                className="text-xs px-2 py-1 rounded font-medium"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                {phone ? 'Düzenle' : 'Ekle'}
              </button>
            </div>
          )}
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Alıcılar sana WhatsApp üzerinden ulaşabilir</p>
        </div>
      </div>

      {/* Tab seçici */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        {(['ilanlar', 'magaza'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderColor: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
            }}>
            {tab === 'ilanlar' ? '📋 İlanlarım' : '🏪 Mağazam'}
          </button>
        ))}
      </div>

      {/* ── MAĞAZAM TABU ─────────────────────────────────────────────── */}
      {activeTab === 'magaza' && (
        <div>
          {store === undefined ? (
            <p style={{ color: 'var(--muted)' }}>Yükleniyor...</p>
          ) : store && !storeEditing ? (
            /* Mağaza bilgisi göster */
            <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                    style={{ background: 'var(--accent)' }}>
                    {store.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{store.name}</p>
                    {store.slug && (
                      <Link href={`/magaza/${store.slug}`} target="_blank"
                        className="text-xs hover:underline" style={{ color: 'var(--accent)' }}>
                        pazaringiltere.co.uk/magaza/{store.slug} ↗
                      </Link>
                    )}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium shrink-0"
                  style={{
                    background: store.active ? '#16a34a18' : '#d9780618',
                    color: store.active ? '#16a34a' : '#d97806',
                  }}>
                  {store.active ? '✓ Aktif' : '⏳ Admin onayı bekleniyor'}
                </span>
              </div>
              {store.description && (
                <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>{store.description}</p>
              )}
              {store.phone && (
                <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>📞 {store.phone}</p>
              )}
              {!store.active && (
                <div className="rounded-lg p-3 mb-4 text-sm"
                  style={{ background: '#d9780610', border: '1px solid #d9780640', color: '#92400e' }}>
                  Mağazan admin tarafından inceleniyor. Onaylandıktan sonra herkese açık olacak.
                </div>
              )}
              <button onClick={() => setStoreEditing(true)}
                className="text-sm px-4 py-2 rounded-lg font-medium"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                Düzenle
              </button>
            </div>
          ) : (
            /* Mağaza oluştur / düzenle formu */
            <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h2 className="font-semibold mb-4">{store ? 'Mağazayı Düzenle' : 'Mağaza Aç'}</h2>
              {!store && (
                <div className="rounded-lg p-3 mb-4 text-sm"
                  style={{ background: '#2563eb10', border: '1px solid #2563eb30', color: '#1e40af' }}>
                  Mağaza açtıktan sonra admin onayı bekleyecek. Ücretsiz.
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mağaza Adı *</label>
                  <input value={storeForm.name}
                    onChange={e => { sf('name', e.target.value); if (!store) sf('slug', slugify(e.target.value)); }}
                    placeholder="Örn: Ahmet'in Elektronik Mağazası"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mağaza URL'si *</label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>pazaringiltere.co.uk/magaza/</span>
                    <input value={storeForm.slug}
                      onChange={e => sf('slug', slugify(e.target.value))}
                      placeholder="ahmetin-elektronik"
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Açıklama</label>
                  <textarea value={storeForm.description} onChange={e => sf('description', e.target.value)}
                    rows={3} placeholder="Mağazanızı tanıtın..."
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp / Telefon</label>
                  <input value={storeForm.phone} onChange={e => sf('phone', e.target.value)}
                    placeholder="+44 7700 000000"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                {storeError && <p className="text-sm text-red-600">{storeError}</p>}
                <div className="flex gap-2">
                  <button onClick={store ? updateStore : createStore} disabled={storeSaving}
                    className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: 'var(--accent)' }}>
                    {storeSaving ? '...' : store ? 'Güncelle' : 'Mağaza Aç'}
                  </button>
                  {store && (
                    <button onClick={() => { setStoreEditing(false); setStoreError(''); }}
                      className="px-4 py-2 rounded-lg text-sm"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                      İptal
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── İLANLARIM TABU ───────────────────────────────────────────── */}
      {activeTab === 'ilanlar' && <>
      {/* İlan özet */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Yayında', value: active,  color: '#16a34a' },
          { label: 'Bekleyen', value: pending, color: '#d97706' },
          { label: 'Satıldı',  value: sold,    color: '#6b7280' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-4 text-center"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* İlanlarım */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-lg">İlanlarım</h2>
        <Link href="/listings/new" className="text-sm px-3 py-1.5 rounded-lg text-white font-medium"
          style={{ background: 'var(--accent)' }}>
          + Yeni İlan
        </Link>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Yükleniyor...</p>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 rounded-xl border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          Henüz ilanın yok.{' '}
          <Link href="/listings/new" style={{ color: 'var(--accent)' }}>İlk ilanını ver →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(l => {
            const s = STATUS(l);
            const img = l.images?.[0];
            return (
              <div key={l.id} className="rounded-xl border overflow-hidden"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                {editId === l.id ? (
                  <div className="p-4 space-y-3">
                    <p className="font-medium text-sm">İlanı Düzenle</p>
                    <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Başlık" className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                    <input value={editForm.pricePence} onChange={e => setEditForm(f => ({ ...f, pricePence: e.target.value }))}
                      placeholder="Fiyat (£)" type="number" step="0.01"
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                    <div className="flex gap-2">
                      <button onClick={saveEdit}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                        style={{ background: 'var(--accent)' }}>Kaydet</button>
                      <button onClick={() => setEditId(null)}
                        className="px-3 py-2 rounded-lg text-sm"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)' }}>İptal</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {img
                        ? <img src={img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL}${img}`} alt={l.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{l.title}</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--accent)' }}>
                        £{(l.pricePence / 100).toFixed(2)}
                      </p>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium mt-1 inline-block"
                        style={{ background: `${s.color}18`, color: s.color }}>{s.text}</span>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Link href={`/listings/${l.id}`}
                        className="text-xs px-2 py-1 rounded text-center font-medium"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                        Gör
                      </Link>
                      {l.status !== 'SOLD' && (
                        <button onClick={() => openEdit(l)}
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                          Düzenle
                        </button>
                      )}
                      {l.confirm && l.status === 'ACTIVE' && (
                        <button onClick={() => markSold(l.id)}
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{ background: '#6b728018', color: '#6b7280' }}>
                          Satıldı
                        </button>
                      )}
                      <button onClick={() => deleteListing(l.id)}
                        className="text-xs px-2 py-1 rounded font-medium"
                        style={{ background: '#dc262618', color: '#dc2626' }}>
                        Sil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </>}
    </div>
  );
}
