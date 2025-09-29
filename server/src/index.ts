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

async function scheduleUpdate(
  updateFn: () => Promise<void>,
  name: string,
  intervalMs = 10 * 60 * 1000,
  retryMs = 30 * 1000
) {
  try {
    await updateFn();
    console.log(`${name} cache updated successfully`);
    setTimeout(
      () => scheduleUpdate(updateFn, name, intervalMs, retryMs),
      intervalMs
    );
  } catch (err) {
    console.error(
      `Error updating ${name} cache, retrying in ${retryMs / 1000}s:`,
      err
    );
    setTimeout(
      () => scheduleUpdate(updateFn, name, intervalMs, retryMs),
      retryMs
    );
  }
}

async function updateBalloons() {
  const newData = await fetchBalloons();
  balloonsCache = newData;
}

async function updateFires() {
  const newData = await fetchFires();
  firesCache = newData;
}

scheduleUpdate(updateBalloons, "Balloons");
scheduleUpdate(updateFires, "Fires");

app.get("/api/treasure", (_req, res) => {
  if (!balloonsCache || Object.keys(balloonsCache).length === 0) {
    return res.status(503).json({ error: "Balloon data not available yet" });
  }
  res.json(balloonsCache);
});

app.get("/api/wildfires", (_req, res) => {
  if (!firesCache || firesCache.length === 0) {
    return res.status(503).json({ error: "Fire data not available yet" });
  }
  res.json(firesCache);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
