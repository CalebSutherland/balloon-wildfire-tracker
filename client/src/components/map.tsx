import { useEffect, useRef, useState } from "react";
import type { FeatureCollection, Point } from "geojson";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [balloons, setBalloons] = useState<Record<string, number[][]>>({});
  const [points, setPoints] = useState<number[][]>([]);
  const [hour, setHour] = useState("00");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [-123, 44],
      zoom: 3,
    });

    map.on("load", () => {
      // Add empty GeoJSON source
      map.addSource("points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // Add circle layer
      map.addLayer({
        id: "points-layer",
        type: "circle",
        source: "points",
        paint: {
          "circle-radius": 12,
          "circle-color": "#007cbf",
        },
      });

      map.addLayer({
        id: "points-label",
        type: "symbol",
        source: "points",
        layout: {
          "text-field": ["get", "index"], // pull from properties
          "text-size": 10,
          "text-anchor": "center",
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#fff",
        },
      });

      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => map.remove();
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/treasure")
      .then((res) => res.json())
      .then((data) => {
        setBalloons(data);
        setPoints(data[hour] || []);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!balloons[hour]) return;
    setPoints(balloons[hour]);
  }, [hour, balloons]);

  useEffect(() => {
    if (!mapLoaded) return;

    const source = mapRef.current!.getSource(
      "points"
    ) as mapboxgl.GeoJSONSource;
    const geojson: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: points.map(([lat, lon], i) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon, lat] },
        properties: { index: i.toString() },
      })),
    };

    console.log("Updating source with", geojson.features.length, "points");
    source.setData(geojson);
  }, [points, mapLoaded]);

  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      setHour((prev) => {
        const nextHour = (parseInt(prev) + 1) % 24;
        return String(nextHour).padStart(2, "0");
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [playing]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {/* Controls */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
        <select value={hour} onChange={(e) => setHour(e.target.value)}>
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

      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
