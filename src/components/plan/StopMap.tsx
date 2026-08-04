"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapStop = {
  title: string;
  lat?: number;
  lon?: number;
};

function numberedIcon(n: number) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 9999px;
      background: linear-gradient(to bottom right, #14b8a6, #4f46e5);
      color: white; font: 700 13px system-ui, sans-serif;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35); border: 2px solid white;
    ">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function FitToStops({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [32, 32] });
    }
  }, [map, points]);
  return null;
}

export function StopMap({
  stops,
  center,
}: {
  stops: MapStop[];
  center: { lat: number; lon: number };
}) {
  const points: [number, number][] = stops
    .filter((s): s is MapStop & { lat: number; lon: number } => s.lat != null && s.lon != null)
    .map((s) => [s.lat, s.lon]);

  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stops.map((stop, i) =>
        stop.lat != null && stop.lon != null ? (
          <Marker
            key={`${stop.title}-${i}`}
            position={[stop.lat, stop.lon]}
            icon={numberedIcon(i + 1)}
          />
        ) : null,
      )}
      <FitToStops points={points} />
    </MapContainer>
  );
}
