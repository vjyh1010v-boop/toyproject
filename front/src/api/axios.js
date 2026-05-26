import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // 쿠키(Refresh Token)를 주고받으려면 필수!
});

// 요청 인터셉터: 서버로 가기 전에 토큰 가로채서 끼워넣기
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // 또는 전역 상태
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
