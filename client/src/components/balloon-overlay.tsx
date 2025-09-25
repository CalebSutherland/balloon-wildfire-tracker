import type { BalloonPoint } from "../types/types";

interface BalloonOverlayProps {
  balloons: Record<string, BalloonPoint[]>;
  hour: string;
  selectedBalloonIndex: number | null;
}

export function BalloonOverlay({
  balloons,
  hour,
  selectedBalloonIndex,
}: BalloonOverlayProps) {
  if (selectedBalloonIndex == null) return null;

  const currentBalloon = balloons[hour][selectedBalloonIndex];

  return (
    <div
      className="map-overlay"
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: "230px",
        padding: "10px",
        color: "#1a2224",
        fontSize: "12px",
        lineHeight: "20px",
        fontFamily: "sans-serif",
        zIndex: 10,
      }}
    >
      <div
        className="map-overlay-inner"
        style={{
          background: "#fff",
          padding: "10px",
          borderRadius: "3px",
          width: "100%",
          height: "100%",
        }}
      >
        <b>Balloon {selectedBalloonIndex}</b>
        <hr />
        <li>
          <b>Lat</b>: {currentBalloon.lat.toFixed(2)}
        </li>
        <li>
          <b>Lon</b>: {currentBalloon.lon.toFixed(2)}
        </li>
        <li>
          <b>Alt</b>: {currentBalloon.alt.toFixed(2)}
        </li>
      </div>
    </div>
  );
}
