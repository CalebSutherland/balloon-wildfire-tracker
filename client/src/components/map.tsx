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

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  const { balloons, maxBalloon, maxDist } = useBalloons();
  const { fires } = useFires();

  const { map, selectedBalloon, setSelectedBalloon, selectedBalloonRef } =
    useMap(mapContainerRef, fires, balloons);

  const selectedBalloonIndex = selectedBalloon
    ? Number((selectedBalloon as any).properties.index)
    : null;

  const { tracking, handleTracking } = useTracking(selectedBalloon);

  const { time, handleTimeChange } = useAnimation(playing);

  const { updatePositions, fcRef } = useBalloonAnimation({
    map,
    balloons,
    selectedBalloonIndex,
    tracking,
  });

  const hour = pad(Math.floor(time) % 24);

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
    updatePositions(time);
  }, [time, updatePositions]);

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
