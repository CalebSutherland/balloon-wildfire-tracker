import express, { type Request, type Response } from "express";
import cors from "cors";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const clientUrl = process.env.CLIENT_URL;

const MAP_KEY = process.env.FIRMS_MAP_KEY!;
const SATELLITE = "VIIRS_SNPP_NRT";
const REGION = "world";
const DAY_RANGE = 2;

app.use(cors({ origin: clientUrl }));

let balloonsCache: Record<string, number[][]> = {};
let firesCache: any[] = [];

async function fetchBalloons(): Promise<Record<string, number[][]>> {
  const newBalloons: Record<string, number[][]> = {};

  for (let i = 0; i < 24; i++) {
    const hour = String(i).padStart(2, "0");
    const url = `https://a.windbornesystems.com/treasure/${hour}.json`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} at ${url}`);
    }

    newBalloons[hour] = await res.json();
  }

  return newBalloons;
}

async function fetchFires(): Promise<any[]> {
  const dataUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/${SATELLITE}/${REGION}/${DAY_RANGE}`;
  const fireRes = await fetch(dataUrl);
  if (!fireRes.ok) throw new Error("Failed to fetch FIRMS fire data");

  const fireCsv = await fireRes.text();
  return parse(fireCsv, { columns: true, skip_empty_lines: true });
}

async function updateBalloons() {
  try {
    const newData = await fetchBalloons();
    balloonsCache = newData;
    console.log("Balloons cache updated");
  } catch (err) {
    console.error("Failed to update balloons cache (keeping old cache):", err);
  }
}

async function updateFires() {
  try {
    const newData = await fetchFires();
    firesCache = newData;
    console.log("Fires cache updated");
  } catch (err) {
    console.error("Error updating fires cache:", err);
  }
}

await updateBalloons();
await updateFires();

setInterval(updateBalloons, 10 * 60 * 1000);
setInterval(updateFires, 10 * 60 * 1000);

app.get("/api/treasure", (_req, res) => {
  res.json(balloonsCache);
});

app.get("/api/wildfires", (_req, res) => {
  res.json(firesCache);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
