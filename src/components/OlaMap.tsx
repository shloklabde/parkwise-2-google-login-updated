import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { ParkingLocation } from '@/data/mock';
import { OLA_MAPS_API_KEY } from '@/services/olaMapsService';
import { KeyRound, ShieldAlert } from 'lucide-react';

export interface OlaMapProps {
  locations?: ParkingLocation[];
  selectedLocation?: ParkingLocation | null;
  userLocation?: { lat: number; lng: number } | null;
  routeCoordinates?: [number, number][] | null;
  className?: string;
  height?: string | number;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  interactive?: boolean;
  onSelectLocation?: (location: ParkingLocation) => void;
  showUserMarker?: boolean;
  highlightLocationId?: string;
}

// Clean fallback style for when Ola Maps API key is not configured in .env
const FALLBACK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const OlaMap: React.FC<OlaMapProps> = ({
  locations = [],
  selectedLocation,
  userLocation,
  routeCoordinates,
  className = '',
  height = 360,
  center,
  zoom = 13,
  interactive = true,
  onSelectLocation,
  showUserMarker = true,
  highlightLocationId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hasKey, setHasKey] = useState<boolean>(() => Boolean(OLA_MAPS_API_KEY && OLA_MAPS_API_KEY.length > 5));
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const keyPresent = Boolean(OLA_MAPS_API_KEY && OLA_MAPS_API_KEY.length > 5);
    setHasKey(keyPresent);
  }, []);

  // Determine initial center
  const defaultCenter: [number, number] = center || (
    selectedLocation && typeof selectedLocation.longitude === 'number' && typeof selectedLocation.latitude === 'number'
      ? [selectedLocation.longitude, selectedLocation.latitude]
      : locations.length > 0 && typeof locations[0].longitude === 'number' && typeof locations[0].latitude === 'number'
      ? [locations[0].longitude, locations[0].latitude]
      : [73.0656, 19.0439] // Default Kharghar, Navi Mumbai
  );

  // Initialize MapLibre with Ola Maps vector style & transformRequest
  useEffect(() => {
    if (!containerRef.current) return;
    let isSubscribed = true;

    // Official Ola Maps vector tile style endpoint
    const officialStyleUrl =
      'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json';

    const useOlaStyle = Boolean(OLA_MAPS_API_KEY && OLA_MAPS_API_KEY.length > 5);

    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: useOlaStyle ? officialStyleUrl : FALLBACK_STYLE,
        center: defaultCenter,
        zoom: zoom,
        interactive: interactive,
        attributionControl: false,
        transformRequest: (url: string) => {
          try {
            const parsedUrl = new URL(url);
            if (parsedUrl.hostname.includes('olamaps.io')) {
              if (!parsedUrl.searchParams.has('api_key') && OLA_MAPS_API_KEY) {
                parsedUrl.searchParams.set('api_key', OLA_MAPS_API_KEY);
              }
            }
            return { url: parsedUrl.toString() };
          } catch {
            return { url };
          }
        },
      });

      if (!isSubscribed) {
        map.remove();
        return;
      }

      mapRef.current = map;

      if (interactive) {
        try {
          const nav = new maplibregl.NavigationControl({ showCompass: true });
          map.addControl(nav, 'top-right');
        } catch {
          // Controls optional
        }
      }

      map.on('load', () => {
        if (isSubscribed) {
          setMapLoaded(true);
          setAuthError(null);
        }
      });

      map.on('error', (event: any) => {
        const status = event?.error?.status || event?.status;
        if (status === 401 || status === 403) {
          console.warn('[OlaMaps] Map request returned authorization status:', status);
          if (isSubscribed) {
            setAuthError('Invalid API key or unauthorized domain in Krutrim/Ola Maps console.');
          }
        }
      });
    } catch (err: any) {
      console.warn('[OlaMaps] Initialization error:', err?.message || err);
      if (isSubscribed) {
        setAuthError('Could not initialize MapLibre GL instance.');
      }
    }

    return () => {
      isSubscribed = false;
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {
          // cleanup
        }
        mapRef.current = null;
      }
    };
  }, []);

  // Update center when selectedLocation or center changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    if (selectedLocation && typeof selectedLocation.longitude === 'number' && typeof selectedLocation.latitude === 'number') {
      mapRef.current.flyTo({
        center: [selectedLocation.longitude, selectedLocation.latitude],
        zoom: 14,
        essential: true,
      });
    } else if (center) {
      mapRef.current.flyTo({
        center: center,
        zoom: zoom,
        essential: true,
      });
    }
  }, [selectedLocation?.id, selectedLocation?.longitude, selectedLocation?.latitude, center, zoom, mapLoaded]);

  // Render Parking Location Markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      try {
        marker.remove();
      } catch {
        // ignore
      }
    });
    markersRef.current = [];

    locations.forEach((loc) => {
      const lng = loc.longitude ?? (loc.id === 'metropark_001' ? 73.0656 : 77.6020);
      const lat = loc.latitude ?? (loc.id === 'metropark_001' ? 19.0439 : 12.9719);

      const isSelected = selectedLocation?.id === loc.id || highlightLocationId === loc.id;
      const isMetroPark = loc.id === 'metropark_001';

      // Create Custom DOM Element for Marker
      const el = document.createElement('div');
      el.className = 'group cursor-pointer transform transition-all duration-200 hover:scale-110';
      el.style.zIndex = isSelected ? '40' : isMetroPark ? '35' : '20';

      const available = loc.availableSlots ?? 0;
      const badgeBg = available > 5 ? '#26744d' : available > 0 ? '#dfa236' : '#c84444';
      const pinColor = isSelected ? '#e5ad4c' : isMetroPark ? '#173f5d' : '#22556d';

      el.innerHTML = `
        <div class="relative flex flex-col items-center">
          <!-- Availability Tag -->
          <div class="mb-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-md transition-all group-hover:shadow-lg" style="background-color: ${badgeBg};">
            ${available} ${available === 1 ? 'spot' : 'spots'}
          </div>
          <!-- Pin Icon -->
          <div class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform ${
            isSelected ? 'ring-4 ring-[#e5ad4c]/40 scale-110' : ''
          }" style="background-color: ${pinColor}; color: white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5-2.5 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <!-- Location Name Label -->
          <div class="pointer-events-none mt-1 whitespace-nowrap rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#183653] shadow-sm backdrop-blur-xs ${
            isSelected ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
          }">
            ${loc.name}
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectLocation?.(loc);
      });

      try {
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(mapRef.current!);
        markersRef.current.push(marker);
      } catch (markerErr) {
        console.warn('Marker render error:', markerErr);
      }
    });
  }, [locations, selectedLocation?.id, highlightLocationId, mapLoaded]);

  // Render User Location Marker
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    if (userMarkerRef.current) {
      try {
        userMarkerRef.current.remove();
      } catch {
        // ignore
      }
      userMarkerRef.current = null;
    }

    if (showUserMarker && userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center';
      el.innerHTML = `
        <div class="h-6 w-6 rounded-full bg-sky-500/30 animate-ping absolute"></div>
        <div class="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#0284c7] shadow-lg">
          <div class="h-2 w-2 rounded-full bg-white"></div>
        </div>
        <div class="absolute -bottom-5 whitespace-nowrap rounded bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-xs">
          Your location
        </div>
      `;

      try {
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(mapRef.current);
        userMarkerRef.current = marker;
      } catch (err) {
        console.warn('User marker render error:', err);
      }
    }
  }, [userLocation, showUserMarker, mapLoaded]);

  // Render Route Polyline
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;
    const sourceId = 'ola-directions-route';
    const layerId = 'ola-directions-line';
    const casingLayerId = 'ola-directions-line-casing';

    // Remove existing layer & source if any
    try {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getLayer(casingLayerId)) map.removeLayer(casingLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    } catch {
      // ignore
    }

    if (routeCoordinates && routeCoordinates.length >= 2) {
      try {
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates,
            },
          },
        });

        // Outer outline casing for contrast
        map.addLayer({
          id: casingLayerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#11293a',
            'line-width': 7,
            'line-opacity': 0.8,
          },
        });

        // Vibrant route line
        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#f59e0b',
            'line-width': 4.5,
            'line-opacity': 0.95,
          },
        });

        // Fit bounds around the entire route with padding
        const bounds = new maplibregl.LngLatBounds();
        routeCoordinates.forEach((coord) => bounds.extend(coord));
        map.fitBounds(bounds, {
          padding: { top: 60, bottom: 60, left: 60, right: 60 },
          maxZoom: 15,
          duration: 1200,
        });
      } catch (routeErr) {
        console.warn('Error drawing route on map:', routeErr);
      }
    }
  }, [routeCoordinates, mapLoaded]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div ref={containerRef} className="h-full w-full" />

      {/* Notice when Key is Missing from .env */}
      {!hasKey && (
        <div className="pointer-events-none absolute top-3 left-3 right-3 z-30 flex items-center justify-between rounded-xl border border-[#e5ad4c]/40 bg-[#fffbeb]/95 p-2.5 text-xs font-semibold text-[#854d0e] shadow-md backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="shrink-0 text-[#d97706]" />
            <span>Using base street map. Add <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-[#b45309]">VITE_OLA_MAPS_API_KEY</code> to <code className="rounded bg-black/5 px-1 py-0.5 font-mono">.env</code> to activate Ola Vector Tiles.</span>
          </div>
        </div>
      )}

      {/* Notice for 401/403 or domain restriction */}
      {authError && hasKey && (
        <div className="pointer-events-none absolute top-3 left-3 right-3 z-30 flex items-center gap-2 rounded-xl border border-[#c84444]/40 bg-[#fff5f5]/95 p-2.5 text-xs font-semibold text-[#a82d2d] shadow-md backdrop-blur-xs">
          <ShieldAlert size={16} className="shrink-0 text-[#c84444]" />
          <span>{authError} Check allowed origins in Krutrim Cloud settings.</span>
        </div>
      )}

      {/* Live Status Badge */}
      <div className="pointer-events-none absolute bottom-2 left-2 z-10 flex items-center gap-1.5 rounded-md border border-white/40 bg-white/85 px-2 py-0.5 text-[10px] font-bold text-[#1f4058] shadow-xs backdrop-blur-xs">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            mapLoaded
              ? hasKey
                ? 'bg-[#10b981]'
                : 'bg-[#3b82f6]'
              : 'bg-[#eab308] animate-pulse'
          }`}
        />
        <span>
          {mapLoaded
            ? hasKey
              ? 'Ola Maps Live'
              : 'Interactive Map'
            : 'Loading Map…'}
        </span>
      </div>
    </div>
  );
};
