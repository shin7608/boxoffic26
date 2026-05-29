import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = 3000;

// Set up KOBIS API proxy routes
app.get("/api/boxoffice", async (req, res) => {
  const targetDt = req.query.targetDt;
  if (!targetDt) {
     return res.status(400).json({ error: "targetDt parameter is required" });
  }

  const apiKey = process.env.KOBIS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "KOBIS_API_KEY environment variable is not configured." });
  }

  try {
    const response = await fetch(`http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${apiKey}&targetDt=${targetDt}`);
    if (!response.ok) {
      throw new Error(`KOBIS API Error: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Box office API error:", error);
    res.status(500).json({ error: "Failed to fetch from KOBIS API" });
  }
});

app.get("/api/movie/:movieCd", async (req, res) => {
  const movieCd = req.params.movieCd;
  const apiKey = process.env.KOBIS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "KOBIS_API_KEY environment variable is not configured." });
  }

  try {
    const response = await fetch(`http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${apiKey}&movieCd=${movieCd}`);
    if (!response.ok) {
      throw new Error(`KOBIS API Error: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Movie info API error:", error);
    res.status(500).json({ error: "Failed to fetch movie info from KOBIS API" });
  }
});

app.post("/api/generate-review", async (req, res) => {
  const { movieTitle, simpleReview } = req.body;
  if (!movieTitle || !simpleReview) {
     return res.status(400).json({ error: "movieTitle and simpleReview are required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `다음 영화에 대해 짧은 감상평을 바탕으로 상세하고 전문적인 영화 리뷰를 작성해줘.\n영화 제목: ${movieTitle}\n짧은 감상평: ${simpleReview}\n\n상세 감상평이 너무 길지 않게 2-3문단 정도로 자연스럽게 작성해줘.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ review: response.text });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to generate review" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
