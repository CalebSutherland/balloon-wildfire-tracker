import type { BalloonPoint } from "../types/types";
import { clampLat, pad } from "../utils/utils";

export interface InterpolationParams {
  fractionalHour: number; // current time as a fractional hour (0–24)
  balloons: Record<string, BalloonPoint[]>; // balloon data for each hour
  selectedBalloonIndex?: number | null; // optional index for tracking a specific balloon
  trackingMode?: boolean; // optional flag for camera tracking
}

// Interpolates longitude accounting for wraparound at ±180°
function interpolateLongitude(lon1: number, lon2: number, t: number): number {
  let dLon = lon2 - lon1;
  if (dLon > 180) dLon -= 360;
  if (dLon < -180) dLon += 360;
  return lon1 + dLon * t;
}

// Interpolate a single balloon's position between two hourly points
function interpolateBalloon(
  b1: BalloonPoint,
  b2: BalloonPoint,
  t: number
): GeoJSON.Feature<GeoJSON.Point> {
  const lat = clampLat(b1.lat + (b2.lat - b1.lat) * t);
  const alt = b1.alt + (b2.alt - b1.alt) * t;
  const lon = interpolateLongitude(b1.lon, b2.lon, t);

  return {
    type: "Feature",
    id: b1.index,
    geometry: { type: "Point", coordinates: [lon, lat, alt] },
    properties: { index: b1.index, lat, lon, alt },
  };
}

// Create interpolated GeoJSON features for all balloons at a fractional hour
export function createInterpolatedFeatures({
  fractionalHour,
  balloons,
}: InterpolationParams): GeoJSON.Feature<GeoJSON.Point>[] {
  const h1 = Math.floor(fractionalHour) % 24;
  const h2 = (h1 + 1) % 24;
  const t = fractionalHour - h1;
  const a = balloons[pad(h1)];
  const b = balloons[pad(h2)];

  if (!a || !b) return [];

  return a.map((b1, i) => {
    const b2 = b[i] || b1;
    return interpolateBalloon(b1, b2, t);
  });
}

// Compute the camera position for a specific balloon at a fractional hour
export function getCameraPosition(
  fractionalHour: number,
  balloons: Record<string, BalloonPoint[]>,
  balloonIndex: number
): { lat: number; lon: number } | null {
  const h1 = Math.floor(fractionalHour) % 24;
  const h2 = (h1 + 1) % 24;
  const t = fractionalHour - h1;
  const a = balloons[pad(h1)];
  const b = balloons[pad(h2)];

  if (!a || !b || !a[balloonIndex]) return null;

  const b1 = a[balloonIndex];
  const b2 = b[balloonIndex] || b1;

  const lat = clampLat(b1.lat + (b2.lat - b1.lat) * t);
  const lon = interpolateLongitude(b1.lon, b2.lon, t);

  return { lat, lon };
}
