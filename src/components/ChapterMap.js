'use client';
import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

export default function ChapterMap({ locations }) {
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [activeLoc, setActiveLoc] = useState(null);
  const [markerCount, setMarkerCount] = useState(0);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Missing API Key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)');
      return;
    }

    setOptions({
      apiKey: apiKey,
      version: 'weekly'
    });

    let isMounted = true;

    const initMap = async () => {
      try {
        const [mapsLib, geocodingLib, markerLib] = await Promise.all([
          importLibrary('maps'),
          importLibrary('geocoding'),
          importLibrary('marker')
        ]);

        if (!isMounted || !mapRef.current) return;

        // Use standard way to access libraries to avoid destructing issues across versions
        const { Map, LatLngBounds } = mapsLib;
        const { Geocoder } = geocodingLib;
        const { Marker, SymbolPath } = markerLib;

        const mapInstance = new Map(mapRef.current, {
          center: { lat: 37.05, lng: 138.85 },
          zoom: 11,
          disableDefaultUI: true,
          zoomControl: true,
          // Advanced markers technically require a Map ID, but we use legacy Marker for simplicity
          // mapId: "DEMO_MAP_ID", 
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        const geocoder = new Geocoder();
        const bounds = new LatLngBounds();

        // Geocode addresses
        const results = await Promise.all(
          locations.map(loc => {
            return new Promise((resolve) => {
              geocoder.geocode({ address: loc.name }, (res, status) => {
                if (status === 'OK' && res?.[0]) {
                  resolve({ ...loc, position: res[0].geometry.location });
                } else {
                  console.warn(`Geocoding failed for ${loc.name}: ${status}`);
                  resolve(null);
                }
              });
            });
          })
        );

        if (!isMounted) return;

        const validResults = results.filter(Boolean);
        setMarkerCount(validResults.length);

        if (validResults.length > 0) {
          validResults.forEach((loc) => {
            bounds.extend(loc.position);
            
            const marker = new Marker({
              position: loc.position,
              map: mapInstance,
              icon: {
                path: SymbolPath.CIRCLE,
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
        console.error('Map init failed:', err);
        if (isMounted) setError(err.message);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    };
  }, [locations]);

  return (
    <div className="mb-12 bg-slate-100 rounded-3xl overflow-hidden aspect-[16/10] min-h-[300px] relative border border-slate-200 shadow-sm">
      <div ref={mapRef} className="w-full h-full" />
      
      {error && (
        <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center z-20">
          <p className="text-xs font-bold text-slate-500 mb-2">地圖載入失敗</p>
          <p className="text-[10px] text-slate-400 font-mono max-w-xs break-all">{error}</p>
        </div>
      )}

      {!error && markerCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-slate-400 text-[10px] animate-pulse">
            正在初始化地圖與座標 ({locations.length} 個地點)...
          </div>
        </div>
      )}

      {activeLoc && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-50">
          <div className="pointer-events-auto w-full max-w-[240px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">地點詳情</span>
              <button onClick={() => setActiveLoc(null)} className="text-slate-300 hover:text-slate-600 p-1">✕</button>
            </div>
            <div className="mb-5">
              <div className="text-[10px] text-indigo-500 font-bold mb-1">{activeLoc.name}</div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">{activeLoc.title}</h4>
            </div>
            <div className="flex flex-col gap-2">
              <a href={`#${activeLoc.slug}`} onClick={() => setActiveLoc(null)} className="bg-slate-900 text-white py-3 rounded-xl text-xs font-bold text-center">跳轉到段落</a>
              <a href={activeLoc.url} target="_blank" rel="noopener noreferrer" className="bg-slate-100 text-slate-600 py-2.5 rounded-xl text-xs font-bold text-center">Google Maps ↗</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
