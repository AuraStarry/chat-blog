'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export default function ChapterMap({ locations }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [activeLoc, setActiveLoc] = useState(null);
  const [geocodedLocations, setGeocodedLocations] = useState([]);
  const markersRef = useRef([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(async (google) => {
      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: 37.05, lng: 138.85 }, // Default center (Uonuma area)
        zoom: 11,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#616161" }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#e9e9e9" }]
          }
        ]
      });

      setMap(newMap);

      const geocoder = new google.maps.Geocoder();
      const bounds = new google.maps.LatLngBounds();

      const results = await Promise.all(
        locations.map(async (loc) => {
          return new Promise((resolve) => {
            geocoder.geocode({ address: loc.name }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const position = results[0].geometry.location;
                bounds.extend(position);
                resolve({ ...loc, position });
              } else {
                resolve(null);
              }
            });
          });
        })
      );

      const validResults = results.filter(Boolean);
      setGeocodedLocations(validResults);

      if (validResults.length > 0) {
        newMap.fitBounds(bounds, 50);
        
        // Add markers
        validResults.forEach((loc, idx) => {
          const marker = new google.maps.Marker({
            position: loc.position,
            map: newMap,
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
            newMap.panTo(loc.position);
          });

          markersRef.current.push(marker);
        });
      }
    });

    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    };
  }, [locations]);

  return (
    <section className="mb-12">
      <div className="bg-slate-100 rounded-3xl overflow-hidden aspect-[16/10] relative border border-slate-200 shadow-sm">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* React-based Info Card that "floats" or stays on top when a marker is active */}
        {activeLoc && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className="pointer-events-auto w-full max-w-[240px] bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-slate-100 p-4 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-start mb-2">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">地點資訊</div>
                <button 
                  onClick={() => setActiveLoc(null)}
                  className="text-slate-300 hover:text-slate-500 p-1"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <div className="text-[10px] text-indigo-500 font-bold mb-0.5">{activeLoc.name}</div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">{activeLoc.title}</h4>
              </div>
              
              <div className="flex flex-col gap-2">
                <a 
                  href={`#${activeLoc.slug}`}
                  onClick={() => setActiveLoc(null)}
                  className="flex items-center justify-center bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold transition-colors hover:bg-slate-800"
                >
                  跳轉段落
                </a>
                <a 
                  href={activeLoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-slate-100 text-slate-600 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-slate-200"
                >
                  Google Maps ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Legend / Tip */}
        {!activeLoc && (
          <div className="absolute bottom-6 left-6 flex items-center pointer-events-none animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold text-slate-400 shadow-sm">
              ✨ 地圖已同步，點擊插針查看內容
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
