import axios from "axios";

const axiosInstance = axios.create({
  // CRA proxy를 쓰니까 baseURL 필요 없음 ("/auth/login" -> proxy로 8080)

  baseURL: "/api",       // 불필요하게 api를 안 붙이기 위해 사용함
  withCredentials: true, // 쿠키 안 쓰면 빼도 됨
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
