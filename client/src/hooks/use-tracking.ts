import { useState, useCallback, useEffect } from "react";

export function useTracking(selectedBalloon: any) {
  const [tracking, setTracking] = useState(false);

  const handleTracking = useCallback(() => {
    if (selectedBalloon === null) return;
    setTracking((prev) => !prev);
  }, [selectedBalloon]);

  useEffect(() => {
    if (tracking && selectedBalloon === null) {
      setTracking(false);
    }
  }, [selectedBalloon, tracking]);

  return { tracking, handleTracking };
}
