import { useRef, useEffect, useState, useCallback } from "react";

// hooks/use-animation.ts
export function useAnimation(playing: boolean, speedHrsPerSec = 2.0) {
  const timeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [time, setTime] = useState(0);

  const updateTime = useCallback((newTime: number) => {
    timeRef.current = newTime;
    setTime(newTime);
  }, []);

  useEffect(() => {
    if (!playing) return;

    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const newTime = (timeRef.current + dt * speedHrsPerSec + 24) % 24;
      updateTime(newTime);
      rafRef.current = requestAnimationFrame(step);
    };

    last = performance.now();
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing, speedHrsPerSec, updateTime]);

  const handleTimeChange = useCallback(
    (t: number) => {
      updateTime(t);
    },
    [updateTime]
  );

  return { time, handleTimeChange };
}
