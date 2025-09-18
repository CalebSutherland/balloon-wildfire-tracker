import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { BalloonPoint, FC, FireRecord } from "../types/types";

export function useMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  fires: FireRecord[],
  balloons: Record<string, BalloonPoint[]>
) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [selectedBalloon, setSelectedBalloon] =
    useState<mapboxgl.TargetFeature | null>(null);
  const selectedBalloonRef = useRef<mapboxgl.TargetFeature | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      center: [-123, 44],
      zoom: 3,
    });

    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.FullscreenControl());

    map.on("load", () => {
      map.addSource("fires", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "fires-layer",
        type: "circle",
        source: "fires",
        paint: {
          "circle-radius": 2,
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "frp"],
            0,
            "#ffff00",
            5,
            "#ff7b00",
            20,
            "#ff0000",
            50,
            "#8b0000",
          ],
        },
      });

      map.addSource("points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

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
            12,
            ["boolean", ["feature-state", "highlight"], false],
            12,
            8,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addInteraction("click", {
        type: "click",
        target: { layerId: "points-layer" },
        handler: ({ feature }: { feature?: mapboxgl.TargetFeature }) => {
          if (!feature) return;

          if (selectedBalloonRef.current) {
            map.setFeatureState(
              { source: "points", id: selectedBalloonRef.current.id! },
              {
                selected: false,
              }
            );
          }
          map.setFeatureState(feature, { selected: true });
          setSelectedBalloon(feature);
          selectedBalloonRef.current = feature;
        },
      });

      map.addInteraction("map-click", {
        type: "click",
        handler: () => {
          if (selectedBalloonRef.current) {
            map.setFeatureState(
              {
                source: "points",
                id: selectedBalloonRef.current.id!,
              },
              {
                selected: false,
              }
            );
            setSelectedBalloon(null);
            selectedBalloonRef.current = null;
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
  }, [containerRef]);

  //Add fire data points
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !fires.length) return;

    const fireFeatures: FC = {
      type: "FeatureCollection",
      features: fires.map((fire, i) => ({
        type: "Feature",
        id: i,
        geometry: {
          type: "Point",
          coordinates: [parseFloat(fire.longitude), parseFloat(fire.latitude)],
        },
        properties: {
          confidence: fire.confidence,
          acq_date: fire.acq_date,
          acq_time: fire.acq_time,
          frp: parseFloat(fire.frp),
        },
      })),
    };

    const source = mapRef.current.getSource("fires") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(fireFeatures);
    }
  }, [mapLoaded, fires, mapRef]);

  //Add balloon data points
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

    const source = mapRef.current.getSource("points") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(balloonFeatures);
    }
  }, [mapLoaded, balloons, mapRef]);

  return {
    map: mapRef,
    mapLoaded,
    selectedBalloon,
    setSelectedBalloon,
    selectedBalloonRef,
  };
}
