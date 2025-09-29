// Custom React hook to manage balloon points on the Mapbox map
// - mapRef: ref to the Mapbox map instance
// - mapLoaded: boolean indicating whether the map has finished loading
// - balloons: record of BalloonPoint arrays keyed by hour
// - loadingBalloons: boolean indicating if balloon data is still loading
// - balloonError: boolean indicating if there was an error fetching balloons
//
// Responsibilities:
// - Converts the latest hour's balloons (e.g., "23") into a GeoJSON FeatureCollection
// - Updates the Mapbox "points" source with balloon features
// - Provides a ref to the current balloon FeatureCollection
//
// Returns:
// - balloonFCRef: ref to the current GeoJSON FeatureCollection of balloon points

import { useEffect, useRef } from "react";
import type { BalloonPoint, FC } from "../types/types";

export function useBalloons(
  mapRef: React.RefObject<mapboxgl.Map | null>,
  mapLoaded: boolean,
  balloons: Record<string, BalloonPoint[]>,
  loadingBalloons: boolean,
  balloonError: boolean
) {
  const balloonFCRef = useRef<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    console.log(balloonError);
  }, [balloonError]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || loadingBalloons || balloonError)
      return;

    const balloonFeatures: FC = {
      type: "FeatureCollection",
      features: balloons["23"].map((b) => ({
        type: "Feature",
        id: b.index,
        geometry: {
          type: "Point",
          coordinates: [b.lon, b.lat],
        },
        properties: {
          index: b.index,
          lon: b.lon,
          lat: b.lat,
          alt: b.alt,
        },
      })),
    };

    balloonFCRef.current = balloonFeatures;

    const source = mapRef.current.getSource("points") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(balloonFeatures);
    }
  }, [mapLoaded, balloons, mapRef, loadingBalloons, balloonError]);

  return { balloonFCRef };
}
