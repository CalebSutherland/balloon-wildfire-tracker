import "./fire-key.css";

export default function fireKey() {
  const colors = [
    { color: "#9f1818", label: "<1hr" },
    { color: "#ca0000", label: "1-3hrs" },
    { color: "#ff7300", label: "3-6hrs" },
    { color: "#ffab3d", label: "6-12hrs" },
    { color: "#fff93d", label: "12-24hrs" },
    { color: "#ffffa5", label: ">24hrs" },
  ];
  return (
    <div className="fire-key-wrapper">
      <p className="fire-key-title">Fire Key</p>
      <div className="fire-key">
        {colors.map((c) => {
          const color = c.color;
          return (
            <div className="fire-key-row" key={c.label}>
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
