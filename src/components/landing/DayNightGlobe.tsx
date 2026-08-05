"use client";

import { useEffect, useRef } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Geometry } from "geojson";
import landTopology from "world-atlas/land-110m.json";

const WIDTH = 720;
const HEIGHT = 360;

// A hand-picked set of major world cities so the night side has plausible
// "city lights" glowing on it — decorative, not an exhaustive gazetteer.
// [name, latitude, longitude, relative brightness]
const CITIES: [string, number, number, number][] = [
  ["New York", 40.71, -74.01, 1.3],
  ["Los Angeles", 34.05, -118.24, 1.1],
  ["Chicago", 41.88, -87.63, 1.0],
  ["Mexico City", 19.43, -99.13, 1.2],
  ["São Paulo", -23.55, -46.63, 1.2],
  ["Rio de Janeiro", -22.91, -43.17, 1.0],
  ["Buenos Aires", -34.6, -58.38, 1.0],
  ["London", 51.51, -0.13, 1.3],
  ["Paris", 48.85, 2.35, 1.2],
  ["Madrid", 40.42, -3.7, 1.0],
  ["Rome", 41.9, 12.5, 1.0],
  ["Cairo", 30.04, 31.24, 1.1],
  ["Lagos", 6.52, 3.38, 1.1],
  ["Nairobi", -1.29, 36.82, 0.9],
  ["Johannesburg", -26.2, 28.05, 1.0],
  ["Istanbul", 41.01, 28.98, 1.2],
  ["Moscow", 55.76, 37.62, 1.2],
  ["Dubai", 25.2, 55.27, 1.1],
  ["Mumbai", 19.08, 72.88, 1.2],
  ["Delhi", 28.61, 77.21, 1.2],
  ["Bangkok", 13.75, 100.5, 1.0],
  ["Singapore", 1.35, 103.82, 1.1],
  ["Beijing", 39.9, 116.4, 1.2],
  ["Shanghai", 31.23, 121.47, 1.2],
  ["Tokyo", 35.68, 139.65, 1.3],
  ["Seoul", 37.57, 126.98, 1.1],
  ["Jakarta", -6.21, 106.85, 1.0],
  ["Sydney", -33.87, 151.21, 1.1],
  ["Auckland", -36.85, 174.76, 0.9],
  ["Toronto", 43.65, -79.38, 1.0],
  ["Vancouver", 49.28, -123.12, 0.9],
];

function solarDeclinationDeg(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = (date.getTime() - start) / 86_400_000;
  return 23.44 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
}

function subsolarLongitudeDeg(date: Date): number {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const lon = (12 - utcHours) * 15;
  return ((((lon + 180) % 360) + 360) % 360) - 180;
}

/** Sun altitude in degrees at a given lat/lon — positive is daylight. */
function solarAltitudeDeg(lat: number, lon: number, decDeg: number, subLon: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const latR = toRad(lat);
  const decR = toRad(decDeg);
  const hourAngleDeg = ((((lon - subLon + 180) % 360) + 360) % 360) - 180;
  const haR = toRad(hourAngleDeg);
  const sinAlt = Math.sin(latR) * Math.sin(decR) + Math.cos(latR) * Math.cos(decR) * Math.cos(haR);
  return (Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180) / Math.PI;
}

/** How "deep" into night a point is, 0 (full day) to 1 (full night), with a soft twilight band. */
function nightAmount(altitudeDeg: number): number {
  const TWILIGHT = 8; // degrees of soft fade around the terminator
  if (altitudeDeg >= TWILIGHT) return 0;
  if (altitudeDeg <= -TWILIGHT) return 1;
  return 1 - (altitudeDeg + TWILIGHT) / (2 * TWILIGHT);
}

export function DayNightGlobe() {
  const shadeCanvasRef = useRef<HTMLCanvasElement>(null);
  const lightsCanvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const shadeCanvas = shadeCanvasRef.current;
    const lightsCanvas = lightsCanvasRef.current;
    if (!shadeCanvas || !lightsCanvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    [shadeCanvas, lightsCanvas].forEach((c) => {
      c.width = WIDTH * dpr;
      c.height = HEIGHT * dpr;
    });
    const shadeCtx = shadeCanvas.getContext("2d");
    const lightsCtx = lightsCanvas.getContext("2d");
    if (!shadeCtx || !lightsCtx) return;
    shadeCtx.scale(dpr, dpr);
    lightsCtx.scale(dpr, dpr);

    const projection = geoEquirectangular().fitSize([WIDTH, HEIGHT], { type: "Sphere" });

    function drawShade(now: Date) {
      if (!shadeCtx) return;
      const dec = solarDeclinationDeg(now);
      const subLon = subsolarLongitudeDeg(now);
      // Softness comes purely from nightAmount()'s gradient across the
      // twilight band, sampled at a fine-ish cell size — NOT from a canvas
      // blur filter, which (applied per fillRect across ~20k cells) was
      // catastrophically slow and could stall the page for seconds.
      const cellW = 4;
      const cellH = 4;
      shadeCtx.clearRect(0, 0, WIDTH, HEIGHT);
      for (let y = 0; y < HEIGHT; y += cellH) {
        for (let x = 0; x < WIDTH; x += cellW) {
          const coords = projection.invert?.([x + cellW / 2, y + cellH / 2]);
          if (!coords) continue;
          const [lon, lat] = coords;
          if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
          const alt = solarAltitudeDeg(lat, lon, dec, subLon);
          const n = nightAmount(alt);
          if (n <= 0.02) continue;
          shadeCtx.fillStyle = `rgba(15, 12, 26, ${n * 0.72})`;
          shadeCtx.fillRect(x, y, cellW, cellH);
        }
      }
    }

    function drawLights(now: Date, twinkle: number[]) {
      if (!lightsCtx) return;
      const dec = solarDeclinationDeg(now);
      const subLon = subsolarLongitudeDeg(now);
      lightsCtx.clearRect(0, 0, WIDTH, HEIGHT);
      CITIES.forEach(([, lat, lon, size], i) => {
        const alt = solarAltitudeDeg(lat, lon, dec, subLon);
        const n = nightAmount(alt);
        if (n <= 0.05) return;
        const projected = projection([lon, lat]);
        if (!projected) return;
        const [x, y] = projected;
        const jitter = twinkle[i] ?? 1;
        const alpha = n * 0.85 * jitter;
        const radius = size * 3.2;
        const gradient = lightsCtx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(255, 214, 140, ${alpha})`);
        gradient.addColorStop(1, "rgba(255, 214, 140, 0)");
        lightsCtx.fillStyle = gradient;
        lightsCtx.beginPath();
        lightsCtx.arc(x, y, radius, 0, Math.PI * 2);
        lightsCtx.fill();
      });
    }

    let twinkle = CITIES.map(() => 1);

    function fullRedraw() {
      const now = new Date();
      drawShade(now);
      drawLights(now, twinkle);
    }

    fullRedraw();
    // The terminator itself only meaningfully moves minute-to-minute, so a
    // full recompute on that cadence is enough to stay astronomically live.
    const minuteTimer = setInterval(fullRedraw, 60_000);
    // A faster, lights-only twinkle keeps the map feeling alive between
    // those recomputes without implying the terminator itself is jittering.
    const twinkleTimer = setInterval(() => {
      twinkle = twinkle.map((v) => {
        const next = v + (Math.random() - 0.5) * 0.35;
        return Math.max(0.55, Math.min(1, next));
      });
      drawLights(new Date(), twinkle);
    }, 2200);

    return () => {
      clearInterval(minuteTimer);
      clearInterval(twinkleTimer);
    };
  }, []);

  const projection = geoEquirectangular().fitSize([WIDTH, HEIGHT], { type: "Sphere" });
  const path = geoPath(projection);
  const landGeo = feature(
    landTopology as unknown as Topology,
    landTopology.objects.land as unknown as GeometryCollection<Geometry>,
  );
  const landPath = path(landGeo) ?? "";
  const graticuleOutline = path({ type: "Sphere" }) ?? "";

  return (
    <div className="relative w-full overflow-hidden rounded-[28px] border border-night-line bg-night shadow-[0_30px_60px_-25px_rgba(27,23,18,0.5)]">
      <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-night-soft/80 px-2.5 py-1 text-[11px] font-medium text-paper/80 backdrop-blur">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
        </span>
        Live
      </div>
      <div className="relative aspect-[2/1] w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="absolute inset-0 h-full w-full"
        >
          <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#274b52" />
          <path d={landPath} fill="#d8c9a8" stroke="#c3b190" strokeWidth={0.4} />
          <path d={graticuleOutline} fill="none" stroke="#1b3438" strokeWidth={1} />
        </svg>
        <canvas
          ref={shadeCanvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="absolute inset-0 h-full w-full mix-blend-multiply"
        />
        <canvas
          ref={lightsCanvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="absolute inset-0 h-full w-full mix-blend-screen"
        />
      </div>
    </div>
  );
}
