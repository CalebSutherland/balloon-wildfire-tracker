import { useEffect, useState } from "react";
import type { BalloonPoint } from "../types/types";
import { haversine } from "../utils/utils";

export function useBalloons() {
  const [balloons, setBalloons] = useState<Record<string, BalloonPoint[]>>({});
  const [distances, setDistances] = useState<Record<number, number>>({});
  const [maxBalloon, setMaxBalloon] = useState<number | null>(null);
  const [maxDist, setMaxDist] = useState<number>(0);

  useEffect(() => {
    fetch("http://localhost:5000/api/treasure")
      .then((res) => res.json())
      .then((data: Record<string, number[][]>) => {
        const objData: Record<string, BalloonPoint[]> = {};
        for (const h in data) {
          objData[h] = data[h].map(([lat, lon, alt], i) => ({
            lat,
            lon,
            alt,
            index: i,
          }));
        }
        setBalloons(objData);

        // compute distances
        const hours = Object.keys(objData).sort();
        if (hours.length === 0) return;

        const numBalloons = objData[hours[0]].length;
        const distMap: Record<number, number> = {};

        for (let i = 0; i < numBalloons; i++) {
          let total = 0;
          for (let h = 1; h < hours.length; h++) {
            const prev = objData[hours[h - 1]][i];
            const curr = objData[hours[h]][i];
            if (prev && curr) {
              total += haversine(prev.lat, prev.lon, curr.lat, curr.lon);
            }
          }
          distMap[i] = total;
        }

        // find max
        let maxIndex: number | null = null;
        let maxValue = -Infinity;
        for (const [i, d] of Object.entries(distMap)) {
          if (d > maxValue) {
            maxValue = d;
            maxIndex = Number(i);
          }
        }

        setDistances(distMap);
        setMaxBalloon(maxIndex);
        setMaxDist(maxValue);
      })
      .catch(console.error);
  }, []);

  return {
    balloons,
    distances,
    maxBalloon,
    maxDist,
  };
}
