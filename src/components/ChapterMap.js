'use client';
import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

export default function ChapterMap({ locations }) {
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [activeLoc, setActiveLoc] = useState(null);
  const [markerCount, setMarkerCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const markersRef = useRef([]);

  // 1. Intersection Observer for Lazy Loading
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Map Initialization
  useEffect(() => {
    if (!isVisible || !mapRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    // Enhanced Debug logging (Safe: only show first/last 4 chars)
    const maskedKey = apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'null';
    console.log('[ChapterMap] API Key Check:', {
      present: !!apiKey,
      length: apiKey?.length || 0,
      masked: maskedKey,
      envName: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'
    });

    if (!apiKey || apiKey === 'undefined' || apiKey.length < 10) {
      setError('Missing or invalid NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. 請檢查 .env.local 或 Vercel 設定。');
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      try {
        console.log('[ChapterMap] initMap started...');
        setOptions({
          apiKey: apiKey,
          version: 'weekly',
          language: 'zh-TW',
        });

        // Load libraries separately to ensure they are captured correctly
        console.log('[ChapterMap] Loading libraries...');
        const mapsLib = await importLibrary('maps');
        const geocodingLib = await importLibrary('geocoding');
        
        console.log('[ChapterMap] Libraries loaded objects:', { mapsLib: !!mapsLib, geocodingLib: !!geocodingLib });

        if (!isMounted || !mapRef.current) return;

        // Use the classes directly from the returned library objects
        const MapClass = mapsLib.Map;
        const LatLngBoundsClass = mapsLib.LatLngBounds;
        const GeocoderClass = geocodingLib.Geocoder;
        
        // Marker and SymbolPath are usually in the maps library
        // Important: In newer JS SDK, Marker is often accessed via mapsLib.Marker
        // but we need to check if it's actually there.
        const MarkerClass = mapsLib.Marker;
        const SymbolPathEnum = mapsLib.SymbolPath;

        console.log('[ChapterMap] Constructor check:', {
          Map: typeof MapClass,
          Bounds: typeof LatLngBoundsClass,
          Geocoder: typeof GeocoderClass,
          Marker: typeof MarkerClass
        });

        if (!MapClass || !GeocoderClass || !MarkerClass) {
          throw new Error(`缺少必要的建構子 (Map:${!!MapClass}, Geocoder:${!!GeocoderClass}, Marker:${!!MarkerClass})`);
        }

        const mapInstance = new MapClass(mapRef.current, {
          center: { lat: 37.05, lng: 138.85 },
          zoom: 11,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        const geocoder = new GeocoderClass();
        const bounds = new LatLngBoundsClass();

        // Geocode addresses
        console.log('[ChapterMap] Geocoding', locations.length, 'locations...');
        const results = await Promise.all(
          locations.map(loc => {
            return new Promise((resolve) => {
              geocoder.geocode({ address: loc.name }, (res, status) => {
                if (status === 'OK' && res?.[0]) {
                  console.log(`[ChapterMap] Geocoded ${loc.name} ->`, res[0].geometry.location.toString());
                  resolve({ ...loc, position: res[0].geometry.location });
                } else {
                  console.warn(`[ChapterMap] Geocoding failed for ${loc.name}: ${status}`);
                  resolve(null);
                }
              });
            });
          })
        );

        if (!isMounted) return;

        const validResults = results.filter(Boolean);
        console.log('[ChapterMap] Valid locations found:', validResults.length);
        
        // This state update triggers the UI change from "Initializing..."
        setMarkerCount(validResults.length);

        if (validResults.length > 0) {
          validResults.forEach((loc) => {
            bounds.extend(loc.position);
            
            const marker = new MarkerClass({
              position: loc.position,
              map: mapInstance,
              icon: {
                path: SymbolPathEnum.CIRCLE,
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
          console.log('[ChapterMap] Map initialization complete with markers.');
        } else {
          // If no locations were geocoded, show an error instead of infinite loading
          setError('無法取得任何地點的地理座標，請檢查 Geocoding API 是否啟用。');
        }
      } catch (err) {
        console.error('[ChapterMap] Map init error:', err);
        if (isMounted) setError(err.message);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      markersRef.current.forEach(m => {
        if (m && typeof m.setMap === 'function') m.setMap(null);
      });
      markersRef.current = [];
    };
  }, [locations, isVisible]);

  return (
    <div 
      ref={containerRef}
      className="mb-12 bg-slate-100 rounded-3xl overflow-hidden aspect-[16/10] min-h-[300px] relative border border-slate-200 shadow-sm"
    >
      {!isVisible ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-slate-400 text-[10px]">捲動至此以載入地圖...</div>
        </div>
      ) : (
        <>
          <div ref={mapRef} className="w-full h-full" />
          
          {error && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-20">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 text-xl">⚠️</div>
              <p className="text-sm font-bold text-slate-900 mb-2">地圖初始化失敗</p>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-6">
                {error.includes('ApiProjectMapError') 
                  ? 'Google Maps API Key 權限不足或未啟用帳單。請檢查 Google Cloud Console 設定。' 
                  : error}
              </p>
              <div className="flex flex-col gap-2 w-full max-w-[200px]">
                <a 
                  href="https://console.cloud.google.com/google/maps-apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-900 text-white py-2.5 rounded-xl text-[10px] font-bold"
                >
                  檢查 API Key 權限
                </a>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-slate-400 text-[10px] py-2 hover:text-slate-600"
                >
                  重新整理頁面
                </button>
              </div>
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
        </>
      )}
    </div>
  );
}
