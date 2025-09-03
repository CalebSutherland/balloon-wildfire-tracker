import { useRef, useEffect, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

import { useMap } from "../hooks/use-map";
import { useBalloons } from "../hooks/use-balloons";
import { Controls } from "./controls";
import { BalloonOverlay } from "./balloon-overlay";
import type { BalloonPoint, FC } from "../types/types";
import { clampLat, pad } from "../utils/utils";

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [points, setPoints] = useState<BalloonPoint[]>([]);
  const [time, setTime] = useState(0);
  const hour = pad(Math.floor(time) % 24);

  const { balloons, selectedBalloonRef, selectedBalloon, setSelectedBalloon } =
    useBalloons(setPoints, hour);

  const selectedBalloonIndex = selectedBalloon
    ? Number((selectedBalloon as any).properties.index)
    : null;

  useEffect(() => {
    console.log(selectedBalloonIndex);
  }, [selectedBalloonIndex]);

  const { map, mapLoaded } = useMap(mapContainerRef, {
    selectedBalloonRef,
    setSelectedBalloon,
  });

  const timeRef = useRef(time); // fractional hour [0, 24)
  const rafRef = useRef<number | null>(null);
  const fcRef = useRef<FC | null>(null);
  const lastCamMsRef = useRef(0);

  const handleTimeChange = (t: number) => {
    timeRef.current = t;
    setTime(t);
  };

  const handleTracking = () => {
    if (selectedBalloonIndex === null) return;
    setTracking((prev) => !prev);
  };

  const updatePositions = (fractionalHour: number) => {
    if (!fcRef.current || !balloons) return;

    const h1 = Math.floor(fractionalHour) % 24;
    const h2 = (h1 + 1) % 24;
    const t = fractionalHour - h1;
    const a = balloons[pad(h1)];
    const b = balloons[pad(h2)];
    if (!a || !b) return;

    let features: GeoJSON.Feature<GeoJSON.Point>[] = [];

    if (tracking && selectedBalloonIndex !== null) {
      // interpolate only selected balloon
      const b1 = a[selectedBalloonIndex];
      const b2 = b[selectedBalloonIndex] || b1;

      const lat = clampLat(b1.lat + (b2.lat - b1.lat) * t);
      const alt = b1.alt + (b2.alt - b1.alt) * t;

      let dLon = b2.lon - b1.lon;
      if (dLon > 180) dLon -= 360;
      if (dLon < -180) dLon += 360;
      const lon = b1.lon + dLon * t;

      features = [
        {
          type: "Feature",
          id: b1.index,
          geometry: { type: "Point", coordinates: [lon, lat, alt] },
          properties: { index: b1.index, lat, lon, alt },
        },
      ];
    } else {
      // interpolate all balloons
      features = a.map((b1, i) => {
        const b2 = b[i] || b1;

        const lat = clampLat(b1.lat + (b2.lat - b1.lat) * t);
        const alt = b1.alt + (b2.alt - b1.alt) * t;

        let dLon = b2.lon - b1.lon;
        if (dLon > 180) dLon -= 360;
        if (dLon < -180) dLon += 360;
        const lon = b1.lon + dLon * t;

        return {
          type: "Feature",
          id: b1.index,
          geometry: { type: "Point", coordinates: [lon, lat, alt] },
          properties: { index: b1.index, lat, lon, alt },
        };
      });
    }

    fcRef.current = { type: "FeatureCollection", features };

    const source = map.current!.getSource("points") as mapboxgl.GeoJSONSource;
    source.setData(fcRef.current);

    if (selectedBalloonIndex !== null) {
      const nowMs = performance.now();
      const cameraHz = 6;
      const minCamDelta = 1000 / cameraHz;

      if (nowMs - lastCamMsRef.current >= minCamDelta) {
        const b1 = a[selectedBalloonIndex];
        const b2 = b[selectedBalloonIndex] || b1;

        const lat = clampLat(b1.lat + (b2.lat - b1.lat) * t);
        let dLon = b2.lon - b1.lon;
        if (dLon > 180) dLon -= 360;
        if (dLon < -180) dLon += 360;
        const lon = b1.lon + dLon * t;

        map.current!.easeTo({ center: [lon, lat] });
        lastCamMsRef.current = nowMs;
      }
    }
  };

  // When points update, update the map
  useEffect(() => {
    if (!mapLoaded) return;
    if (!balloons || !balloons["00"]) return;

    const firstHour = balloons["00"];
    const features: GeoJSON.Feature<GeoJSON.Point>[] = firstHour.map((b) => ({
      type: "Feature",
      id: b.index,
      geometry: {
        type: "Point",
        coordinates: [b.lon, b.lat, b.alt] as [number, number, number],
      },
      properties: { index: b.index, lat: b.lat, lon: b.lon, alt: b.alt },
    }));

    fcRef.current = {
      type: "FeatureCollection",
      features,
    };

    // seed the source
    const source = map.current!.getSource("points") as mapboxgl.GeoJSONSource;
    source.setData(fcRef.current);
  }, [mapLoaded, balloons]);

  // Main animation loop
  useEffect(() => {
    if (!mapLoaded || !balloons || !fcRef.current) return;

    const speedHrsPerSec = 2.0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      timeRef.current = (timeRef.current + dt * speedHrsPerSec + 24) % 24;
      setTime(timeRef.current);

      updatePositions(timeRef.current);

      rafRef.current = requestAnimationFrame(step);
    };

    if (playing) {
      last = performance.now();
      rafRef.current = requestAnimationFrame(step);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      };
    }
  }, [mapLoaded, balloons, playing, selectedBalloonIndex, tracking]);

  useEffect(() => {
    if (!playing) {
      updatePositions(time);
    }
  }, [time, playing, balloons]);

  useEffect(() => {
    if (tracking && selectedBalloon === null) {
      setTracking(false);
    }
  }, [selectedBalloonIndex]);

  useEffect(() => {
    if (mapLoaded && balloons) {
      updatePositions(timeRef.current);
    }
  }, [tracking, selectedBalloonIndex, mapLoaded, balloons]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Controls
        time={time}
        handleTimeChange={handleTimeChange}
        playing={playing}
        setPlaying={setPlaying}
      />

      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
      <BalloonOverlay
        balloons={balloons}
        hour={hour}
        selectedBalloonIndex={selectedBalloonIndex}
        tracking={tracking}
        handleTracking={handleTracking}
      />
    </div>
  );
}
