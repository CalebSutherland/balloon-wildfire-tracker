import { Slider } from "@/components/ui/slider";
import "./controls.css";

interface ControlsProps {
  time: number;
  handleTimeChange: (t: number) => void;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
}

export function Controls({
  time,
  handleTimeChange,
  playing,
  setPlaying,
}: ControlsProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        left: 40,
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <div className="slider-light">
        <Slider
          style={{ width: "10rem" }}
          defaultValue={[0]}
          min={0}
          max={23}
          step={0.01}
          value={[23 - time]} // flip it for display
          onValueChange={(vals) => handleTimeChange(23 - vals[0])}
        />
      </div>
      <button className="play-button" onClick={() => setPlaying(!playing)}>
        {playing ? "Pause" : "Play"}
      </button>
    </div>
  );
}
