import type { BalloonPoint } from "../types/types";
import BalloonIcon from "./balloon-icon";
import "./balloon-overlay.css";

interface BalloonOverlayProps {
  balloons: Record<string, BalloonPoint[]>;
  hour: string;
  selectedBalloonIndex: number | null;
  distances: Record<number, number>;
  maxAltitudes: Record<number, number>;
  fireCounts: Record<number, number>;
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
  if (selectedBalloonIndex != null) {
    currentBalloon = balloons[hour][selectedBalloonIndex];
  }

  return (
    <div className="overlay-wrapper">
      <div className="balloon-icon-wrapper">
        <BalloonIcon
          color={currentBalloon ? "red" : "grey"}
          index={currentBalloon ? currentBalloon.index : null}
        />
      </div>

      {currentBalloon ? (
        <div>
          <b>Balloon {selectedBalloonIndex}</b>
          <hr />

          <li>
            <b>Latitude</b>: {currentBalloon.lat.toFixed(2)}
          </li>
          <li>
            <b>Longitude</b>: {currentBalloon.lon.toFixed(2)}
          </li>
          <li>
            <b>Altitude</b>: {currentBalloon.alt.toFixed(2)} km
          </li>
          <li>
            <b>Distance Traveled</b>:{" "}
            {(distances[currentBalloon.index] / 1000).toFixed(0)} km
          </li>
          <li>
            <b>Average Speed</b>:{" "}
            {(distances[currentBalloon.index] / 1000 / 24).toFixed(0)} km/h
          </li>
          <li>
            <b>Highest Altitude</b>:{" "}
            {maxAltitudes[currentBalloon.index].toFixed(2)} km
          </li>
          <li>
            <b>Fire Points in Range</b>: {fireCounts[currentBalloon.index]}
          </li>
        </div>
      ) : (
        <div>
          <p>No Balloon Selected</p>
        </div>
      )}
    </div>
  );
}
