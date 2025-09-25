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
        gap: "0.8rem",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <div className="slider-light">
        <Slider
          style={{ width: "10rem", paddingBottom: "0.2rem" }}
          defaultValue={[0]}
          min={0}
          max={23}
          step={0.01}
          value={[23 - time]} // flip it for display
          onValueChange={(vals) => handleTimeChange(23 - vals[0])}
        />
        <div className="slider-label">
          <span>24h</span>
          <span>12h</span>
          <span>Now</span>
        </div>
      </div>
      <button className="play-button" onClick={() => setPlaying(!playing)}>
        {playing ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M5 3h2v10H5V3zm4 0h2v10H9V3z" />
          </svg> // pause
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M4.5 3.5v9l8-4.5-8-4.5z" />
          </svg> // play
        )}
      </button>
    </div>
  );
}
