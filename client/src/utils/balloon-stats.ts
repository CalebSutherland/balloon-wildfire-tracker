import type { BalloonPoint } from "@/types/types";
import { clampLat, haversine } from "./utils";

export function calculateBalloonStats(objData: Record<string, BalloonPoint[]>) {
  const hours = Object.keys(objData).sort();
  if (hours.length === 0)
    return {
      distMap: {},
      maxDistIndex: null,
      maxDistValue: 0,
      maxAltMap: {},
      maxAltIndex: null,
      maxAltValue: 0,
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

  // find max distance
  let maxDistIndex: number | null = null;
  let maxDistValue = -Infinity;
  for (const [i, d] of Object.entries(distMap)) {
    if (d > maxDistValue) {
      maxDistValue = d;
      maxDistIndex = Number(i);
    }
  }

  // find max altitude
  let maxAltIndex: number | null = null;
  let maxAltValue = -Infinity;
  for (const [i, alt] of Object.entries(maxAltMap)) {
    if (alt > maxAltValue) {
      maxAltValue = alt;
      maxAltIndex = Number(i);
    }
  }

  return {
    distMap,
    maxDistIndex,
    maxDistValue,
    maxAltMap,
    maxAltIndex,
    maxAltValue,
  };
}
