import "./css/path-key.css";

export default function pathKey() {
  const colors = [
    { color: "#ff0000", label: "Very Close (<5 km)" },
    { color: "#ff9b20", label: "Close (5-20 km)" },
    { color: "#fff93d", label: "Moderate (20-50 km)" },
    { color: "#00ff00", label: "No Fire Nearby (>50 km)" },
  ];
  return (
    <div className="path-key-wrapper">
      <p className="path-key-title">Balloon Path Key</p>
      <div className="path-key">
        {colors.map((c) => {
          const color = c.color;
          return (
            <div className="path-key-row" key={c.label}>
              <span
                style={{
                  display: "inline-block",
                  backgroundColor: color,
                  height: 16,
                  width: 16,
                }}
              ></span>
              <span style={{ fontSize: "0.8rem" }}>{c.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
