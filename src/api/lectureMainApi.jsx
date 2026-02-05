import axios from "axios";

// 강의 개수 조회
export const fetchLectureCounts = () => axios.get("/api/lectures/count");

// 인기 강의 조회
export const fetchPopularLectures = (langId) =>
  axios.get("/api/lectures/popular", { params: { lgType: langId } });
