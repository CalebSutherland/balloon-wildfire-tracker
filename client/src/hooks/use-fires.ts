// Custom React hook to manage wildfire points on the Mapbox map
// - mapRef: ref to the Mapbox map instance
// - mapLoaded: boolean indicating whether the map has finished loading
// - fires: array of FireRecord objects
// - loadingFires: boolean indicating if fire data is still loading
// - fireError: boolean indicating if there was an error fetching fires
//
// Responsibilities:
// - Converts the fire data into a GeoJSON FeatureCollection
// - Updates the Mapbox "fires" source with fire features
// - Each feature includes coordinates and relevant fire properties
//
// Fire feature properties:
// - confidence: string
// - acq_date: string (YYYY-MM-DD)
// - acq_time: string (HHMM)
// - frp: number (fire radiative power)
// - timestamp: number (seconds since Unix epoch)

import { useEffect } from "react";
import type { FC, FireRecord } from "../types/types";

export default function useFires(
  mapRef: React.RefObject<mapboxgl.Map | null>,
  mapLoaded: boolean,
  fires: FireRecord[],
  loadingFires: boolean,
  fireError: boolean
) {
  //Add fire data points
  useEffect(() => {
    if (
      !mapLoaded ||
      !mapRef.current ||
      !fires.length ||
      loadingFires ||
      fireError
    )
      return;

    const fireFeatures: FC = {
      type: "FeatureCollection",
      features: fires.map((fire, i) => ({
        type: "Feature",
        id: i,
        geometry: {
          type: "Point",
          coordinates: [fire.longitude, fire.latitude],
        },
        properties: {
          confidence: fire.confidence,
          acq_date: fire.acq_date,
          acq_time: fire.acq_time,
          frp: fire.frp,
          timestamp: fire.timestamp,
        },
      })),
    };

    const source = mapRef.current.getSource("fires") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(fireFeatures);
    }
  }, [mapLoaded, fires, mapRef, loadingFires, fireError]);
}
