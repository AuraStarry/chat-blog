'use client';
import { useState } from 'react';

export default function ChapterMap({ locations }) {
  const [activeId, setActiveId] = useState(null);

  // We can't easily get the real map coordinates from short URLs without a backend service,
  // so we'll use a scattered layout for the visual representation.
  // In a production version, we'd store lat/lng in the markdown frontmatter.
  
  return (
    <section className="mb-12">
      <div className="bg-slate-200 rounded-3xl overflow-hidden aspect-[16/10] relative border border-slate-200 shadow-inner">
        {/* Map Background (Visual only to avoid sync issues) */}
        <div className="absolute inset-0 bg-slate-100 opacity-50">
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>
        
        {/* Interactive Overlay */}
        <div className="absolute inset-0 p-8">
          <div className="relative w-full h-full">
            {locations.map((loc, idx) => {
              // Calculate a slightly better distribution than random
              // This is a placeholder for real lat/lng logic
              const rows = Math.ceil(Math.sqrt(locations.length));
              const r = Math.floor(idx / rows);
              const c = idx % rows;
              
              const top = 25 + (r * 35) + (idx % 2 ? 5 : -5);
              const left = 20 + (c * 40) + (idx % 3 ? 5 : -5);
              
              const isActive = activeId === idx;

              return (
                <div 
                  key={idx} 
                  className="absolute transition-all duration-300"
                  style={{ 
                    top: `${Math.min(85, Math.max(15, top))}%`, 
                    left: `${Math.min(85, Math.max(15, left))}%`,
                    zIndex: isActive ? 50 : 10
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveId(isActive ? null : idx);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border transition-all cursor-pointer outline-none
                      ${isActive 
                        ? 'bg-slate-900 border-slate-900 text-white scale-110' 
                        : 'bg-white border-slate-200 text-slate-900 hover:scale-105 active:scale-95'
                      }`}
                  >
                    <span className="text-sm">📍</span>
                    <span className="text-xs font-bold whitespace-nowrap">{loc.name}</span>
                  </button>

                  {/* Popover Callout */}
                  {isActive && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200">
                      <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">文章連結</div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight mb-4">{loc.title}</h4>
                      
                      <div className="flex flex-col gap-2">
                        <a 
                          href={`#${loc.slug}`}
                          onClick={() => setActiveId(null)}
                          className="flex items-center justify-center bg-slate-900 text-white py-2 rounded-xl text-xs font-bold transition-colors hover:bg-slate-800"
                        >
                          跳轉到該段落
                        </a>
                        <a 
                          href={loc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center bg-slate-100 text-slate-600 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-slate-200"
                        >
                          打開 Google Maps ↗
                        </a>
                      </div>

                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[10px] border-transparent border-t-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend / Tip */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-white/20 text-[10px] font-bold text-slate-500 shadow-sm">
            {activeId !== null ? '已選取地點' : '點擊地點插針查看內容'}
          </div>
        </div>
      </div>
    </section>
  );
}
