import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",       // 불필요하게 api를 안 붙이기 위해 사용함
  withCredentials: true, // 쿠키 안 쓰면 빼도 됨
});

// axios 개체 인터셉터
axiosInstance.interceptors.request.use((config) => {
  // localstorage에서 token 가져오기
  const token = localStorage.getItem("accessToken");

  // 토큰이 있을 경우 Bearer 첨부
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // 
  return config;
});

export default axiosInstance;
