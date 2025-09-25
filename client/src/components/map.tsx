import { useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

import { useMap } from "../hooks/use-map";
import { useBalloons } from "../hooks/use-balloons";
import { useBalloonAnimation } from "../hooks/use-balloon-animation";
import { Controls } from "./controls";
import { BalloonOverlay } from "./balloon-overlay";
import { pad } from "../utils/utils";
import { useFires } from "../hooks/use-fires";

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  const { balloons, maxBalloon, maxDist, balloonError } = useBalloons();
  const { fires } = useFires();

  const { map, selectedBalloon, balloonFCRef, selectBalloonByIndex } = useMap(
    mapContainerRef,
    fires,
    balloons
  );

  const selectedBalloonIndex = selectedBalloon
    ? Number((selectedBalloon as any).properties.index)
    : null;

  const { time, handleTimeChange } = useBalloonAnimation({
    playing,
    map,
    balloonFCRef,
    balloons,
    selectedBalloonIndex,
  });

  const hour = pad(Math.floor(time) % 24);

  if (!balloonError) {
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
  } else {
    return <p>Balloon Error</p>;
  }
}
