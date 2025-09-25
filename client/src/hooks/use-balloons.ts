import { useEffect, useRef } from "react";
import type { BalloonPoint, FC } from "../types/types";

export function useBalloons(
  mapRef: React.RefObject<mapboxgl.Map | null>,
  mapLoaded: boolean,
  balloons: Record<string, BalloonPoint[]>
) {
  const balloonFCRef = useRef<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    if (!mapLoaded || !balloons || !mapRef.current) return;

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
  }, [mapLoaded, balloons, mapRef]);

  return { balloonFCRef };
}
