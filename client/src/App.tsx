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
import FireKey from "./components/fire-key";
import PathKey from "./components/path-key";
import LeaderBoard from "./components/leaderboard";

function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  const { balloons, distances, maxAltitudes, loadingBalloons, balloonError } =
    getBalloons();

  const { fires, fireIndexRef, loadingFires } = getFires();

  const {
    map,
    selectedBalloon,
    balloonFCRef,
    selectBalloonByIndex,
    fireCounts,
  } = useMap(
    mapContainerRef,
    fires,
    fireIndexRef,
    balloons,
    loadingBalloons,
    loadingFires
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
        <h1 className="header">WindBorne Fire Tracker</h1>

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
              style={{ minHeight: "30rem", width: "100%" }}
            />
          </div>

          <BalloonOverlay
            balloons={balloons}
            hour={hour}
            selectedBalloonIndex={selectedBalloonIndex}
            distances={distances}
            maxAltitudes={maxAltitudes}
            fireCounts={fireCounts}
          />
        </div>

        <div>
          {loadingBalloons && <p>Balloon data loading...</p>}
          {loadingFires && <p>Fire data loading...</p>}
        </div>

        <div className="keys-wrapper">
          <FireKey />
          <PathKey />
        </div>

        <h2 className="header">Balloon Leaderboard</h2>

        <LeaderBoard
          distances={distances}
          maxAltitudes={maxAltitudes}
          selectBalloonByIndex={selectBalloonByIndex}
          playing={playing}
          setPlaying={setPlaying}
        />
      </div>
    );
  } else {
    return <p>Balloon Error</p>;
  }
}

export default App;
