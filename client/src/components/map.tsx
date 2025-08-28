import { useEffect, useRef, useState } from "react";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [points, setPoints] = useState<number[][]>([]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container,
      center: [-74.5, 40], // starting position [lng, lat]
      zoom: 9, // starting zoom
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/treasure")
      .then((res) => res.json())
      .then((data) => {
        setPoints(data);
      })
      .catch((err) => console.error("Error fetching:", err));
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    points.forEach(([lat, lng, _alt]) => {
      new mapboxgl.Marker()
        .setLngLat([lng, lat]) // Mapbox expects [lng, lat]
        .addTo(mapRef.current!);
    });
  }, [points]);

  return (
    <div
      style={{ height: "100%", width: "100%" }}
      ref={mapContainerRef}
      className="map-container"
    />
  );
}
