import { useRef, useEffect, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

import { useMap } from "../hooks/use-map";
import { useBalloons } from "../hooks/use-balloons";
import { useAnimation } from "../hooks/use-animation";
import { useBalloonAnimation } from "../hooks/use-balloon-animation";
import { useTracking } from "../hooks/use-tracking";
import { Controls } from "./controls";
import { BalloonOverlay } from "./balloon-overlay";
import { pad } from "../utils/utils";
import { useFires } from "../hooks/use-fires";
import type { FC } from "../types/types";

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  const {
    balloons,
    selectedBalloonRef,
    selectedBalloon,
    setSelectedBalloon,
    maxBalloon,
    maxDist,
  } = useBalloons();

  const selectedBalloonIndex = selectedBalloon
    ? Number((selectedBalloon as any).properties.index)
    : null;

  const { map, mapLoaded } = useMap(mapContainerRef, {
    selectedBalloonRef,
    setSelectedBalloon,
  });

  const { tracking, handleTracking } = useTracking(selectedBalloon);

  const { time, handleTimeChange } = useAnimation(playing);

  const { updatePositions, initializeMap, fcRef } = useBalloonAnimation({
    map,
    balloons,
    selectedBalloonIndex,
    tracking,
  });

  const hour = pad(Math.floor(time) % 24);

  const { fires } = useFires();

  function selectBalloonByIndex(index: number) {
    if (!map.current) return;

    const sourceId = "points";

    // Clear previous selection
    if (selectedBalloonRef.current) {
      map.current.setFeatureState(selectedBalloonRef.current, {
        selected: false,
      });
    }

    // Set new selection
    map.current.setFeatureState(
      { source: sourceId, id: index },
      { selected: true }
    );

    // Update state to keep React in sync
    const feature = fcRef.current?.features.find((f) => f.id === index) ?? null;
    setSelectedBalloon(feature as mapboxgl.TargetFeature | null);

    // Keep a ref for deselecting later
    selectedBalloonRef.current = feature as mapboxgl.TargetFeature | null;
  }

  useEffect(() => {
    if (!mapLoaded || !map.current || !fires.length) return;

    const fireFeatures: FC = {
      type: "FeatureCollection",
      features: fires.map((fire, i) => ({
        type: "Feature",
        id: i,
        geometry: {
          type: "Point",
          coordinates: [parseFloat(fire.longitude), parseFloat(fire.latitude)],
        },
        properties: {
          confidence: fire.confidence,
          acq_date: fire.acq_date,
          acq_time: fire.acq_time,
          frp: parseFloat(fire.frp),
        },
      })),
    };

    const source = map.current.getSource("fires") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(fireFeatures);
    }
  }, [mapLoaded, fires, map]);

  useEffect(() => {
    updatePositions(time);
  }, [time, updatePositions]);

  // Initialize map data when loaded
  useEffect(() => {
    if (mapLoaded && balloons) {
      initializeMap();
    }
  }, [mapLoaded, balloons, initializeMap]);

  useEffect(() => {
    console.log(selectedBalloon);
    console.log(selectedBalloonIndex);
  }, [selectedBalloon, selectedBalloonIndex]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Controls
        time={time}
        handleTimeChange={handleTimeChange}
        playing={playing}
        setPlaying={setPlaying}
      />

      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />

      <BalloonOverlay
        balloons={balloons}
        hour={hour}
        selectedBalloonIndex={selectedBalloonIndex}
        tracking={tracking}
        handleTracking={handleTracking}
      />

      <div style={{ color: "white" }}>
        <h3>Balloon Stats</h3>
        <span style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <p>
            Furthest Flight: {maxDist.toFixed(0)}m Balloon #{maxBalloon}
          </p>
          {maxBalloon && (
            <button onClick={() => selectBalloonByIndex(maxBalloon)}>
              Select
            </button>
          )}
        </span>

        <p>Highest Altitude: </p>
      </div>
    </div>
  );
}
