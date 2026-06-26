import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  pricePence: number;
  locationCity: string;
  images: string[];
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const img = listing.images?.[0];
  const price = (listing.pricePence / 100).toFixed(2);

  return (
    <Link href={`/listings/${listing.id}`}
      className="block rounded-lg overflow-hidden border transition-shadow hover:shadow-md"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="aspect-square bg-gray-100 relative">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${process.env.NEXT_PUBLIC_API_URL}${img}`} alt={listing.title}
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📷</div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium line-clamp-2 mb-1">{listing.title}</p>
        <p className="text-base font-bold" style={{ color: 'var(--accent)' }}>£{price}</p>
        {listing.locationCity && (
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>📍 {listing.locationCity}</p>
        )}
      </div>
    </Link>
  );
}
