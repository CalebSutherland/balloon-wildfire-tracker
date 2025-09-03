import { useRef, useCallback } from "react";
import {
  createInterpolatedFeatures,
  getCameraPosition,
} from "../utils/balloon-interp";
import type { BalloonPoint } from "../types/types";

interface UseBalloonAnimationParams {
  map: React.RefObject<mapboxgl.Map | null>;
  balloons: Record<string, BalloonPoint[]> | null;
  selectedBalloonIndex: number | null;
  tracking: boolean;
}

export function useBalloonAnimation({
  map,
  balloons,
  selectedBalloonIndex,
  tracking,
}: UseBalloonAnimationParams) {
  const fcRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const lastCamMsRef = useRef(0);

  const updatePositions = useCallback(
    (fractionalHour: number) => {
      if (!balloons || !map.current) return;

      const features = createInterpolatedFeatures({
        fractionalHour,
        balloons,
        selectedBalloonIndex,
        trackingMode: tracking,
      });

      fcRef.current = { type: "FeatureCollection", features };

      const source = map.current.getSource("points") as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(fcRef.current);
      }

      // Handle camera tracking
      if (selectedBalloonIndex !== null) {
        const nowMs = performance.now();
        const cameraHz = 6;
        const minCamDelta = 1000 / cameraHz;

        if (nowMs - lastCamMsRef.current >= minCamDelta) {
          const cameraPos = getCameraPosition(
            fractionalHour,
            balloons,
            selectedBalloonIndex
          );
          if (cameraPos) {
            map.current.easeTo({ center: [cameraPos.lon, cameraPos.lat] });
            lastCamMsRef.current = nowMs;
          }
        }
      }
    },
    [balloons, selectedBalloonIndex, tracking, map]
  );

  // Initialize with first hour data
  const initializeMap = useCallback(() => {
    if (!balloons?.["00"] || !map.current) return;

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

    fcRef.current = { type: "FeatureCollection", features };

    const source = map.current.getSource("points") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(fcRef.current);
    }
  }, [balloons, map]);

  return { updatePositions, initializeMap };
}
