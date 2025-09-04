import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

export function useMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  {
    selectedBalloonRef,
    setSelectedBalloon,
  }: {
    selectedBalloonRef: React.RefObject<mapboxgl.TargetFeature | null>;
    setSelectedBalloon: (f: mapboxgl.TargetFeature | null) => void;
  }
) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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
          "circle-color": "#ff5722",
          "circle-radius": 2,
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
            16,
            ["boolean", ["feature-state", "highlight"], false],
            16,
            12,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // map.addLayer({
      //   id: "points-label",
      //   type: "symbol",
      //   source: "points",
      //   layout: {
      //     "text-field": ["get", "index"],
      //     "text-size": 10,
      //     "text-anchor": "center",
      //     "text-allow-overlap": true,
      //   },
      //   paint: {
      //     "text-color": "#fff",
      //   },
      // });

      map.addInteraction("click", {
        type: "click",
        target: { layerId: "points-layer" },
        handler: ({ feature }: { feature?: mapboxgl.TargetFeature }) => {
          if (!feature) return;

          if (selectedBalloonRef.current) {
            map.setFeatureState(selectedBalloonRef.current, {
              selected: false,
            });
          }
          map.setFeatureState(feature, { selected: true });
          setSelectedBalloon(feature);
        },
      });

      map.addInteraction("map-click", {
        type: "click",
        handler: () => {
          if (selectedBalloonRef.current) {
            map.setFeatureState(selectedBalloonRef.current, {
              selected: false,
            });
            setSelectedBalloon(null);
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

  return { map: mapRef, mapLoaded };
}
