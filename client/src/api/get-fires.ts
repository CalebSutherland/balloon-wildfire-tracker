// useFires.ts
import { useEffect, useRef, useState } from "react";
import KDBush from "kdbush";
import type { FireRecord } from "../types/types";

type FireWithTime = FireRecord & {
  timestamp: number;
};

export function getFires() {
  const [fires, setFires] = useState<FireWithTime[]>([]);
  const [loading, setLoading] = useState(true);
  const fireIndexRef = useRef<KDBush | null>(null);

  useEffect(() => {
    async function fetchFires() {
      try {
        const res = await fetch("http://localhost:5000/api/wildfires");
        if (!res.ok) throw new Error("Failed to fetch fire data");
        const data: FireRecord[] = await res.json();

        const processed: FireWithTime[] = data.map((fire) => {
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
        processed.forEach((p: FireWithTime) => {
          idx.add(p.longitude, p.latitude);
        });
        idx.finish();

        fireIndexRef.current = idx;
        setFires(processed);
      } catch (err) {
        console.error("Error fetching fires:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFires();
  }, []);

  return { fires, loading, fireIndexRef };
}
