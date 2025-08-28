import { useEffect, useState } from "react";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function leaflet() {
  const position: [number, number] = [40, -74.5];
  const [points, setPoints] = useState<number[][]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/treasure")
      .then((res) => res.json())
      .then((data) => {
        setPoints(data);
        console.log(data);
      })
      .catch((err) => console.error("Error fetching:", err));
  }, []);

  return (
    <MapContainer
      center={position}
      zoom={9}
      style={{ height: "100%", width: "100%" }}
      maxBounds={[
        [-90, -180], // southwest corner
        [90, 180], // northeast corner
      ]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        noWrap
      />
      {points.map(([lat, lng, alt], i) => (
        <Marker key={i} position={[lat, lng]}>
          <Popup>Altitude: {alt.toFixed(2)}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
