import express, { type Request, type Response } from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
