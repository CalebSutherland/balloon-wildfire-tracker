import { useEffect, useRef, useState } from "react";
import type { BalloonPoint } from "../types/types";

export function useBalloons(
  setPoints: (p: BalloonPoint[]) => void,
  hour: string
) {
  const [balloons, setBalloons] = useState<Record<string, BalloonPoint[]>>({});
  const [selectedBalloon, setSelectedBalloon] =
    useState<mapboxgl.TargetFeature | null>(null);
  const selectedBalloonRef = useRef<mapboxgl.TargetFeature | null>(null);

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
          console.log(objData[h][833]);
        }
        setBalloons(objData);
        setPoints(objData[hour]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    selectedBalloonRef.current = selectedBalloon;
  }, [selectedBalloon]);

  return {
    balloons,
    selectedBalloon,
    setSelectedBalloon,
    selectedBalloonRef,
  };
}
