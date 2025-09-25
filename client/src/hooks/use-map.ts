import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { BalloonPoint, FireRecord } from "../types/types";
import type KDBush from "kdbush";
import { useBalloons } from "./use-balloons";
import useFires from "./use-fires";
import usePath from "./use-path";

export function useMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  fires: FireRecord[],
  fireIndexRef: React.RefObject<KDBush | null>,
  balloons: Record<string, BalloonPoint[]>
) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [selectedBalloon, setSelectedBalloon] =
    useState<mapboxgl.TargetFeature | null>(null);
  const selectedBalloonRef = useRef<mapboxgl.TargetFeature | null>(null);

  function selectBalloonByIndex(index: number) {
    if (!mapRef.current) return;

    const sourceId = "points";

    if (selectedBalloonRef.current) {
      mapRef.current.setFeatureState(selectedBalloonRef.current, {
        selected: false,
      });
    }

    mapRef.current.setFeatureState(
      { source: sourceId, id: index },
      { selected: true }
    );

    const feature =
      balloonFCRef.current?.features.find((f) => f.id === index) ?? null;
    setSelectedBalloon(feature as mapboxgl.TargetFeature | null);

    selectedBalloonRef.current = feature as mapboxgl.TargetFeature | null;
  }

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
      // fire points
      map.addSource("fires", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      const nowInSeconds = Math.floor(Date.now() / 1000);

      map.addLayer({
        id: "fires-layer",
        type: "circle",
        source: "fires",
        paint: {
          "circle-radius": 2,
          "circle-color": [
            "step",
            [
              "/",
              ["-", nowInSeconds, ["to-number", ["get", "timestamp"]]],
              3600,
            ],
            "#9f1818", // < 1 hour
            1,
            "#ca0000", // 1–3 hours
            3,
            "#ff4400", // 3–6 hours
            6,
            "#ffab3d", // 6–12 hours
            12,
            "#fff93d", // 12–24 hours
            24,
            "#ffffa5",
          ],
        },
      });

      // balloon path
      map.addSource("balloonPath", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "balloonPath-border",
        type: "line",
        source: "balloonPath",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#ffffff",
          "line-width": 7,
        },
      });

      map.addLayer({
        id: "balloonPath-layer",
        type: "line",
        source: "balloonPath",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 3,
        },
      });

      // balloon points
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

            const source = map.getSource(
              "balloonPath"
            ) as mapboxgl.GeoJSONSource;
            if (source) {
              source.setData({
                type: "FeatureCollection",
                features: [],
              });
            }
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

  // hooks to load data layers
  const { balloonFCRef } = useBalloons(mapRef, mapLoaded, balloons);
  useFires(mapRef, mapLoaded, fires);
  usePath(mapRef, mapLoaded, selectedBalloon, balloons, fires, fireIndexRef);

  return {
    map: mapRef,
    mapLoaded,
    selectedBalloon,
    setSelectedBalloon,
    selectedBalloonRef,
    balloonFCRef,
    selectBalloonByIndex,
  };
}
