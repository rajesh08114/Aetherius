'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Stop } from '@/types';

interface TripMapProps {
  stops: Stop[];
}

export default function TripMap({ stops }: TripMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [0, 20],
      zoom: 1.5,
      attributionControl: false
    });

    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

    mapInstance.on('load', () => {
      setMap(mapInstance);
      
      // Add source for polyline
      mapInstance.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      // Add layer for polyline (dashed)
      mapInstance.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#f59e0b',
          'line-width': 3,
          'line-dasharray': [2, 2]
        }
      });
    });

    return () => mapInstance.remove();
  }, []);

  useEffect(() => {
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const coordinates: [number, number][] = [];
    const bounds = new maplibregl.LngLatBounds();

    stops.forEach((stop, index) => {
      if (stop.coordinates?.lng && stop.coordinates?.lat) {
        const coord: [number, number] = [stop.coordinates.lng, stop.coordinates.lat];
        coordinates.push(coord);
        bounds.extend(coord);

        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'w-8 h-8 bg-amber-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold text-white text-sm';
        el.innerText = (index + 1).toString();

        const popup = new maplibregl.Popup({ offset: 25, closeButton: false })
          .setHTML(`<div class="p-2 text-slate-900 font-syne font-bold">${stop.cityName}</div>`);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(coord)
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      }
    });

    // Update polyline
    const source = map.getSource('route') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      });
    }

    // Fit bounds if we have points
    if (coordinates.length > 0) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [map, stops]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-2xl overflow-hidden border border-slate-800" />;
}
