'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const UK_CITIES = [
  'London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool',
  'Sheffield', 'Bristol', 'Leicester', 'Coventry', 'Bradford',
  'Nottingham', 'Newcastle', 'Glasgow', 'Edinburgh',
];

// Her üst kategori için filtre tanımları
const FILTER_CONFIG: Record<string, { label: string; sections: Section[] }> = {
  emlak: {
    label: 'Emlak',
    sections: [
      { title: 'Fiyat Aralığı (£)', fields: [
        { key: 'priceMin', label: 'Minimum', type: 'number', placeholder: 'min' },
        { key: 'priceMax', label: 'Maksimum', type: 'number', placeholder: 'max' },
      ]},
      { title: 'İl', fields: [
        { key: 'city', label: 'Şehir', type: 'select', options: UK_CITIES },
      ]},
    ],
  },
  vasita: {
    label: 'Vasıta',
    sections: [
      { title: 'Fiyat Aralığı (£)', fields: [
        { key: 'priceMin', label: 'Minimum', type: 'number', placeholder: 'min' },
        { key: 'priceMax', label: 'Maksimum', type: 'number', placeholder: 'max' },
      ]},
      { title: 'İl', fields: [
        { key: 'city', label: 'Şehir', type: 'select', options: UK_CITIES },
      ]},
    ],
  },
  default: {
    label: 'Filtrele',
    sections: [
      { title: 'Fiyat Aralığı (£)', fields: [
        { key: 'priceMin', label: 'Minimum', type: 'number', placeholder: 'min' },
        { key: 'priceMax', label: 'Maksimum', type: 'number', placeholder: 'max' },
      ]},
      { title: 'İl', fields: [
        { key: 'city', label: 'Şehir', type: 'select', options: UK_CITIES },
      ]},
    ],
  },
};

interface Field {
  key: string; label: string; type: 'number' | 'select';
  placeholder?: string; options?: string[];
}
interface Section { title: string; fields: Field[]; }

// slug'dan üst kategori tipini çıkar
function getCategoryType(slug: string): string {
  if (['emlak','satilik-konut','kiralik-konut','isyeri-ofis','arsa-tarla'].includes(slug)) return 'emlak';
  if (['vasita','otomobil','motosiklet','ticari-arac','yedek-parca'].includes(slug)) return 'vasita';
  return 'default';
}

export default function CategoryFilters({
  slug,
  currentParams,
}: {
  slug: string;
  currentParams: Record<string, string>;
}) {
  const router = useRouter();
  const type = getCategoryType(slug);
  const config = FILTER_CONFIG[type] ?? FILTER_CONFIG.default;

  const [values, setValues] = useState<Record<string, string>>({
    priceMin: currentParams.priceMin ?? '',
    priceMax: currentParams.priceMax ?? '',
    city:     currentParams.city ?? '',
  });

  function apply() {
    const p = new URLSearchParams();
    if (values.priceMin) p.set('priceMin', values.priceMin);
    if (values.priceMax) p.set('priceMax', values.priceMax);
    if (values.city)     p.set('city', values.city);
    const qs = p.toString();
    router.push(`/kategori/${slug}${qs ? `?${qs}` : ''}`);
  }

  function reset() {
    setValues({ priceMin: '', priceMax: '', city: '' });
    router.push(`/kategori/${slug}`);
  }

  const hasFilters = Object.values(values).some(v => v !== '');

  return (
    <div className="rounded-xl border overflow-hidden mt-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="px-4 py-3 font-semibold text-sm flex items-center gap-2"
        style={{ borderBottom: '1px solid var(--border)' }}>
        ▼ Arama Daraltma
      </div>

      <div className="p-3 space-y-4">
        {config.sections.map(section => (
          <div key={section.title}>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wide"
              style={{ color: 'var(--muted)' }}>
              {section.title}
            </p>
            {section.fields.map(field => (
              <div key={field.key} className="mb-2">
                {field.type === 'select' ? (
                  <select
                    value={values[field.key] ?? ''}
                    onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  >
                    <option value="">Tümü</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type="number"
                    placeholder={field.placeholder ?? field.label}
                    value={values[field.key] ?? ''}
                    onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        <button
          onClick={apply}
          className="w-full py-2 rounded text-sm font-semibold text-white"
          style={{ background: 'var(--accent)' }}>
          Aramayı Daralt
        </button>

        {hasFilters && (
          <button
            onClick={reset}
            className="w-full py-1.5 rounded text-sm"
            style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}>
            Temizle
          </button>
        )}
      </div>
    </div>
  );
}
