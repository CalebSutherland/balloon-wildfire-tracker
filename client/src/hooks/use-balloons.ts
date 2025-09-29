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
