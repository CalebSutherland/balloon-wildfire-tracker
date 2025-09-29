// Custom React hook to draw the path of a selected balloon and compute nearby fires
// - mapRef: ref to the Mapbox map instance
// - mapLoaded: boolean indicating whether the map has finished loading
// - selectedBalloon: the currently selected balloon feature
// - balloons: record of BalloonPoint arrays keyed by hour
// - fires: array of FireRecord objects
// - fireIndexRef: ref to KDBush spatial index for fast nearest-fire queries
// - setFireCounts: setter to update fire counts near balloons
// - loadingBalloons / loadingFires: boolean flags for loading state
//
// Responsibilities:
// - Collects the selected balloon's coordinates across all hours
// - Normalizes and subdivides the path for smoother lines
// - Queries nearest fires along each segment using geokdbush
// - Assigns colors to path segments based on proximity to fires
//   - red (<5 km), orange (<20 km), yellow (<50 km), green (>=50 km)
// - Updates the Mapbox "balloonPath" source with colored line segments
// - Updates the fire count for the balloon
//
// Returns: nothing directly; side effects update the map and fire counts

import type { TargetFeature } from "mapbox-gl";
import type { BalloonPoint, FireRecord } from "../types/types";
import { useEffect } from "react";
import { normailzeLineCoords, subdivideSegment } from "../utils/utils";
import type KDBush from "kdbush";
import * as geokdbush from "geokdbush";

export default function usePath(
  mapRef: React.RefObject<mapboxgl.Map | null>,
  mapLoaded: boolean,
  selectedBalloon: TargetFeature | null,
  balloons: Record<string, BalloonPoint[]>,
  fires: FireRecord[],
  fireIndexRef: React.RefObject<KDBush | null>,
  setFireCounts: React.Dispatch<React.SetStateAction<Record<number, number>>>,
  loadingBalloons: boolean,
  loadingFires: boolean
) {
  const fireIds = new Set<number>();
  useEffect(() => {
    if (
      !mapLoaded ||
      !mapRef.current ||
      !selectedBalloon ||
      loadingBalloons ||
      loadingFires
    )
      return;

    const index = fireIndexRef.current; // KDBush | null
    const source = mapRef.current.getSource(
      "balloonPath"
    ) as mapboxgl.GeoJSONSource;
    if (!source) return;

    const balloonIndex = selectedBalloon.id as number;

    // collect balloon coordinates
    const coords: [number, number][] = [];
    for (const hour of Object.keys(balloons).sort()) {
      const point = balloons[hour]?.[balloonIndex];
      if (point) coords.push([point.lon, point.lat]);
    }
    const adjusted = normailzeLineCoords(coords);
    if (adjusted.length < 2) {
      source.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    const zoom = mapRef.current.getZoom();
    const maxStepKm = zoom < 4 ? 50 : 10;
    const segments: GeoJSON.Feature<GeoJSON.LineString>[] = [];

    let fireCount = 0;

    for (let i = 0; i < adjusted.length - 1; i++) {
      const start = adjusted[i];
      const end = adjusted[i + 1];

      const subpoints = subdivideSegment(start, end, maxStepKm);

      for (let j = 0; j < subpoints.length - 1; j++) {
        const subStart = subpoints[j];
        const subEnd = subpoints[j + 1];

        const midLon = (subStart[0] + subEnd[0]) / 2;
        const midLat = (subStart[1] + subEnd[1]) / 2;

        let nearestDistanceKm = Infinity;
        if (index && fires.length) {
          const nearestIds = geokdbush.around(
            index,
            midLon,
            midLat,
            Infinity,
            50
          ) as number[];

          for (const id of nearestIds) {
            fireIds.add(id);
          }
          if (nearestIds.length > 0) {
            const nearestFire = fires[nearestIds[0]];
            nearestDistanceKm = geokdbush.distance(
              midLon,
              midLat,
              nearestFire.longitude,
              nearestFire.latitude
            );
          }
        }

        let color = "#00ff00";
        if (nearestDistanceKm <= 5) color = "#ff0000";
        else if (nearestDistanceKm <= 20) color = "#ff9b20";
        else if (nearestDistanceKm <= 50) color = "#fff93d";

        segments.push({
          type: "Feature",
          geometry: { type: "LineString", coordinates: [subStart, subEnd] },
          properties: { color },
        });
      }
    }
    fireCount = fireIds.size;
    setFireCounts((prev) => ({
      ...prev,
      [balloonIndex]: fireCount,
    }));

    source.setData({ type: "FeatureCollection", features: segments });
    console.log(`Balloon ${balloonIndex} fire count:`, fireCount);
  }, [
    mapLoaded,
    balloons,
    selectedBalloon,
    fires,
    loadingBalloons,
    loadingFires,
  ]);
}
