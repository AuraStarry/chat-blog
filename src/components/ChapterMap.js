'use client';
import { useState } from 'react';

export default function ChapterMap({ locations }) {
  const [activeId, setActiveId] = useState(null);

  return (
    <section className="mb-12">
      <div className="bg-slate-100 rounded-3xl overflow-hidden aspect-[16/10] relative border border-slate-200 shadow-sm">
        {/* Map Background - Real Embed if Key exists, otherwise a themed placeholder */}
        <div className="absolute inset-0">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0, opacity: 0.4, filter: 'grayscale(0.5)' }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(locations.map(l => l.name).join('|'))}`}
          ></iframe>
          {/* Subtle grid overlay to make pins pop */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_0.5px,transparent_0.5px)] [background-size:20px_20px] pointer-events-none" />
        </div>
        
        {/* Interactive Overlay */}
        <div className="absolute inset-0 p-8 pointer-events-none">
          <div className="relative w-full h-full">
            {locations.map((loc, idx) => {
              // Simulated distribution
              const rows = Math.ceil(Math.sqrt(locations.length));
              const r = Math.floor(idx / rows);
              const c = idx % rows;
              
              const top = 20 + (r * 40) + (idx % 2 ? 8 : -8);
              const left = 20 + (c * 40) + (idx % 3 ? 10 : -10);
              
              const isActive = activeId === idx;

              return (
                <div 
                  key={idx} 
                  className="absolute transition-all duration-300 pointer-events-auto"
                  style={{ 
                    top: `${Math.min(80, Math.max(20, top))}%`, 
                    left: `${Math.min(80, Math.max(20, left))}%`,
                    zIndex: isActive ? 50 : 10
                  }}
                >
                  {/* Pin Only Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveId(isActive ? null : idx);
                    }}
                    className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg border transition-all cursor-pointer outline-none
                      ${isActive 
                        ? 'bg-slate-900 border-slate-900 scale-110' 
                        : 'bg-white border-slate-200 hover:scale-110 active:scale-95'
                      }`}
                  >
                    <span className="text-xl">📍</span>
                  </button>

                  {/* Popover Callout */}
                  {isActive && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-60 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-slate-100 p-4 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">地點資訊</div>
                        <button 
                          onClick={() => setActiveId(null)}
                          className="text-slate-300 hover:text-slate-500"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="mb-2">
                        <div className="text-[10px] text-indigo-500 font-bold mb-0.5">{loc.name}</div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{loc.title}</h4>
                      </div>
                      
                      <div className="mt-4 flex flex-col gap-2">
                        <a 
                          href={`#${loc.slug}`}
                          onClick={() => setActiveId(null)}
                          className="flex items-center justify-center bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold transition-colors hover:bg-slate-800"
                        >
                          跳轉段落
                        </a>
                        <a 
                          href={loc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center bg-slate-100 text-slate-600 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-slate-200"
                        >
                          Google Maps ↗
                        </a>
                      </div>

                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend / Tip */}
        <div className="absolute bottom-6 left-6 flex items-center pointer-events-none">
          <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold text-slate-400 shadow-sm">
            點擊插針查看文章段落
          </div>
        </div>
      </div>
    </section>
  );
}
