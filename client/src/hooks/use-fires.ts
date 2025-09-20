import { useEffect, useState } from "react";
import type { FireRecord } from "../types/types";

export function useFires() {
  const [fires, setFires] = useState<FireRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFires() {
      try {
        const res = await fetch("http://localhost:5000/api/wildfires");
        if (!res.ok) throw new Error("Failed to fetch fire data");

        const data: FireRecord[] = await res.json();

        const processed = data.map((fire) => {
          const [year, month, day] = fire.acq_date.split("-").map(Number);
          const acqTimeStr = fire.acq_time.padStart(4, "0"); // HHMM
          const hour = parseInt(acqTimeStr.slice(0, 2), 10);
          const minute = parseInt(acqTimeStr.slice(2), 10);
          return {
            ...fire,
            timestamp: Date.UTC(year, month - 1, day, hour, minute) / 1000, // in seconds
          };
        });

        console.log(processed);
        setFires(processed);
      } catch (err) {
        console.error("Error fetching fires:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFires();
  }, []);

  return { fires, loading };
}
