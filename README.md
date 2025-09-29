# WindBorne Fire Tracker

A small web app that visualizes weather balloons and recent wildfire detections (NASA FIRMS) over the past 24 hours. The repository contains a Vite + React TypeScript client and an Express TypeScript server that caches and exposes external data for the client.

## Highlights

- Live map visualization of balloon positions over 24 hours
- Fire detections from NASA FIRMS parsed and served as JSON
- Simple server-side caching and periodic updates

## Repository layout

- `client/` — Vite + React TypeScript front-end

  - `src/` — application source (main entry: `src/main.tsx`, UI in `src/App.tsx`)
  - `package.json` — client scripts and dependencies

- `server/` — Express TypeScript back-end
  - `src/index.ts` — server entry (fetches balloon & fire data and exposes API endpoints)
  - `package.json` — server scripts and dependencies

## Server API

The server fetches and caches data from two external sources and exposes two JSON endpoints used by the client.

- GET /api/treasure — returns the balloon cache, an object keyed by hour strings `"00"`..`"23"`. Each value is the raw balloon data fetched from the external service (arrays of coordinate-like samples).
- GET /api/wildfires — returns an array parsed from NASA FIRMS CSV (fields depend on FIRMS columns).

The server periodically refreshes this cache (every 10 minutes by default).

These endpoints are implemented in `server/src/index.ts`.

## Data sources

- Balloon data: the server fetches 24 hourly JSON files from `https://a.windbornesystems.com/treasure/{hour}.json` provided by WindBorne Systems.
- Wildfire data: the server fetches a FIRMS CSV from NASA (`https://firms.modaps.eosdis.nasa.gov/`) and parses it to JSON.
