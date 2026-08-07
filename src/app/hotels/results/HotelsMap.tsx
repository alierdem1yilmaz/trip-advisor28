"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type MapHotel = {
  hotelId: string;
  name: string;
  price?: { total: string; currency: string };
  lat: number;
  lon: number;
  detailHref: string;
};

function priceIcon(label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      padding: 3px 8px; border-radius: 9999px; white-space: nowrap;
      background: #1c1917; color: white; font: 600 12px system-ui, sans-serif;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35); border: 2px solid white;
      transform: translate(-50%, -100%);
    ">${label}</div>`,
    iconSize: [0, 0],
  });
}

function FitToHotels({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [32, 32] });
    }
  }, [map, points]);
  return null;
}

export function HotelsMap({
  hotels,
  center,
}: {
  hotels: MapHotel[];
  center: [number, number];
}) {
  const points: [number, number][] = hotels.map((h) => [h.lat, h.lon]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hotels.map((hotel) => (
        <Marker
          key={hotel.hotelId}
          position={[hotel.lat, hotel.lon]}
          icon={priceIcon(
            hotel.price
              ? `${hotel.price.total} ${hotel.price.currency}`
              : hotel.name,
          )}
        >
          <Popup>
            <Link href={hotel.detailHref} className="font-medium text-accent">
              {hotel.name}
            </Link>
            {hotel.price && (
              <p className="mt-0.5 text-sm">
                {hotel.price.total} {hotel.price.currency}
              </p>
            )}
          </Popup>
        </Marker>
      ))}
      <FitToHotels points={points} />
    </MapContainer>
  );
}
