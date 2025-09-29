// Custom React hook to fetch and process balloon data from the backend
// - Fetches from GET /api/treasure
// - Converts the raw number[][] into BalloonPoint objects with lat, lon, alt, and index
// - Calculates balloon statistics: distances and max altitudes
// - Manages loading and error state
//
// Returns an object with:
// - balloons: Record<string, BalloonPoint[]> — keyed by hour, array of balloons
// - distances: Record<number, number> — distance metrics for each balloon index
// - maxAltitudes: Record<number, number> — max altitude for each balloon index
// - balloonError: boolean — true if fetch or processing failed
// - loadingBalloons: boolean — true while fetching data

import { useEffect, useState } from "react";
import type { BalloonPoint } from "../types/types";
import { calculateBalloonStats } from "@/utils/balloon-stats";

export function getBalloons() {
  const [balloons, setBalloons] = useState<Record<string, BalloonPoint[]>>({});
  const [distances, setDistances] = useState<Record<number, number>>({});
  const [maxAltitudes, setMaxAltitudes] = useState<Record<number, number>>({});
  const [loadingBalloons, setLoadingBalloons] = useState(true);
  const [balloonError, setBalloonError] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/api/treasure`)
      .then((res) => res.json())
      .then((data: Record<string, number[][]>) => {
        const objData: Record<string, BalloonPoint[]> = {};
        for (const h in data) {
          if (!data[h] || data[h].length === 0) {
            setBalloonError(true);
            objData[h] = [];
          } else {
            objData[h] = data[h].map(([lat, lon, alt], i) => ({
              lat,
              lon,
              alt,
              index: i,
            }));
          }
        }
        setBalloons(objData);
        setLoadingBalloons(false);

        const { distMap, maxAltMap } = calculateBalloonStats(objData);

        setDistances(distMap);
        setMaxAltitudes(maxAltMap);
      })
      .catch(() => {
        console.error;
        setBalloonError(true);
      });
  }, []);

  return {
    balloons,
    distances,
    maxAltitudes,
    balloonError,
    loadingBalloons,
  };
}
