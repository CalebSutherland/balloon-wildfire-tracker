import type { BalloonPoint } from "../types/types";

interface ControlsProps {
  hour: string;
  setHour: (hour: string) => void;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  balloons: Record<string, BalloonPoint[]>;
  setPoints: (points: BalloonPoint[]) => void;
}

export function Controls({
  hour,
  setHour,
  playing,
  setPlaying,
  balloons,
  setPoints,
}: ControlsProps) {
  return (
    <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
      <select
        value={hour}
        onChange={(e) => {
          const newHour = e.target.value;
          setHour(newHour);

          if (balloons[newHour]) {
            setPoints(balloons[newHour]);
          }
        }}
      >
        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map(
          (h) => (
            <option key={h} value={h}>
              {h}
            </option>
          )
        )}
      </select>
      <button onClick={() => setPlaying(!playing)} style={{ marginLeft: 10 }}>
        {playing ? "Pause" : "Play"}
      </button>
    </div>
  );
}
