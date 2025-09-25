import "./App.css";
import { useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

import { useMap } from "./hooks/use-map";
import { getBalloons } from "./api/get-balloons";
import { useBalloonAnimation } from "./hooks/use-balloon-animation";
import { Controls } from "./components/controls";
import { BalloonOverlay } from "./components/balloon-overlay";
import { pad } from "./utils/utils";
import { getFires } from "./api/get-fires";

function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  const { balloons, maxBalloon, maxDist, balloonError } = getBalloons();
  const { fires, fireIndexRef } = getFires();

  const { map, selectedBalloon, balloonFCRef, selectBalloonByIndex } = useMap(
    mapContainerRef,
    fires,
    fireIndexRef,
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
      <div className="app-wrapper">
        <div className="display-wrapper">
          <div className="map-wrapper">
            <Controls
              time={time}
              handleTimeChange={handleTimeChange}
              playing={playing}
              setPlaying={setPlaying}
            />

            {/* mapbox map */}
            <div
              ref={mapContainerRef}
              style={{ height: "100%", width: "100%" }}
            />
          </div>

          <BalloonOverlay
            balloons={balloons}
            hour={hour}
            selectedBalloonIndex={selectedBalloonIndex}
          />
        </div>
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

export default App;
