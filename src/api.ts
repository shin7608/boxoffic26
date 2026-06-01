import { BoxOfficeResponse, DailyBoxOffice, MovieInfoResponse, MovieInfo } from "../types";

export const fetchBoxOffice = async (date: string): Promise<DailyBoxOffice[]> => {
  const targetDt = date.replace(/-/g, "");
  const res = await fetch(`/api/boxoffice?targetDt=${targetDt}`);
  if (!res.ok) {
    throw new Error("Failed to fetch box office data");
  }
  const data: BoxOfficeResponse = await res.json();
  if (data?.boxOfficeResult?.dailyBoxOfficeList) {
    return data.boxOfficeResult.dailyBoxOfficeList;
  }
  return [];
};

export const fetchMovieInfo = async (movieCd: string): Promise<MovieInfo> => {
  const res = await fetch(`/api/movie/${movieCd}`);
  if (!res.ok) {
    throw new Error("Failed to fetch movie info");
  }
  const data: MovieInfoResponse = await res.json();
  if (data?.movieInfoResult?.movieInfo) {
    return data.movieInfoResult.movieInfo;
  }
  throw new Error("Movie info not found");
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
