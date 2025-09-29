import { useEffect } from "react";
import type { FC, FireRecord } from "../types/types";

export default function useFires(
  mapRef: React.RefObject<mapboxgl.Map | null>,
  mapLoaded: boolean,
  fires: FireRecord[],
  loadingFires: boolean
) {
  //Add fire data points
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !fires.length || loadingFires) return;

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
          frp: parseFloat(fire.frp),
          timestamp: fire.timestamp,
        },
      })),
    };

    const source = mapRef.current.getSource("fires") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(fireFeatures);
    }
  }, [mapLoaded, fires, mapRef, loadingFires]);
}
