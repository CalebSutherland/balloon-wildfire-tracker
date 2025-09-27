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

    latitude = currentBalloon.lat.toFixed(2);
    longitude = currentBalloon.lon.toFixed(2);
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
                <b>Fire Points Within 50km of Path</b>:{" "}
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
