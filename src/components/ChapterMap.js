'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export default function ChapterMap({ locations }) {
  const mapRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(null);
  const [activeLoc, setActiveLoc] = useState(null);
  const markersRef = useRef([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    
    // Fallback if no API Key (prevents crash, but map won't work well)
    if (!apiKey) {
      console.warn('Google Maps API Key is missing.');
      return;
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places']
    });

    let mapInstance = null;

    loader.load().then(async (google) => {
      try {
        if (!mapRef.current) return;

        mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 37.05, lng: 138.85 },
          zoom: 11,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
            { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }] }
          ]
        });

        const geocoder = new google.maps.Geocoder();
        const bounds = new google.maps.LatLngBounds();

        const geocodePromises = locations.map(loc => {
          return new Promise((resolve) => {
            geocoder.geocode({ address: loc.name }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const position = results[0].geometry.location;
                bounds.extend(position);
                resolve({ ...loc, position });
              } else {
                resolve(null);
              }
            });
          });
        });

        const validResults = (await Promise.all(geocodePromises)).filter(Boolean);

        if (validResults.length > 0) {
          mapInstance.fitBounds(bounds, 50);
          
          validResults.forEach((loc) => {
            const marker = new google.maps.Marker({
              position: loc.position,
              map: mapInstance,
              title: loc.name,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#0f172a',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
                scale: 8,
              }
            });

            marker.addListener('click', () => {
              setActiveLoc(loc);
              mapInstance.panTo(loc.position);
            });

            markersRef.current.push(marker);
          });
        }
      } catch (err) {
        console.error('Map init error:', err);
        setError(err.message);
      }
    }).catch(err => {
      console.error('Loader error:', err);
      setError(err.message);
    });

    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    };
  }, [mounted, locations]);

  if (!mounted) {
    return <div className="mb-12 aspect-[16/10] bg-slate-100 rounded-3xl animate-pulse" />;
  }

  return (
    <section className="mb-12 relative group">
      <div className="bg-slate-100 rounded-3xl overflow-hidden aspect-[16/10] relative border border-slate-200 shadow-sm">
        {/* The Map Container */}
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Error Fallback */}
        {error && (
          <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
            <span className="text-4xl mb-4">⚠️</span>
            <h3 className="text-sm font-bold text-slate-800 mb-1">地圖載入失敗</h3>
            <p className="text-[10px] text-slate-500 max-w-[200px] mb-4">
              {error || '請檢查 API Key 權限或網路連線'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-full"
            >
              重新整理
            </button>
          </div>
        )}

        {/* Info Card Popover */}
        {activeLoc && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-50">
            <div className="pointer-events-auto w-full max-w-[240px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">地點詳情</span>
                <button onClick={() => setActiveLoc(null)} className="text-slate-300 hover:text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="mb-5">
                <div className="text-[10px] text-indigo-500 font-bold mb-1">{activeLoc.name}</div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">{activeLoc.title}</h4>
              </div>
              <div className="flex flex-col gap-2">
                <a href={`#${activeLoc.slug}`} onClick={() => setActiveLoc(null)} className="bg-slate-900 text-white py-3 rounded-xl text-xs font-bold text-center hover:bg-slate-800 transition-colors">跳轉到段落</a>
                <a href={activeLoc.url} target="_blank" rel="noopener noreferrer" className="bg-slate-100 text-slate-600 py-2.5 rounded-xl text-xs font-bold text-center hover:bg-slate-200 transition-colors">Google Maps ↗</a>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Tip */}
        {!activeLoc && !error && (
          <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              點擊插針查看詳情
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
