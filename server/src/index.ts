import express, { type Request, type Response } from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());

app.get("/api/treasure", async (_req: Request, res: Response) => {
  try {
    const response = await fetch(
      "https://a.windbornesystems.com/treasure/00.json"
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch treasure data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
