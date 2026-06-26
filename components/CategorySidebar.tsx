'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Category {
  id: string; name: string; slug: string;
  icon: string | null; parentId: string | null; level: number;
}

export default function CategorySidebar({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  const parents = categories.filter(c => !c.parentId);
  const children = (pid: string) => categories.filter(c => c.parentId === pid);

  // Aktif slug'ın parent'ını bul → o section açık başlasın
  const activeCategory = categories.find(c => c.slug === activeSlug);
  const activeParentId = activeCategory?.parentId ?? (activeCategory && !activeCategory.parentId ? activeCategory.id : null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    activeParentId ? { [activeParentId]: true } : {}
  );

  return (
    <aside className="w-52 shrink-0">
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="px-4 py-3 font-semibold text-sm flex items-center gap-2"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <span>☰</span> Kategoriler
        </div>
        <nav className="py-1">
          {parents.map(cat => {
            const subs = children(cat.id);
            const open = expanded[cat.id];
            const isActive = activeSlug === cat.slug;

            return (
              <div key={cat.id}>
                <button
                  onClick={() => setExpanded(e => ({ ...e, [cat.id]: !e[cat.id] }))}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors hover:opacity-80"
                  style={{
                    color: 'var(--text)',
                    background: isActive ? 'rgba(var(--accent-rgb, 59,130,246),0.08)' : 'transparent',
                  }}>
                  <span className="flex items-center gap-2 font-medium">
                    <span>{cat.icon || '📁'}</span>
                    <span>{cat.name}</span>
                  </span>
                  {subs.length > 0 && (
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {open ? '▾' : '▸'}
                    </span>
                  )}
                </button>

                {open && subs.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    {subs.map(sub => {
                      const subActive = activeSlug === sub.slug;
                      return (
                        <Link key={sub.id} href={`/kategori/${sub.slug}`}
                          className="flex items-center gap-2 pl-8 pr-4 py-1.5 text-xs transition-colors hover:opacity-80"
                          style={{
                            color: subActive ? 'var(--accent)' : 'var(--muted)',
                            fontWeight: subActive ? 600 : 400,
                            background: subActive ? 'rgba(59,130,246,0.06)' : 'transparent',
                          }}>
                          <span>{sub.icon}</span>
                          <span>{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
