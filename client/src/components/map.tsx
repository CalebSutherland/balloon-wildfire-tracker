import { useRef, useEffect, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

import { useMap } from "../hooks/use-map";
import { useBalloons } from "../hooks/use-balloons";
import { Controls } from "./controls";
import { BalloonOverlay } from "./balloon-overlay";
import type { BalloonPoint } from "../types/types";

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [points, setPoints] = useState<BalloonPoint[]>([]);
  const [hour, setHour] = useState("00");
  const hourRef = useRef(hour);

  const { balloons, selectedBalloonRef, selectedBalloon, setSelectedBalloon } =
    useBalloons(setPoints, hour);

  const selectedBalloonIndex =
    parseInt(String(selectedBalloon?.properties.index)) || null;

  useEffect(() => {
    console.log(selectedBalloonIndex);
  }, [selectedBalloonIndex]);

  const { map, mapLoaded } = useMap(mapContainerRef, {
    selectedBalloonRef,
    setSelectedBalloon,
  });

  const handleTracking = () => {
    if (selectedBalloonIndex === null) return;

    if (!tracking) {
      const selected = balloons[hourRef.current][selectedBalloonIndex];
      setPoints([selected]);
      setTracking(true);
    } else {
      setPoints(balloons[hourRef.current]);
      setTracking(false);
    }
  };

  // When points update, update the map
  useEffect(() => {
    if (!mapLoaded || !points) return;
    const source = map.current!.getSource("points") as mapboxgl.GeoJSONSource;
    source.setData({
      type: "FeatureCollection",
      features: points.map(({ lat, lon, alt, index }) => ({
        type: "Feature",
        id: index,
        geometry: { type: "Point", coordinates: [lon, lat, alt] },
        properties: { index, lat, lon, alt },
      })),
    });
  }, [mapLoaded, points]);

  useEffect(() => {
    if (!playing) return;

    let currentHour = parseInt(hourRef.current);

    const interval = setInterval(() => {
      currentHour = (currentHour - 1 + 24) % 24;
      const hourString = String(currentHour).padStart(2, "0");
      setHour(hourString);
      hourRef.current = hourString;

      if (tracking) {
        setPoints([balloons[hourRef.current][selectedBalloonIndex!]]);
      } else {
        setPoints(balloons[hourRef.current]);
      }

      // Move the camera if following a balloon
      if (selectedBalloonIndex !== null) {
        const coords = balloons[hourString]?.[selectedBalloonIndex];
        if (coords) {
          map.current!.easeTo({
            center: [coords.lon, coords.lat],
            duration: 250,
          });
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [playing, selectedBalloonIndex, balloons, tracking]);

  useEffect(() => {
    if (tracking && selectedBalloon === null) {
      setTracking(false);
    }
  }, [selectedBalloonIndex]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Controls
        hour={hour}
        setHour={setHour}
        playing={playing}
        setPlaying={setPlaying}
        balloons={balloons}
        setPoints={setPoints}
      />

      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
      <BalloonOverlay
        balloons={balloons}
        hour={hour}
        selectedBalloonIndex={selectedBalloonIndex}
        tracking={tracking}
        handleTracking={handleTracking}
      />
    </div>
  );
}
