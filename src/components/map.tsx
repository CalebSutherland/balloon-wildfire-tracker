import { useEffect, useRef } from "react";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container,
      center: [-74.5, 40], // starting position [lng, lat]
      zoom: 9, // starting zoom
    });

    const marker = new mapboxgl.Marker({ color: "red" })
      .setLngLat([-74.5, 40]) // [longitude, latitude]
      .setPopup(new mapboxgl.Popup().setText("Hello, this is a marker!")) // optional popup
      .addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <div
      style={{ height: "100%", width: "100%" }}
      ref={mapContainerRef}
      className="map-container"
    />
  );
}
