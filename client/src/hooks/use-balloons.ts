import { useEffect, useRef, useState } from "react";

export function useBalloons() {
  const [balloons, setBalloons] = useState<Record<string, number[][]>>({});
  const [points, setPoints] = useState<number[][]>([]);
  const [hour, setHour] = useState("00");
  const [playing, setPlaying] = useState(false);
  const [selectedBalloon, setSelectedBalloon] =
    useState<mapboxgl.TargetFeature | null>(null);
  const selectedBalloonRef = useRef<mapboxgl.TargetFeature | null>(null);
  const hourRef = useRef(hour);

  useEffect(() => {
    fetch("http://localhost:5000/api/treasure")
      .then((res) => res.json())
      .then((data) => {
        setBalloons(data);
        setPoints(data[hour] || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    hourRef.current = hour;
    setPoints(balloons[hour] || []);
  }, [hour, balloons]);

  useEffect(() => {
    selectedBalloonRef.current = selectedBalloon;
  }, [selectedBalloon]);

  return {
    balloons,
    points,
    hour,
    setHour,
    hourRef,
    playing,
    setPlaying,
    selectedBalloon,
    setSelectedBalloon,
    selectedBalloonRef,
  };
}
