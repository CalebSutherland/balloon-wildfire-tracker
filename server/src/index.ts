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
const DAY_RANGE = 1;

app.use(cors({ origin: "http://localhost:5173" }));

const balloons: Record<string, number[][]> = {};

for (let i = 0; i < 24; i++) {
  const hour = String(i).padStart(2, "0");
  const res = await fetch(
    `https://a.windbornesystems.com/treasure/${hour}.json`
  );
  balloons[hour] = await res.json();
}

app.get("/api/treasure", (_req, res) => {
  res.json(balloons);
});

app.get("/api/wildfires", async (_req, res) => {
  try {
    const availUrl = `https://firms.modaps.eosdis.nasa.gov/api/data_availability/csv/${MAP_KEY}/${SATELLITE}`;
    const availRes = await fetch(availUrl);
    const availCsv = await availRes.text();
    const availability = parse(availCsv, {
      columns: true,
      skip_empty_lines: true,
    }) as AvailabilityRecord[];

    const latestDate = availability[0]?.max_date;
    if (!latestDate) {
      throw new Error("No max_date found for satellite");
    }

    const dataUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/${SATELLITE}/${REGION}/${DAY_RANGE}/${latestDate}`;
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
