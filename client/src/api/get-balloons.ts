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
