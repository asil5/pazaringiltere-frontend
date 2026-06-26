'use client';

import { useState } from 'react';

export default function PhotoGallery({ images, title, base }: { images: string[]; title: string; base: string }) {
  const [active, setActive] = useState(0);

  if (!images?.length) {
    return (
      <div className="aspect-[4/3] rounded-xl flex items-center justify-center text-6xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        📷
      </div>
    );
  }

  return (
    <div>
      {/* Ana fotoğraf */}
      <div className="aspect-[4/3] rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${base}${images[active]}`}
          alt={`${title} - ${active + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnail'lar */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="shrink-0 w-16 h-12 rounded overflow-hidden transition-opacity"
              style={{
                border: i === active ? '2px solid var(--accent)' : '2px solid transparent',
                opacity: i === active ? 1 : 0.6,
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${base}${img}`} alt={`${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fotoğraf sayısı */}
      <p className="text-xs text-center mt-1" style={{ color: 'var(--muted)' }}>
        {active + 1} / {images.length} fotoğraf
      </p>
    </div>
  );
}
