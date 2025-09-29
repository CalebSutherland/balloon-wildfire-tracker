import { useRef, useState } from "react";

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
import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  const { balloons, distances, maxAltitudes, loadingBalloons, balloonError } =
    getBalloons();

  const { fires, fireIndexRef, loadingFires, fireError } = getFires();

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
    loadingFires,
    balloonError,
    fireError
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
        {loadingBalloons && loadingFires && (
          <p>Render backend spinning up, please be patient.</p>
        )}
        {balloonError ? (
          <p>
            Failed to load balloon data. Try refreshing the page in 30 seconds.
          </p>
        ) : (
          loadingBalloons && <p>Balloon data loading...</p>
        )}

        {fireError ? (
          <p>Faild to load fire data. Try refreshing the page in 30 seconds.</p>
        ) : (
          loadingFires && <p>Fire data loading...</p>
        )}
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
}

export default App;
