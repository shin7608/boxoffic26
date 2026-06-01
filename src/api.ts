import { BoxOfficeResponse, DailyBoxOffice, MovieInfoResponse, MovieInfo } from "./types";

const KOBIS_API_KEY = "fae42173511206256b61922e81229d4b";

export const fetchBoxOffice = async (date: string): Promise<DailyBoxOffice[]> => {
  const targetDt = date.replace(/-/g, "");
  
  try {
    // Try the server /api proxy first
    const res = await fetch(`/api/boxoffice?targetDt=${targetDt}`);
    if (res.ok) {
      const data: BoxOfficeResponse = await res.json();
      if (data?.boxOfficeResult?.dailyBoxOfficeList) {
        return data.boxOfficeResult.dailyBoxOfficeList;
      }
    } else {
      console.warn(`Server proxy returned non-OK status: ${res.status}. Falling back to direct KOBIS API...`);
    }
  } catch (err) {
    console.warn("Proxy box office fetch failed, falling back to direct KOBIS API fetch:", err);
  }

  // Fallback: Direct client-side call to KOBIS OpenAPI
  try {
    console.log("Directly calling KOBIS API for daily box office...");
    const directRes = await fetch(`https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${targetDt}`);
    if (!directRes.ok) {
      throw new Error(`Direct KOBIS API response status: ${directRes.status}`);
    }
    const data: BoxOfficeResponse = await directRes.json();
    if (data?.boxOfficeResult?.dailyBoxOfficeList) {
      return data.boxOfficeResult.dailyBoxOfficeList;
    }
  } catch (directErr: any) {
    console.error("Direct KOBIS API fetch failed:", directErr);
  }

  throw new Error("Failed to fetch box office data from both server proxy and direct KOBIS OpenAPI.");
};

export const fetchMovieInfo = async (movieCd: string): Promise<MovieInfo> => {
  try {
    // Try the server /api proxy first
    const res = await fetch(`/api/movie/${movieCd}`);
    if (res.ok) {
      const data: MovieInfoResponse = await res.json();
      if (data?.movieInfoResult?.movieInfo) {
        return data.movieInfoResult.movieInfo;
      }
    } else {
      console.warn(`Server proxy returned non-OK status: ${res.status}. Falling back to direct KOBIS API...`);
    }
  } catch (err) {
    console.warn("Proxy movie fetch failed, falling back to direct KOBIS API fetch:", err);
  }

  // Fallback: Direct client-side call to KOBIS OpenAPI
  try {
    console.log("Directly calling KOBIS API for movie details...");
    const directRes = await fetch(`https://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${KOBIS_API_KEY}&movieCd=${movieCd}`);
    if (!directRes.ok) {
      throw new Error(`Direct KOBIS API response status: ${directRes.status}`);
    }
    const data: MovieInfoResponse = await directRes.json();
    if (data?.movieInfoResult?.movieInfo) {
      return data.movieInfoResult.movieInfo;
    }
  } catch (directErr: any) {
    console.error("Direct KOBIS API fetch failed:", directErr);
  }

  throw new Error("Failed to fetch movie info from both server proxy and direct KOBIS OpenAPI.");
};

export const generateReview = async (movieTitle: string, simpleReview: string): Promise<string> => {
  const res = await fetch('/api/generate-review', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ movieTitle, simpleReview })
  });
  
  if (!res.ok) {
    try {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to generate review");
    } catch (e: any) {
      throw new Error(e.message || "Failed to generate review");
    }
  }

  const data = await res.json();
  return data.review;
};
