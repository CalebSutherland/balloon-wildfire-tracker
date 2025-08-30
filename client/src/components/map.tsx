import { useRef, useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

import { useMap } from "../hooks/use-map";
import { useBalloons } from "../hooks/use-balloons";
import { Controls } from "./controls";
import { BalloonOverlay } from "./balloon-overlay";

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const {
    balloons,
    points,
    hour,
    hourRef,
    setHour,
    playing,
    setPlaying,
    selectedBalloonRef,
    selectedBalloon,
    setSelectedBalloon,
  } = useBalloons();

  const selectedBalloonIndex =
    parseInt(String(selectedBalloon?.properties.index)) || null;

  const { map, mapLoaded } = useMap(mapContainerRef, {
    selectedBalloonRef,
    setSelectedBalloon,
  });

  // When points update, update the map
  useEffect(() => {
    if (!mapLoaded) return;
    const source = map.current!.getSource("points") as mapboxgl.GeoJSONSource;
    source.setData({
      type: "FeatureCollection",
      features: points.map(([lat, lon, alt], i) => ({
        type: "Feature",
        id: i,
        geometry: { type: "Point", coordinates: [lon, lat, alt] },
        properties: { index: i.toString() },
      })),
    });
  }, [mapLoaded, points]);

  useEffect(() => {
    if (!playing) return;

    let currentHour = parseInt(hourRef.current);

    const interval = setInterval(() => {
      // Update the hour if playing
      currentHour = (currentHour - 1 + 24) % 24;
      const hourString = String(currentHour).padStart(2, "0");
      setHour(hourString);
      hourRef.current = hourString;

      // Move the camera if following a balloon
      if (selectedBalloonIndex !== null) {
        const coords = balloons[hourString]?.[selectedBalloonIndex];
        if (coords) {
          map.current!.easeTo({
            center: [coords[1], coords[0]],
            duration: 250,
          });
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [playing, selectedBalloonIndex, balloons]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Controls
        hour={hour}
        setHour={setHour}
        playing={playing}
        setPlaying={setPlaying}
      />

      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
      <BalloonOverlay
        balloons={balloons}
        hour={hour}
        selectedBalloonIndex={selectedBalloonIndex}
      />
    </div>
  );
}
