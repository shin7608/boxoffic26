export interface DailyBoxOffice {
  rnum: string;
  rank: string;
  rankInten: string;
  rankOldAndNew: string;
  movieCd: string;
  movieNm: string;
  openDt: string;
  salesAmt: string;
  salesShare: string;
  salesInten: string;
  salesChange: string;
  salesAcc: string;
  audiCnt: string;
  audiInten: string;
  audiChange: string;
  audiAcc: string;
  scrnCnt: string;
  showCnt: string;
}

export interface BoxOfficeResponse {
  boxOfficeResult: {
    boxofficeType: string;
    showRange: string;
    dailyBoxOfficeList: DailyBoxOffice[];
  };
}

export interface MovieInfo {
  movieCd: string;
  movieNm: string;
  movieNmEn: string;
  movieNmOg: string;
  showTm: string;
  prdtYear: string;
  openDt: string;
  prdtStatNm: string;
  typeNm: string;
  nations: { nationNm: string }[];
  genres: { genreNm: string }[];
  directors: { peopleNm: string, peopleNmEn: string }[];
  actors: { peopleNm: string, peopleNmEn: string, cast: string, castEn: string }[];
  showTypes: { showTypeGroupNm: string, showTypeNm: string }[];
  companys: { companyCd: string, companyNm: string, companyNmEn: string, companyPartNm: string }[];
  audits: { auditNo: string, watchGradeNm: string }[];
  staffs: { peopleNm: string, peopleNmEn: string, staffRoleNm: string }[];
}

export interface MovieInfoResponse {
  movieInfoResult: {
    movieInfo: MovieInfo;
    source: string;
  };
}
