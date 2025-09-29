// Displays an overlay panel showing detailed stats for a selected balloon.
//
// Props:
// - balloons[hour][i]: Balloon data for each hour and index
// - hour: Current hour to display balloons from
// - selectedBalloonIndex: Index of the currently selected balloon, or null
// - distances[i]: Total distance traveled by balloon i
// - maxAltitudes[i]: Maximum altitude reached by balloon i
// - fireCounts[i]: Number of fires within 50 km of balloon i's path
//
// Features:
// - Shows a balloon icon (red if selected, grey otherwise)
// - Displays latitude and longitude in N/S and E/W format
// - Shows current altitude, peak altitude, distance traveled, and average speed
// - Displays number of nearby fires along balloon's path
// - Shows "No Balloon Selected" message if no balloon is selected

import type { BalloonPoint } from "../types/types";
import BalloonIcon from "./balloon-icon";
import "./css/balloon-overlay.css";

interface BalloonOverlayProps {
  balloons: Record<string, BalloonPoint[]>;
  hour: string;
  selectedBalloonIndex: number | null;
  distances: Record<number, number>;
  maxAltitudes: Record<number, number>;
  fireCounts: Record<number, number>;
}

function formatLat(lat: number) {
  const direction = lat >= 0 ? "N" : "S";
  return `${Math.abs(lat).toFixed(2)}° ${direction}`;
}

function formatLon(lon: number) {
  const direction = lon >= 0 ? "E" : "W";
  return `${Math.abs(lon).toFixed(2)}° ${direction}`;
}

export function BalloonOverlay({
  balloons,
  hour,
  selectedBalloonIndex,
  distances,
  maxAltitudes,
  fireCounts,
}: BalloonOverlayProps) {
  let currentBalloon;
  let latitude;
  let longitude;
  let altitude;
  let maxAlt;
  let distance;
  let speed;

  if (selectedBalloonIndex != null) {
    currentBalloon = balloons[hour][selectedBalloonIndex];

    latitude = formatLat(parseFloat(currentBalloon.lat.toFixed(2)));
    longitude = formatLon(parseFloat(currentBalloon.lon.toFixed(2)));
    altitude = currentBalloon.alt.toFixed(2);
    maxAlt = maxAltitudes[currentBalloon.index].toFixed(2);
    distance = (distances[currentBalloon.index] / 1000).toFixed(0);
    speed = (distances[currentBalloon.index] / 1000 / 24).toFixed(0);
  }

  return (
    <div className="overlay-wrapper">
      <div className="overlay-inner">
        <div className="balloon-icon-wrapper">
          <BalloonIcon
            color={currentBalloon ? "red" : "grey"}
            index={currentBalloon ? currentBalloon.index : null}
          />
        </div>

        {currentBalloon ? (
          <div className="balloon-stats-wrapper">
            <div className="stats-header">
              <p>
                <b>Fire Points Within 50 km of Path</b>:{" "}
                {fireCounts[currentBalloon.index]}
              </p>
            </div>
            <div className="balloon-stats">
              <p>
                <b>Latitude</b>: {latitude}
              </p>
              <p>
                <b>Longitude</b>: {longitude}
              </p>
              <p>
                <b>Altitude</b>: {altitude} km
              </p>
              <p>
                <b>Peak Altitude</b>: {maxAlt} km
              </p>
              <p>
                <b>Distance Traveled</b>: {distance} km
              </p>
              <p>
                <b>Average Speed</b>: {speed} km/h
              </p>
            </div>
          </div>
        ) : (
          <div className="no-balloon">
            <p>No Balloon Selected</p>
          </div>
        )}
      </div>
    </div>
  );
}
