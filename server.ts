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

  const apiKey = process.env.KOBIS_API_KEY || "fae42173511206256b61922e81229d4b";

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
  const apiKey = process.env.KOBIS_API_KEY || "fae42173511206256b61922e81229d4b";

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
  if (!apiKey || apiKey.trim() === "" || apiKey === "MY_GEMINI_API_KEY") {
    return res.status(401).json({ 
      error: "GEMINI_API_KEY가 설정되지 않았습니다. AI Studio 우측 상단의 'Settings' > 'Secrets' 패널에서 GEMINI_API_KEY를 등록해 주세요." 
    });
  }

  if (apiKey.trim().startsWith("AQ.")) {
    return res.status(401).json({ 
      error: "입력하신 키(AQ.로 시작하는 값)는 Google 내부/세션 토큰으로 보입니다. Gemini API를 사용하려면 'AIzaSy'로 시작하는 진짜 API 키가 필요합니다.\n\n[진짜 API 키 발급 방법]\n1. https://aistudio.google.com/ 에 접속합니다.\n2. 좌측 상단의 'Get API key' 버튼을 누릅니다.\n3. 'Create API key'를 클릭해 'AIzaSy'로 시작하는 새 키를 만듭니다.\n4. 복사한 키를 AI Studio 빌더 우측 상단 'Settings' > 'Secrets'에 'GEMINI_API_KEY' 이름으로 등록해 주세요!" 
    });
  }

  try {
    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    
    const prompt = `다음 영화에 대해 짧은 감상평을 바탕으로 상세하고 전문적인 영화 리뷰를 작성해줘.\n영화 제목: ${movieTitle}\n짧은 감상평: ${simpleReview}\n\n상세 감상평이 너무 길지 않게 2-3문단 정도로 자연스럽게 작성해줘.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ review: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    let errorMsg = "리뷰를 생성하는 도중 오류가 발생했습니다.";
    
    if (error?.status === 401 || (error?.message && error.message.includes("invalid authentication")) || (error?.message && error.message.includes("401"))) {
      errorMsg = "GEMINI_API_KEY가 올바르지 않습니다. AI Studio 우측 상단의 'Settings' > 'Secrets' 패널에서 올바른 API 키(AIzaSy...로 시작하는 키)가 설정되어 있는지 확인해 주세요.";
    } else if (error?.message) {
      errorMsg = `Gemini API 오류: ${error.message}`;
    }
    
    res.status(500).json({ error: errorMsg });
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

if (!process.env.VERCEL) {
  startServer();
}

export default app;
