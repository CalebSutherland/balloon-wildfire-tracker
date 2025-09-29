// Custom React hook to fetch and process FIRMS wildfire data from the backend
// - Fetches from GET /api/wildfires
// - Converts fire date/time strings into a timestamp (seconds since Unix epoch)
// - Builds a KDBush spatial index for fast nearest-neighbor queries
// - Manages loading and error state
//
// Returns an object with:
// - fires: FireRecord[] — array of processed fire records
// - loadingFires: boolean — true while fetching data
// - fireError: boolean — true if fetch or processing failed
// - fireIndexRef: useRef<KDBush | null> — spatial index of fire locations

import { useEffect, useRef, useState } from "react";
import KDBush from "kdbush";
import type { FireRecord } from "../types/types";

export function getFires() {
  const [fires, setFires] = useState<FireRecord[]>([]);
  const [loadingFires, setLoadingFires] = useState(true);
  const [fireError, setFireError] = useState(false);
  const fireIndexRef = useRef<KDBush | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchFires() {
      try {
        const res = await fetch(`${apiUrl}/api/wildfires`);
        if (!res.ok) throw new Error("Failed to fetch fire data");
        const data: FireRecord[] = await res.json();

        const processed: FireRecord[] = data.map((fire) => {
          const [year, month, day] = fire.acq_date.split("-").map(Number);
          const acqTimeStr = fire.acq_time.padStart(4, "0"); // HHMM
          const hour = parseInt(acqTimeStr.slice(0, 2), 10);
          const minute = parseInt(acqTimeStr.slice(2), 10);
          return {
            ...fire,
            timestamp: Date.UTC(year, month - 1, day, hour, minute) / 1000,
          };
        });

        // Build KDBush index: create sized index, add each point, finish()
        const idx = new KDBush(processed.length);
        processed.forEach((p: FireRecord) => {
          idx.add(p.longitude, p.latitude);
        });
        idx.finish();

        fireIndexRef.current = idx;
        setFires(processed);
        setLoadingFires(false);
      } catch (err) {
        console.error("Error fetching fires:", err);
        setFireError(true);
      }
    }

    fetchFires();
  }, []);

  return { fires, loadingFires, fireError, fireIndexRef };
}
