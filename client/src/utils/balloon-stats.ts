import type { BalloonPoint } from "@/types/types";
import { clampLat, haversine } from "./utils";

// Calculates total travel distance and maximum altitude for each balloon
// objData[hour][i] = balloon data for ith balloon at given hour
export function calculateBalloonStats(objData: Record<string, BalloonPoint[]>) {
  const hours = Object.keys(objData).sort();
  if (hours.length === 0)
    return {
      distMap: {},
      maxAltMap: {},
    };

  const numBalloons = objData[hours[0]].length;
  const distMap: Record<number, number> = {};
  const maxAltMap: Record<number, number> = {};

  for (let i = 0; i < numBalloons; i++) {
    let totalDist = 0;
    let maxAlt = -Infinity;

    for (let h = 0; h < hours.length; h++) {
      const curr = objData[hours[h]][i];
      if (!curr) continue;

      // update max altitude
      if (curr.alt > maxAlt) maxAlt = curr.alt;

      // update total distance
      if (h > 0) {
        const prev = objData[hours[h - 1]][i];
        if (prev) {
          const prevLat = clampLat(prev.lat);
          const currLat = clampLat(curr.lat);
          totalDist += haversine(prevLat, prev.lon, currLat, curr.lon);
        }
      }
    }

    distMap[i] = totalDist;
    maxAltMap[i] = maxAlt;
  }

  return {
    distMap,
    maxAltMap,
  };
}
