export const clampLat = (lat: number) => Math.max(Math.min(lat, 85), -85);

export const pad = (n: number) => String(n).padStart(2, "0");

export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);
  const dLat = toRad(lat2 - lat1);
  let dLon = toRad(lon2 - lon1);
  if (dLon > Math.PI) dLon -= 2 * Math.PI;
  if (dLon < -Math.PI) dLon += 2 * Math.PI;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function normailzeLineCoords(
  coords: [number, number][]
): [number, number][] {
  if (coords.length < 2) return coords;

  const adjusted: [number, number][] = [coords[0]];

  for (let i = 1; i < coords.length; i++) {
    let [prevLon, _] = adjusted[i - 1];
    let [lon, lat] = coords[i];

    let delta = lon - prevLon;

    if (delta > 180) {
      lon -= 360;
    } else if (delta < -180) {
      lon += 360;
    }

    if (lat > 85) {
      lat = 85;
    } else if (lat < -85) {
      lat = -85;
    }

    adjusted.push([lon, lat]);
  }

  return adjusted;
}
