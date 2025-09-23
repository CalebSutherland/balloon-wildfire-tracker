import express, { type Request, type Response } from "express";
import cors from "cors";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";

type AvailabilityRecord = {
  data_id: string;
  min_date: string;
  max_date: string;
};

dotenv.config();

const app = express();

const PORT = 5000;

const MAP_KEY = process.env.FIRMS_MAP_KEY;
const SATELLITE = "VIIRS_SNPP_NRT";
const REGION = "world";
const DAY_RANGE = 2;

app.use(cors({ origin: "http://localhost:5173" }));

const balloons: Record<string, number[][]> = {};

async function loadBalloons() {
  for (let i = 0; i < 24; i++) {
    const hour = String(i).padStart(2, "0");
    const url = `https://a.windbornesystems.com/treasure/${hour}.json`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} at ${url}`);
      }
      balloons[hour] = await res.json();
    } catch (err) {
      console.error(`Failed to load balloon data for hour ${hour}:`, err);
      balloons[hour] = [];
    }
  }
}

await loadBalloons();

app.get("/api/treasure", (_req, res) => {
  res.json(balloons);
});

app.get("/api/wildfires", async (_req, res) => {
  try {
    const dataUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/${SATELLITE}/${REGION}/${DAY_RANGE}`;
    const fireRes = await fetch(dataUrl);
    if (!fireRes.ok) throw new Error("Failed to fetch FIRMS fire data");

    const fireCsv = await fireRes.text();
    const records = parse(fireCsv, { columns: true, skip_empty_lines: true });

    res.json(records);
  } catch (err) {
    console.error("Error fetching FIRMS data:", err);
    res.status(500).json({ error: "Unable to fetch FIRMS data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
