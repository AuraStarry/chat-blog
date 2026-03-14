'use client';

export default function ChapterMap({ locations }) {
  // To have pins move with the map, we MUST use a real Map SDK or 
  // at least the Google Maps Embed API's native marker feature.
  // Since we don't have lat/lng in frontmatter yet, we use the Search mode 
  // which automatically places markers for query matches.
  
  const searchQuery = locations.map(l => l.name).join('|');
  const mapUrl = `https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(searchQuery)}`;

  return (
    <section className="mb-12">
      <div className="bg-slate-100 rounded-3xl overflow-hidden aspect-[16/10] relative border border-slate-200 shadow-sm">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={mapUrl}
        ></iframe>
        
        {/* Floating Tooltip/Legend for context */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
          <div className="bg-white/90 backdrop-blur p-3 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between pointer-events-auto">
            <div className="flex gap-2">
              {locations.map((loc, idx) => (
                <a 
                  key={idx}
                  href={`#${loc.slug}`}
                  className="bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold text-slate-600 transition-colors"
                >
                  📍 {loc.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-400 font-medium">
        提示：點擊地圖上的紅色標記可查看地點詳情；點擊上方按鈕可快速跳轉至對應段落。
      </p>
    </section>
  );
}
