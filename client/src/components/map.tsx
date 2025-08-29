import { useEffect, useRef, useState } from "react";
import type { FeatureCollection, Point, Feature } from "geojson";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [balloons, setBalloons] = useState<Record<string, number[][]>>({});
  const [selectedBalloon, setSelectedBalloon] =
    useState<mapboxgl.TargetFeature | null>(null);
  const [selectedBalloonIndex, setSelectedBalloonIndex] = useState<
    number | null
  >(null);
  const [points, setPoints] = useState<number[][]>([]);
  const [hour, setHour] = useState("00");
  const [playing, setPlaying] = useState(false);

  const hourRef = useRef(hour);
  const balloonsRef = useRef(balloons);
  const selectedBalloonRef = useRef<mapboxgl.TargetFeature | null>(null);
  const playingRef = useRef(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      //style: "mapbox://styles/mapbox/standard-satellite",
      container: mapContainerRef.current,
      center: [-123, 44],
      zoom: 3,
    });

    map.addControl(new mapboxgl.NavigationControl());

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
          "circle-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#f00",
            "#4264fb",
          ],
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            16,
            ["boolean", ["feature-state", "highlight"], false],
            16,
            12,
          ],
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

      map.addInteraction("click", {
        type: "click",
        target: { layerId: "points-layer" },
        handler: ({ feature }: { feature?: mapboxgl.TargetFeature }) => {
          if (!feature) return;

          const index = parseInt(String(feature.properties.index));

          if (selectedBalloonRef.current) {
            map.setFeatureState(selectedBalloonRef.current, {
              selected: false,
            });
          }
          map.setFeatureState(feature, { selected: true });
          setSelectedBalloon(feature);
          setSelectedBalloonIndex(index);
        },
      });

      map.addInteraction("map-click", {
        type: "click",
        handler: () => {
          if (selectedBalloonRef.current) {
            map.setFeatureState(selectedBalloonRef.current, {
              selected: false,
            });
            setSelectedBalloon(null);
            setSelectedBalloonIndex(null);
          }
        },
      });

      map.addInteraction("mouseenter", {
        type: "mouseenter",
        target: { layerId: "points-layer" },
        handler: ({ feature }: { feature?: mapboxgl.TargetFeature }) => {
          if (!feature) return;
          map.setFeatureState(feature, { highlight: true });
          map.getCanvas().style.cursor = "pointer";
        },
      });

      map.addInteraction("mouseleave", {
        type: "mouseleave",
        target: { layerId: "points-layer" },
        handler: ({ feature }: { feature?: mapboxgl.TargetFeature }) => {
          if (!feature) return;
          map.setFeatureState(feature, { highlight: false });
          map.getCanvas().style.cursor = "";
          return false;
        },
      });

      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => map.remove();
  }, []);

  useEffect(() => {
    hourRef.current = hour;
  }, [hour]);

  useEffect(() => {
    balloonsRef.current = balloons;
  }, [balloons]);

  useEffect(() => {
    selectedBalloonRef.current = selectedBalloon;
  }, [selectedBalloon]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

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
      features: points.map(([lat, lon, alt], i) => ({
        type: "Feature",
        id: i,
        geometry: { type: "Point", coordinates: [lon, lat, alt] },
        properties: { index: i.toString(), lon: lon, lat: lat, alt: alt },
      })),
    };

    console.log("Updating source with", geojson.features.length, "points");
    source.setData(geojson);
  }, [points, mapLoaded]);

  useEffect(() => {
    if (!playing) return;

    if (playing && popupRef.current) {
      popupRef.current.remove();
    }

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
        <button
          onClick={() => {
            setPlaying(!playing);
            playingRef.current = !playing;
          }}
          style={{ marginLeft: 10 }}
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>

      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
      <div
        className="map-overlay"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "230px",
          padding: "10px",
          color: "#1a2224",
          fontSize: "12px",
          lineHeight: "20px",
          fontFamily: "sans-serif",
        }}
      >
        {selectedBalloonIndex && (
          <div
            className="map-overlay-inner"
            style={{
              background: "#fff",
              padding: "10px",
              borderRadius: "3px",
            }}
          >
            <code>Balloon {selectedBalloonIndex}</code>
            <hr />
            <li>
              <b>Lat</b>: {balloons[hour][selectedBalloonIndex][0].toFixed(2)}
            </li>
            <li>
              <b>Lon</b>: {balloons[hour][selectedBalloonIndex][1].toFixed(2)}
            </li>
            <li>
              <b>Alt</b>: {balloons[hour][selectedBalloonIndex][2].toFixed(2)}
            </li>
          </div>
        )}
      </div>
    </div>
  );
}
