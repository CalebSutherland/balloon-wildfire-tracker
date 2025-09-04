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

        const data = await res.json();
        console.log(data);
        setFires(data);
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
