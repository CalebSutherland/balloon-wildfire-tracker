import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { BalloonPoint, FC, FireRecord } from "../types/types";
import { normailzeLineCoords, subdivideSegment } from "../utils/utils";
import * as geokdbush from "geokdbush";
import type KDBush from "kdbush";

export function useMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  fires: FireRecord[],
  fireIndexRef: React.RefObject<KDBush | null>,
  balloons: Record<string, BalloonPoint[]>
) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const balloonFCRef = useRef<GeoJSON.FeatureCollection | null>(null);
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
            "#450000", // < 1 hour
            1,
            "#830000", // 1–3 hours
            3,
            "#ff0000", // 3–6 hours
            6,
            "#ff9b20", // 6–12 hours
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

    balloonFCRef.current = balloonFeatures;

    const source = mapRef.current.getSource("points") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(balloonFeatures);
    }
  }, [mapLoaded, balloons, mapRef]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !selectedBalloon) return;

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

    const maxStepKm = 10; // maximum distance per subsegment
    const segments: GeoJSON.Feature<GeoJSON.LineString>[] = [];

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
            1,
            50
          ) as number[];
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

    source.setData({ type: "FeatureCollection", features: segments });
  }, [mapLoaded, balloons, selectedBalloon, fires]);

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
