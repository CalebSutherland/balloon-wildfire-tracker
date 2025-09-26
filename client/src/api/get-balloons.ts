import { useEffect, useState } from "react";
import type { BalloonPoint } from "../types/types";
import { calculateBalloonStats } from "@/utils/balloon-stats";

export function getBalloons() {
  const [balloons, setBalloons] = useState<Record<string, BalloonPoint[]>>({});
  const [distances, setDistances] = useState<Record<number, number>>({});
  const [maxDistBalloon, setMaxDistBalloon] = useState<number | null>(null);
  const [maxDist, setMaxDist] = useState(0);
  const [maxAltitudes, setMaxAltitudes] = useState<Record<number, number>>({});
  const [maxAltBalloon, setMaxAltBalloon] = useState<number | null>(null);
  const [maxAlt, setMaxAlt] = useState(0);
  const [balloonError, setBalloonError] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/treasure")
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

        const {
          distMap,
          maxDistIndex,
          maxDistValue,
          maxAltMap,
          maxAltIndex,
          maxAltValue,
        } = calculateBalloonStats(objData);

        setDistances(distMap);
        setMaxDistBalloon(maxDistIndex);
        setMaxDist(maxDistValue);
        setMaxAltitudes(maxAltMap);
        setMaxAltBalloon(maxAltIndex);
        setMaxAlt(maxAltValue);
      })
      .catch(console.error);
  }, []);

  return {
    balloons,
    distances,
    maxDistBalloon,
    maxDist,
    maxAltitudes,
    maxAltBalloon,
    maxAlt,
    balloonError,
  };
}
