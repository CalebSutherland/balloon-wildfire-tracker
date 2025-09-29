// Main application component for the WindBorne Fire Tracker.
//
// Responsibilities:
// - Initializes the Mapbox map and attaches it to a ref
// - Fetches balloon and fire data from the backend using getBalloons and getFires
// - Manages state for animation (playing), selected balloon, and current time
// - Uses custom hooks:
//   - useMap: handles map setup, selection, and fire counts
//   - useBalloonAnimation: animates balloon positions over time
// - Displays UI components:
//   - Controls: slider and play/pause button for time animation
//   - BalloonOverlay: shows stats for selected balloon (lat/lon, altitude, distance, speed, fire counts)
//   - LeaderBoard: shows top balloons by distance or max altitude with podium and selection
//   - FireKey and PathKey: map legends for fire points and balloon path coloring
// - Handles loading and error states for balloon and fire data
//
// Layout:
// - Header with application title
// - Map container with Controls overlaid
// - BalloonOverlay panel next to the map
// - Loading/error messages displayed dynamically
// - Fire and path keys displayed below the map
// - Leaderboard section at the bottom

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
        {loadingBalloons && loadingFires && !balloonError && !fireError && (
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
