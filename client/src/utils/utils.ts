export const clampLat = (lat: number) => Math.max(Math.min(lat, 85), -85);

export const pad = (n: number) => String(n).padStart(2, "0");
