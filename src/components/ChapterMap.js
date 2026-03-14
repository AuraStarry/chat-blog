'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export default function ChapterMap({ locations }) {
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [activeLoc, setActiveLoc] = useState(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined' || !mapRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) {
      setError('Missing Google Maps API Key');
      return;
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places']
    });

    let isMounted = true;

    loader.load().then(async (google) => {
      if (!isMounted || !mapRef.current) return;

      try {
        const mapInstance = new google.maps.Map(mapRef.current, {
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
            geocoder.geocode({ address: loc.name }, (res, status) => {
              if (status === 'OK' && res && res[0]) {
                resolve({ ...loc, position: res[0].geometry.location });
              } else {
                resolve(null);
              }
            });
          });
        });

        const results = await Promise.all(geocodePromises);
        if (!isMounted) return;

        const validResults = results.filter(Boolean);
        if (validResults.length > 0) {
          validResults.forEach((loc) => {
            bounds.extend(loc.position);
            const marker = new google.maps.Marker({
              position: loc.position,
              map: mapInstance,
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
          mapInstance.fitBounds(bounds, 50);
        }
      } catch (err) {
        console.error('Map initialization error:', err);
        if (isMounted) setError(err.message);
      }
    }).catch(err => {
      console.error('Loader error:', err);
      if (isMounted) setError(err.message);
    });

    return () => {
      isMounted = false;
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    };
  }, [locations]);

  return (
    <div className="mb-12 bg-slate-100 rounded-3xl overflow-hidden aspect-[16/10] relative border border-slate-200 shadow-sm">
      <div ref={mapRef} className="w-full h-full" />
      
      {error && (
        <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center z-10">
          <p className="text-xs font-bold text-slate-400">Map Loading Issue</p>
          <p className="text-[10px] text-slate-400 mt-1">{error}</p>
        </div>
      )}

      {activeLoc && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-50">
          <div className="pointer-events-auto w-full max-w-[240px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">地點詳情</span>
              <button onClick={() => setActiveLoc(null)} className="text-slate-300 hover:text-slate-600">
                ✕
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

      {!activeLoc && !error && (
        <div className="absolute bottom-6 left-6 pointer-events-none">
          <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            點擊插針查看詳情
          </div>
        </div>
      )}
    </div>
  );
}
