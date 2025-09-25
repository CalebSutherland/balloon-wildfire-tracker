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
    <div style={{ position: "absolute", top: 40, left: 40, zIndex: 10 }}>
      <input
        type="range"
        min={0}
        max={23}
        step={0.01}
        value={time}
        onChange={(e) => handleTimeChange(parseFloat(e.target.value))}
      />
      <button onClick={() => setPlaying(!playing)} style={{ marginLeft: 10 }}>
        {playing ? "Pause" : "Play"}
      </button>
    </div>
  );
}
