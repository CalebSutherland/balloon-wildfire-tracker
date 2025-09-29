// Custom React hook to animate balloons on a Mapbox map over time
// - playing: whether the animation is currently running
// - speedHrsPerSec: animation speed in hours per second (default 2.0)
// - map: ref to the Mapbox map instance
// - balloonFCRef: ref to the current GeoJSON FeatureCollection of balloons
// - balloons: record of BalloonPoint arrays keyed by hour
// - selectedBalloonIndex: index of the balloon to track with the camera
//
// Responsibilities:
// - Animates balloons by interpolating positions between hourly data
// - Updates the balloon GeoJSON source on the map for each frame
// - Updates the internal "time" state representing the fractional hour
// - Smoothly moves the camera to follow the selected balloon (if any)
// - Uses requestAnimationFrame for smooth 60 FPS animation
// - Allows manual time updates via handleTimeChange
//
// Returns:
// - time: current fractional hour of the animation
// - handleTimeChange: function to manually set the animation time

import { useRef, useCallback, useState, useEffect } from "react";
import {
  createInterpolatedFeatures,
  getCameraPosition,
} from "../utils/balloon-interp";
import type { BalloonPoint } from "../types/types";

interface UseBalloonAnimationParams {
  playing: boolean;
  speedHrsPerSec?: number;
  map: React.RefObject<mapboxgl.Map | null>;
  balloonFCRef: React.RefObject<GeoJSON.FeatureCollection | null>;
  balloons: Record<string, BalloonPoint[]> | null;
  selectedBalloonIndex: number | null;
}

export function useBalloonAnimation({
  playing,
  speedHrsPerSec = 2.0,
  map,
  balloonFCRef,
  balloons,
  selectedBalloonIndex,
}: UseBalloonAnimationParams) {
  const timeRef = useRef(23);
  const rafRef = useRef<number | null>(null);
  const lastCamMsRef = useRef(0);
  const minFrameDelta = 1000 / 60;
  const lastFrameTimeRef = useRef(0);
  const [time, setTime] = useState(23);

  const updateTime = useCallback((newTime: number) => {
    timeRef.current = newTime;
    setTime(newTime);
  }, []);

  const handleTimeChange = useCallback(
    (t: number) => {
      updateTime(t);
    },
    [updateTime]
  );

  const updatePositions = useCallback(
    (fractionalHour: number) => {
      if (!balloons || !map.current) return;

      const features = createInterpolatedFeatures({
        fractionalHour,
        balloons,
      });

      balloonFCRef.current = { type: "FeatureCollection", features };

      const source = map.current.getSource("points") as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(balloonFCRef.current);
      }

      // Handle camera tracking
      if (selectedBalloonIndex !== null) {
        const nowMs = performance.now();
        const cameraHz = 6;
        const minCamDelta = 1000 / cameraHz;

        if (nowMs - lastCamMsRef.current >= minCamDelta) {
          const cameraPos = getCameraPosition(
            fractionalHour,
            balloons,
            selectedBalloonIndex
          );
          if (cameraPos) {
            map.current.easeTo({ center: [cameraPos.lon, cameraPos.lat] });
            lastCamMsRef.current = nowMs;
          }
        }
      }
    },
    [balloons, selectedBalloonIndex, map]
  );

  useEffect(() => {
    if (!playing) return;

    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      const newTime = (timeRef.current - dt * speedHrsPerSec + 24) % 24;
      timeRef.current = newTime;

      if (now - lastFrameTimeRef.current >= minFrameDelta) {
        updateTime(newTime);
        updatePositions(newTime);
        lastFrameTimeRef.current = now;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing, speedHrsPerSec, updateTime, updatePositions]);

  useEffect(() => {
    if (!playing) {
      updatePositions(time);
    }
  }, [time, updatePositions]);

  return { time, handleTimeChange };
}
